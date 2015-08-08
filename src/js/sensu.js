(($) => {
  $.fn.sensu = (options) => {

    // デフォルトオプション
    var defaults = {
      text: 'This is basic plugin!!!'
    };
    // オプションをextend
    var setting = $.extend(defaults, options);
    console.info(setting);

    return this;
  };
})(jQuery);
