/* 页签、主题、键盘与初始化 */
(function () {
  'use strict';
  var U = window.UI;
  var MODS = window.MODULES;
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('.module'));
  var players = {};
  var activeId = 'm1';
  var m5Rendered = false;
  var nums = { m1: '1', m2: '2', m3: '3', m4: '4' };

  function activate(id) {
    if (!document.getElementById(id)) id = 'm1';
    if (id === activeId && (players[id] || (id === 'm5' && m5Rendered))) return;
    if (players[activeId]) players[activeId].pause();
    activeId = id;
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === id;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) {
        var bar = t.parentElement;
        bar.scrollLeft = t.offsetLeft - bar.clientWidth / 2 + t.offsetWidth / 2;
      }
    });
    sections.forEach(function (s) {
      s.classList.toggle('active', s.id === id);
    });
    try { history.replaceState(null, '', '#' + id); } catch (err) { /* file:// 下可能失败，忽略 */ }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (id === 'm5') {
      if (!m5Rendered) {
        window.renderReview(document.getElementById('m5'));
        m5Rendered = true;
      }
      return;
    }
    if (!players[id]) {
      players[id] = U.createModule(document.getElementById(id), MODS[id], nums[id]);
      players[id].goToScene(0, { autoplay: true });
    }
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () { activate(t.getAttribute('data-tab')); });
  });

  window.addEventListener('hashchange', function () {
    var id = location.hash.replace('#', '');
    if (id && id !== activeId) activate(id);
  });

  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (/INPUT|SELECT|TEXTAREA|BUTTON/.test(tag) || (e.target && e.target.isContentEditable)) return;
    var p = players[activeId];
    if (!p) return;
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      p.toggle();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      p.prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      p.next();
    }
  });

  var themeBtn = document.getElementById('themeBtn');
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('os-theme', theme); } catch (err) { /* ignore */ }
    if (themeBtn) {
      themeBtn.innerHTML = theme === 'dark' ? '☀ 浅色' : '◐ 深色';
      themeBtn.setAttribute('aria-label', theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
    }
  }
  var saved = null;
  try { saved = localStorage.getItem('os-theme'); } catch (err) { /* ignore */ }
  applyTheme(saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  var initial = location.hash.replace('#', '');
  if (['m1', 'm2', 'm3', 'm4', 'm5'].indexOf(initial) < 0) initial = 'm1';
  activate(initial);
})();
