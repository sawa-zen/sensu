# sensu
蛇腹状に折りたたむようにスライドするjQueryプラグインスライダー

[Demoページ](http://sensu.sawa-zen.com/demo)

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
      $('#my-canvas').sensu({
        list: [
          {src: './img/demo1.png', url: 'http://google.com'},
          {src: './img/demo2.png', url: 'http://google.com'},
          {src: './img/demo3.png'}
        ]
      });
    });
  </script>
  ```

## Settings
Option | Type | Default | Description
------ | ---- | ------- | -----------
list | array | [] | 画像のリスト
roop | boolean | true | ループさせるかどうか
autoplay | boolean | false | 自動ページングさせるかどうか
autoplaySpeed | int  | 3000 | 自動ページングさせる時間


## Author

[@sawa-zen](https://github.com/sawa-zen)
