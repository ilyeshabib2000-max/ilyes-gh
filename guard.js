/* حماية من Clickjacking: إذا فُتح الموقع داخل iframe في موقع آخر، يُخفى ويُنقل المتصفح للموقع الأصلي */
(function () {
  'use strict';
  try {
    if (window.top !== window.self) {
      document.documentElement.classList.add('framed');
      window.top.location = window.self.location;
    }
  } catch (e) {
    document.documentElement.classList.add('framed');
  }
})();
