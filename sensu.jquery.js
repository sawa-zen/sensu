(function ($) {

  var pluginName = 'sensu',
      defaults = {};

  /**
   * メインクラス
   */
  function Sensu(element, options) {
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._stage = null;
    this.init();
  }
  Sensu.prototype.init = function() {
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
  createjs.promote(Slider, 'Container');



  /**
   * ページクラス
   */
  function Page(img) {
    this.Container_constructor();
    this.x = 415;
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
    for (var i = 0; i < this.sliceCount; i++) {
      var slice = new createjs.Bitmap(img);
      slice.sourceRect = new createjs.Rectangle(
        this.sliceWidth * i, 0, this.sliceWidth, this.height
      );
      slice.cache(0, 0, this.sliceWidth, this.height);
      slice.filters = [
        new createjs.ColorMatrixFilter(new createjs.ColorMatrix())
      ];
      this.addChild(slice);
    }

    this.open();
  };
  // 開く
  Page.prototype.open = function() {
    createjs.Tween.get(this)
      .to({x: 0, skewY: 90}, 2000, createjs.Ease.getPowInOut(4));
    //var value = 45;
    //degToRad = Math.PI / 180;
    //var l = this.getNumChildren();
    //for (var i = 0; i < l; i++) {
    //  var slice = this.getChildAt(i);
    //  slice.y = Math.sin(value * degToRad) * -this.sliceWidth / 2;
    //  if (i % 2) {
    //    slice.skewY = value;
    //  } else {
    //    slice.skewY = -value;
    //    slice.y -= this.sliceWidth * Math.sin(slice.skewY * degToRad);
    //  }
    //  slice.x = this.sliceWidth * (i - l / 2) * Math.cos(slice.skewY * degToRad);
    //  slice.filters[0].matrix.setColor(Math.sin(slice.skewY * degToRad) * -80);
    //  slice.updateCache();
    //}
  };
  // 閉じる
  Page.prototype.close = function() {
  };
  createjs.promote(Page, 'Container');



  /**
   * コントローラークラス
   */



  // メイン
  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if(!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Sensu(this, options));
      }
    });
  };

})(jQuery);
