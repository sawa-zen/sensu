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

      // 画像の描画
      var bitmap = new createjs.Bitmap(img);
      bitmap.x = 0;
      bitmap.y = 0;
      _this._stage.addChild(bitmap);
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
