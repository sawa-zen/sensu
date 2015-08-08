# sensu
蛇腹状に折りたたむようにスライドするjQueryプラグインスライダー

[Demoページ](http://sensu.sawa-zen.com)

## Description

socket.ioのWebsocket通信と、createjsのcanvasによる描画で、
適当なオンラインゲームのようなものができないか試してみたものです。
良かったら参考にしてください。

## Requirement

- jQuery
- createjs

## Usage

1. 依存ファイルとsensu.jsを読み込む

  ```html
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
  <script src="https://code.createjs.com/createjs-2015.05.21.min.js"></script>
  <script src="http://cdn.sawa-zen.com/sensu/0.1.0/sensu.jquery.min.js"></script>
  ```

1. canvasタグを用意

  ```html
  <canvas id="my-canvas" />
  ```

1. sensuメソッドを実行

  ```html
  <script type="text/javascript">
    $(window).onload(function() {
      $('#my-canvas').sensu();
    });
  </script>
  ```

## Settings
Option | Type | Default | Description
------ | ---- | ------- | -----------
autoplay | boolean | false | Enables auto play of slides
autoplaySpeed | int  | 3000 | Auto play change interval


## Author

[@sawa-zen](https://github.com/sawa-zen)
