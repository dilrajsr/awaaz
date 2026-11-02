/* Applies saved theme and accessibility choices before the page paints (avoids a flash). */
(function () {
  try {
    var d = document.documentElement, g = function (k) { return localStorage.getItem(k); };
    var q = new URLSearchParams(location.search).get('theme');   // /?theme=light or /?theme=dark
    if (q === 'dark' || q === 'light') localStorage.setItem('awaaz-theme', q);
    var th = g('awaaz-theme');
    if (th === 'dark' || th === 'light') d.dataset.theme = th;
    if (g('awaaz-large') === '1') d.classList.add('large');
    if (g('awaaz-contrast') === '1') d.classList.add('contrast');
  } catch (e) {}
})();
