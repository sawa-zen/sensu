(function ($) {

  var pluginName = 'sensu',
      degToRad = Math.PI / 180,
      defaults = {};


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
    _this._stage = new createjs.Stage('sensu');

    // スライダーを生成
    var slider = new Slider();
    slider.width = this.el.width;
    slider.height = this.el.height;
    _this._stage.addChild(slider);

    // コントローラ
    var controller = new Controller({
      width: this.el.width,
      height: this.el.width
    });
    _this._stage.addChild(controller);

    // 戻るボタンクリック
    controller.on('prevclick', function() {
      slider.goNext();
    });

    // 次へボタン
    controller.on('nextclick', function() {
      slider.goPrev();
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
    loadQueue.addEventListener('fileload', function(event) {
      // スライダーにページを追加
      slider.addPage(event.result);
    });
    // 読み込み開始
    loadQueue.loadManifest(_this.settings.list);
  };




  /**
   * スライダークラス
   */
  function Slider() {
    this.Container_constructor();
    this.currentPage = 0;
    this.pages = [];
    this.isMoving = false;
  }

  // Containerクラスを継承
  createjs.extend(Slider, createjs.Container);

  // ページ追加
  Slider.prototype.addPage = function(img) {
    var _this = this;
    var page = new Page(img);
    // ページのアニメーション開始を監視
    page.on('beforeanimate', function() {
      _this.isMoving = true;
    });
    // ページのアニメーション終了を監視
    page.on('afteranimate', function() {
      _this.isMoving = false;
    });
    _this.pages.push(page);
    _this.addChild(page);
  };

  // 次のページへ
  Slider.prototype.goNext = function() {
    console.info('goNext');
    // アニメーション中であれば処理しない
    if(this.isMoving) {
      return;
    }
    // アニメーション中にフラグを変更
    this.isMoving = true;
    this.pages[1].open();
  };

  // 前のページへ
  Slider.prototype.goPrev = function() {
    // アニメーション中であれば処理しない
    if(this.isMoving) {
      return;
    }
    // アニメーション中にフラグを変更
    this.isMoving = true;
    this.pages[1].close();
  };

  createjs.promote(Slider, 'Container');




  /**
   * ページクラス
   */
  function Page(img) {
    this.Container_constructor();
    this.width = img.width;
    this.height = img.height;
    this.angle = 0;
    this.sliceCount = 10;
    this.sliceWidth = this.width / this.sliceCount;
    this.initialize(img);
  }

  // Containerクラスを継承
  createjs.extend(Page, createjs.Container);

  // 初期化
  Page.prototype.initialize = function(img) {
    var _this = this;
    // スライス数分画像を分割して生成
    for (var index = 0; index < this.sliceCount; index++) {
      var slice = new Slice(img, this.sliceWidth, index);
      _this.addChild(slice);
    }

    // アニメーション終了を監視
    _this.on('afteranimate', function() {
      _this.removeAllEventListeners('tick');
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
    this.cache(0, 0, this.width, this.height);
    this.filters = [new createjs.ColorMatrixFilter(new createjs.ColorMatrix())];
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
      // フィルターの更新
      this.filters[0].matrix.setColor(Math.sin(this.skewY * degToRad) * -25);
      this.updateCache();
  };

  createjs.promote(Slice, 'Bitmap');




  /**
   * コントローラクラス
   */
  function Controller(params) {
    params = params || {};
    this.Container_constructor();
    $.extend(this, params);
    this.initialize();
  }

  // Containerクラスを継承
  createjs.extend(Controller, createjs.Container);

  // 初期化
  Controller.prototype.initialize = function() {
    var _this = this;

    // 戻るボタン
    var prevButton = new createjs.Shape();
    prevButton.alpha = 0.5;
    prevButton.graphics
      .beginFill('#F00')
      .drawRect(0, 0, 100, this.height);
    prevButton.on('click', function() {
      // 戻るボタンクリックを発火
      _this.dispatchEvent('prevclick');
    });
    this.addChild(prevButton);

    // 次へボタン
    var nextButton = new createjs.Shape();
    nextButton.regX = 100;
    nextButton.alpha = 0.5;
    nextButton.graphics
      .beginFill('#00F')
      .drawRect(this.width, 0, 100, this.height);
    nextButton.on('click', function() {
      // 次へボタンクリックを発火
      _this.dispatchEvent('nextclick');
    });
    this.addChild(nextButton);

  };

  createjs.promote(Controller, 'Container');




  // メイン
  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if(!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Sensu(this, options));
      }
    });
  };

})(jQuery);
