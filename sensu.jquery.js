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
    this.initialize();
  }

  // 初期化
  Sensu.prototype.initialize = function() {
    var _this = this;

    // createjsのステージを用意
    _this._stage = new createjs.Stage('sensu');

    // スライダーを生成
    var slider = new Slider();
    _this._stage.addChild(slider);

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
    this.initialize();
  }

  // Containerクラスを継承
  createjs.extend(Slider, createjs.Container);

  // 初期化
  Slider.prototype.initialize = function() {
  };

  // ページ追加
  Slider.prototype.addPage = function(img) {
    this.addChild(new Page(img));
  };

  // 次のページへ
  Slider.prototype.goNext = function() {
  };

  // 前のページへ
  Slider.prototype.goPrev = function() {
  };

  createjs.promote(Slider, 'Container');




  /**
   * ページクラス
   */
  function Page(img) {
    this.Container_constructor();
    this.width = img.width;
    this.height = img.height;
    this.sliceCount = 10;
    this.sliceWidth = this.width / this.sliceCount;
    this.initialize(img);
  }

  // Containerクラスを継承
  createjs.extend(Page, createjs.Container);

  // 初期化
  Page.prototype.initialize = function(img) {
    // スライス数分画像を分割して生成
    for (var index = 0; index < this.sliceCount; index++) {
      var slice = new Slice(img, this.sliceWidth, index);
      this.addChild(slice);
    }
  };

  // 開く
  Page.prototype.open = function() {
  };

  // 閉じる
  Page.prototype.close = function() {
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
    this.initialize();
  }

  // Bitmapクラスを継承
  createjs.extend(Slice, createjs.Bitmap);

  // 初期化
  Slice.prototype.initialize = function() {
    this.isMoving = false;
    this.cache(0, 0, this.width, this.height);
    this.filters = [new createjs.ColorMatrixFilter(new createjs.ColorMatrix())];
    this.stand();
  };

  // 傾きからy軸の値を計算
  Slice.prototype._calYposFromAngle = function(angle) {
    // y軸の調整と傾き
    var y = Math.sin(angle * degToRad) * -this.width / 2;
    return y;
  };

  // 立てる
  Slice.prototype.stand = function() {
    var value = 0;
    this.on('tick', function() {
      if(value > 90) {
        return;
      }

      // 傾き
      if (this.index % 2) {
        this.skewY = value;
      } else {
        this.skewY = -value;
      }

      // y軸の動き
      this.y = this._calYposFromAngle(this.skewY);
      // x軸の動き
      this.x = (this.width * Math.cos(value * degToRad)) * this.index;

      // フィルターの更新
      this.filters[0].matrix.setColor(Math.sin(this.skewY * degToRad) * -80);
      this.updateCache();

      // 度数のインクリメント
      value++;
    });
  };

  // 倒す
  Slice.prototype.layDown = function() {
  };

  createjs.promote(Slice, 'Bitmap');



  // メイン
  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if(!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Sensu(this, options));
      }
    });
  };

})(jQuery);
