(function ($) {
  $.fn.sensu = function (options) {

    console.info('this: ', this);

    var stage;

    // デフォルトオプション
    var defaults = {
      text: 'This is basic plugin!!!'
    };

    // オプションをextend
    var setting = $.extend(defaults, options);

    console.log(setting);

    // createjsのステージを用意
    stage = new createjs.Stage('sensu');

    // 画像の描画
    var bitmap = new createjs.Bitmap(setting.list[0]);
    bitmap.x = 0;
    bitmap.y = 0;
    stage.addChild(bitmap);

    // stageの再描画
    stage.update();

    // canvasの描画設定
    // 30fpsで描画を繰り返す
    createjs.Ticker.setFPS(30);
    createjs.Ticker.addEventListener('tick', function () {
      stage.update();
    });

    return this;
  };
})(jQuery);
