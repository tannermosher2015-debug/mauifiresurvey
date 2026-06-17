/* CBA Reference — accessible tabs (ARIA tab pattern + roving tabindex). */
(function () {
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.cba-tab'));
  if (!tabs.length) return;

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function panelFor(tab) {
    return document.getElementById('panel-' + tab.dataset.panel);
  }

  function activate(tab, setFocus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = panelFor(t);
      if (panel) {
        if (on) { panel.removeAttribute('hidden'); }
        else { panel.setAttribute('hidden', ''); }
      }
    });
    if (setFocus) tab.focus();
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { activate(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var idx = i;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown': idx = (i + 1) % tabs.length; break;
        case 'ArrowLeft':
        case 'ArrowUp': idx = (i - 1 + tabs.length) % tabs.length; break;
        case 'Home': idx = 0; break;
        case 'End': idx = tabs.length - 1; break;
        default: return;
      }
      e.preventDefault();
      activate(tabs[idx], true);
    });
  });
})();
