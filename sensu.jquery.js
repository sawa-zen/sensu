(function ($) {

  var pluginName = 'sensu',
      degToRad = Math.PI / 180,
      defaults = {
        roop: true,
        autoplay: false,
        autoplaySpeed: 5000
      };


  /**
   * メインクラス
   */
  function Sensu(element, options) {
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._stage = null;
    this.el = element;
    this.initialize();
  }

  // 初期化
  Sensu.prototype.initialize = function() {
    var _this = this;

    // createjsのステージを用意
    _this._stage = new createjs.Stage(this.el.id);
    _this._stage.enableMouseOver(10);

    // スライダーを生成
    var slider = new Slider({
      roop: _this.settings.roop
    });
    slider.width = this.el.width;
    slider.height = this.el.height;
    _this._stage.addChild(slider);

    // クリックされたらページ紐付いているurlを開く
    slider.on('click', function() {
      var url = slider.getCurrentPage().url;
      if(!url) {
        return;
      }
      window.open(slider.getCurrentPage().url);
    });

    // autoplayが許可されていれば再生する
    if(_this.settings.autoplay) {
      setInterval(function() {
        slider.goNext();
      }, _this.settings.autoplaySpeed);
    }


    // コントローラ
    var controller = new Controller({
      width: this.el.width,
      height: this.el.height
    });
    _this._stage.addChild(controller);

    // 戻るボタンクリック
    controller.on('prevclick', function() {
      slider.goPrev();
    });

    // 次へボタン
    controller.on('nextclick', function() {
      slider.goNext();
    });


    // canvasの描画設定
    // 30fpsで描画を繰り返す
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener('tick', function () {
      _this._stage.update();
    });


    // LoadQueueクラス
    var loadQueue = new createjs.LoadQueue();
    // 一つのファイル毎のcallback
    loadQueue.addEventListener('complete', function() {
      // スライダーにページセット
      slider.setPages(loadQueue.getItems());
    });
    // 読み込み開始
    loadQueue.loadManifest(_this.settings.list);
  };




  /**
   * スライダークラス
   */
  function Slider(params) {
    var _this = this;
    _this.Container_constructor();

    // 初期化
    $.extend(_this, params);
    _this.currentPage = 0;
    _this.pages = [];
    _this.isMoving = false;

    // ページング終了を監視
    _this.on('afteranimate', function() {
      _this.isMoving = false;
    });
  }

  // Containerクラスを継承
  createjs.extend(Slider, createjs.Container);

  // 現在のページを取得
  Slider.prototype.getCurrentPage = function() {
    return this.pages[this.currentPage];
  };

  // ページのセット
  Slider.prototype.setPages = function(list) {
    list = list || [];
    var _this = this;

    // 重ね順の関係でlistを逆順に
    list.reverse();

    // listの数分pageを生成
    list.forEach(function(row) {
      var page = _this._createPage(row.result);
      page.url = row.item.url;
      _this.pages.unshift(page);
      _this.addChild(page);
    });
  };

  // ページの生成
  Slider.prototype._createPage = function(img) {
    var _this = this;
    var page = new Page(img);

    // ページのアニメーション開始を監視
    page.on('beforeanimate', function() {
      // イベントをバブリング
      _this.dispatchEvent('beforeanimate');
    });

    // ページのアニメーション終了を監視
    page.on('afteranimate', function() {
      // イベントをバブリング
      _this.dispatchEvent('afteranimate');
    });

    return page;
  };

  // 前のページへ
  Slider.prototype.goPrev = function() {
    var _this = this;
    var prevPageIndex = _this.currentPage - 1;

    // アニメーション中であれば処理しない
    if(_this.isMoving) {
      return;
    }

    // roopが禁止且つ前のページがなければ処理しない
    if(!_this.roop && !_this.pages[prevPageIndex]) {
      return;
    }

    // アニメーション中にフラグを変更
    _this.isMoving = true;

    // 先頭ページだった場合は最後のスライドを出す
    if(prevPageIndex < 0) {
      prevPageIndex = _this.getNumChildren() - 1;
    }

    // 前のページを予め閉じておく
    _this.pages[prevPageIndex].nonAnimClose();

    // 重なりを調節
    _this.setChildIndex(_this.pages[prevPageIndex], _this.getNumChildren() - 1);
    _this.setChildIndex(_this.getCurrentPage(), _this.getNumChildren() - 2);

    // 前のページを開く
    _this.pages[prevPageIndex].open();

    // カレントページを更新
    _this.currentPage = prevPageIndex;
  };

  // 次のページへ
  Slider.prototype.goNext = function() {
    var _this = this;
    var nextPageIndex = _this.currentPage + 1;

    // アニメーション中であれば処理しない
    if(_this.isMoving) {
      return;
    }

    // roopが禁止且つ次のページがなければ処理しない
    if(!_this.roop && !_this.pages[nextPageIndex]) {
      return;
    }

    // アニメーション中にフラグを変更
    _this.isMoving = true;

    // 最後ページだった場合は最初のページを出す
    if(_this.getNumChildren() - 1 < nextPageIndex) {
      nextPageIndex = 0;
    }

    // 次のページを予め開いておく
    _this.pages[nextPageIndex].nonAnimOpen();

    // 重なりを調節
    _this.setChildIndex(_this.getCurrentPage(), _this.getNumChildren() - 1);
    _this.setChildIndex(_this.pages[nextPageIndex], _this.getNumChildren() - 2);

    // カレントページを閉じる
    _this.pages[_this.currentPage].close();

    // カレントページの更新
    _this.currentPage = nextPageIndex;
  };

  createjs.promote(Slider, 'Container');




  /**
   * ページクラス
   */
  function Page(img) {
    var _this = this;

    _this.Container_constructor();

    // 初期化
    _this.img = img;
    _this.width = img.width;
    _this.height = img.height;
    _this.angle = 0;
    _this.sliceCount = 10;
    _this.sliceWidth = _this.width / _this.sliceCount;

    // スライスをセット
    _this._setSlices();

    // アニメーション終了を監視
    _this.on('afteranimate', function() {
      // tickに登録されている開閉アニメーションを削除
      _this.removeAllEventListeners('tick');
    });
  }

  // Containerクラスを継承
  createjs.extend(Page, createjs.Container);

  // 初期化
  Page.prototype._setSlices = function() {
    var _this = this;
    // スライス数分画像を分割して生成
    for (var index = 0; index < _this.sliceCount; index++) {
      var slice = new Slice(_this.img, _this.sliceWidth, index);
      _this.addChild(slice);
    }
  };

  // アニメーション無しで開く
  Page.prototype.nonAnimOpen = function() {
    var _this = this;

    // スライス全てを立ち上がらせる
    _this.angle = 0;
    _this.children.forEach(function(slice) {
      slice.updateFromAngle(_this.angle);
    });
  };

  // 開く
  Page.prototype.open = function() {
    var _this = this;

    // アニメーション開始イベントを発火
    _this.dispatchEvent('beforeanimate');

    var handleTick = function() {
      if(_this.angle < 0) {
        // アニメーション終了イベントを発火
        _this.dispatchEvent('afteranimate');
        return;
      }
      // スライス全てを立ち上がらせる
      _this.children.forEach(function(slice) {
        slice.updateFromAngle(_this.angle);
      });
      // 度数のデクリメント
      _this.angle--;
    };

    // 開くアニメーション用にtickイベント追加
    _this.on('tick', handleTick);
  };

  // アニメーション無しで閉じる
  Page.prototype.nonAnimClose = function() {
    var _this = this;
    // スライス全てを閉じる
    _this.angle = 90;
    _this.children.forEach(function(slice) {
      slice.updateFromAngle(_this.angle);
    });
  };

  // 閉じる
  Page.prototype.close = function() {
    var _this = this;

    // アニメーション開始イベントを発火
    _this.dispatchEvent('beforeanimate');

    var handleTick = function() {
      if(_this.angle > 90) {
        // アニメーション終了イベントを発火
        _this.dispatchEvent('afteranimate');
        return;
      }
      // スライス全てを立たせる
      _this.children.forEach(function(slice) {
        slice.updateFromAngle(_this.angle);
      });
      // 度数のインクリメント
      _this.angle++;
    };

    // 閉じるアニメーション用にtickイベント追加
    _this.on('tick', handleTick);
  };

  createjs.promote(Page, 'Container');




  /**
   * スライスクラス
   */
  function Slice(img, width, index) {
    this.Bitmap_constructor(img);
    this.x = width * index;
    this.index = index;
    this.width = width;
    this.height = img.height;
    this.sourceRect = new createjs.Rectangle(
      width * index, 0, width, img.height
    );
    this.isMoving = false;
  }

  // Bitmapクラスを継承
  createjs.extend(Slice, createjs.Bitmap);

  // 傾きからx軸の値を計算
  Slice.prototype._calXposFromAngle = function(angle) {
    return (this.width * Math.cos(angle * degToRad)) * this.index;
  };

  // 傾きからy軸の値を計算
  Slice.prototype._calYposFromAngle = function(angle) {
    return Math.sin(angle * degToRad) * -this.width / 2;
  };

  // 傾きから状態を更新
  Slice.prototype.updateFromAngle = function(angle) {
    // 傾き
    this.skewY = this.index % 2 ? angle : -angle;
    // y軸の動き
    this.y = this._calYposFromAngle(this.skewY);
    // x軸の動き
    this.x = this._calXposFromAngle(angle);
  };

  createjs.promote(Slice, 'Bitmap');




  /**
   * コントローラクラス
   */
  function Controller(params) {
    params = params || {};
    this.Container_constructor();
    $.extend(this, params);
    this._setButtons();
  }

  // Containerクラスを継承
  createjs.extend(Controller, createjs.Container);

  // ボタンの生成
  Controller.prototype._setButtons = function() {
    var _this = this;

    // 戻るボタン
    var prevButton = new Button();
    prevButton.regX = prevButton.width / 2;
    prevButton.regY = prevButton.height / 2;
    prevButton.x = prevButton.width / 2;
    prevButton.y = _this.height / 2;
    prevButton.rotation = 180;
    prevButton.on('click', function() {
      // 戻るボタンクリックを発火
      _this.dispatchEvent('prevclick');
    });
    _this.addChild(prevButton);

    // 次へボタン
    var nextButton = new Button();
    nextButton.regX = nextButton.width / 2;
    nextButton.regY = nextButton.height / 2;
    nextButton.x = _this.width - (nextButton.width / 2);
    nextButton.y = _this.height / 2;
    nextButton.on('click', function() {
      // 次へボタンクリックを発火
      _this.dispatchEvent('nextclick');
    });
    _this.addChild(nextButton);
  };

  createjs.promote(Controller, 'Container');




  // コントローラのボタンクラス
  function Button() {
    this.Container_constructor();
    this.width = 100;
    this.height = 100;
    this.alpha = 0.2;
    this.mouseChildren = false;
    this.cursor = 'pointer';
    this.initialize();
  }

  // Containerクラスを継承
  createjs.extend(Button, createjs.Container);

  // 初期描画
  Button.prototype.initialize = function() {

    // 円
    var circle = new createjs.Shape();
    circle.graphics.beginFill('#000');
    circle.graphics.drawCircle(0, 0, 30);
    circle.x = this.width / 2;
    circle.y = this.height / 2;
    this.addChild(circle);

    // 矢印
    var graphics = new createjs.Graphics();
    graphics
      .setStrokeStyle(4)
      .beginStroke('#FFF')
      .moveTo(0, 0)
      .lineTo(15, 15)
      .lineTo(0, 30)
      .endStroke();
    var arrow = new createjs.Shape(graphics);
    arrow.regX = 15 / 2;
    arrow.regY = 30 / 2;
    arrow.x = this.width / 2;
    arrow.y = this.height / 2;
    this.addChild(arrow);

    // マウスが乗ったらフォーカスアニメーション
    this.on('mouseover', this.focus);

    // マウスが乗ったらフォーカスアニメーション
    this.on('mouseout', this.blur);

  };

  // フォーカス
  Button.prototype.focus = function() {
    createjs.Tween.get(this)
      .to({alpha: 0.5, scaleX: 1.1, scaleY: 1.1}, 200, createjs.Ease.backOut);
  };

  // ブラー
  Button.prototype.blur = function() {
    createjs.Tween.get(this)
      .to({alpha: 0.2, scaleX: 1, scaleY: 1}, 200, createjs.Ease.backOut);
  };

  createjs.promote(Button, 'Container');



  // メイン
  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if(!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Sensu(this, options));
      }
    });
  };

})(jQuery);
