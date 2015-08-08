(function ($) {

  var pluginName = 'sensu',
      defaults = {};

  // コンストラクタ
  function Sensu(element, options) {
    this.element = element;
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this._stage = null;
    this.currentPage = 0;
    this.init();
  }

  // メソッド
  Sensu.prototype = {

    /**
     * 初期設定
     */
    init: function() {
      var _this = this;

      // createjsのステージを用意
      _this._stage = new createjs.Stage('sensu');

      // LoadQueueクラス
      var loadQueue = new createjs.LoadQueue();
      loadQueue.addEventListener('fileload', handleFileLoadComplete);

      function handleFileLoadComplete(event) {
        // 読み込んだファイル
        console.info(event.result);
        _this._addImage(event.result);
      }

      // canvasの描画設定
      // 30fpsで描画を繰り返す
      createjs.Ticker.setFPS(30);
      createjs.Ticker.addEventListener('tick', function () {
        _this._stage.update();
      });

      // 読み込み開始
      loadQueue.loadManifest(_this.settings.list);
    },


    /**
     * 画像の追加
     */
    _addImage: function(img) {
      var _this = this;
      var imgWidth = img.width,
          imgHeight = img.height,
          sliceCount = 6,
          sliceWidth = imgWidth / sliceCount,
          degToRad = Math.PI / 180;

      console.info(sliceWidth);

      var container = new createjs.Container();

      for (var i = 0; i < sliceCount; i++) {
        var slice = new createjs.Bitmap(img);
        slice.sourceRect = new createjs.Rectangle(sliceWidth * i, 0, sliceWidth, imgHeight);
        slice.cache(0, 0, sliceWidth, imgHeight);
        slice.filters = [new createjs.ColorMatrixFilter(new createjs.ColorMatrix())];
        container.addChild(slice);
      }

      _this._stage.addChild(container);

      function updateEffect(value) {
        var l = container.getNumChildren();
        for (var i = 0; i < l; i++) {
          var slice = container.getChildAt(i);
          slice.y = Math.sin(value * degToRad) * -sliceWidth / 2;
          if (i % 2) {
            slice.skewY = value;
          } else {
            slice.skewY = -value;
            slice.y -= sliceWidth * Math.sin(slice.skewY * degToRad);
          }
          slice.x = sliceWidth * (i - l / 2) * Math.cos(slice.skewY * degToRad);
          slice.filters[0].matrix.setColor(Math.sin(slice.skewY * degToRad) * -80);
          slice.updateCache();
        }
        _this._stage.update();
      }

      updateEffect(50);
    }

  };

  // メイン
  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if(!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Sensu(this, options));
      }
    });
  };

})(jQuery);
