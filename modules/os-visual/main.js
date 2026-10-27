/* 页面入口：页签、主题、播放器生命周期、键盘 */
(function (A) {
  'use strict';

  var themeBtn = document.getElementById('themeBtn');
  var root = document.documentElement;

  function applyTheme(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem('os-visual-theme', theme); } catch (e) {}
    themeBtn.textContent = theme === 'dark' ? '浅色' : '深色';
    themeBtn.setAttribute('aria-label', theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
  }

  var saved = null;
  try { saved = localStorage.getItem('os-visual-theme'); } catch (e) {}
  var initialTheme = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(initialTheme);

  themeBtn.addEventListener('click', function () {
    applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  var players = {};
  var activeTab = 'sched';
  var reviewBuilt = false;

  var scenes = {
    sched: A.schedScenes,
    pv: A.pvScenes,
    bitmap: A.bitmapScenes
  };

  var tabButtons = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var panels = {
    sched: document.getElementById('panel-sched'),
    pv: document.getElementById('panel-pv'),
    bitmap: document.getElementById('panel-bitmap'),
    review: document.getElementById('panel-review')
  };

  function ensurePlayer(tab) {
    if (tab === 'review') {
      if (!reviewBuilt) {
        A.buildReview(document.getElementById('review-root'));
        reviewBuilt = true;
      }
      return null;
    }
    if (!players[tab]) {
      players[tab] = new A.Player(document.getElementById('player-' + tab), scenes[tab], { baseDuration: 5000 });
    }
    return players[tab];
  }

  function switchTab(tab) {
    if (tab === activeTab) return;
    var oldPlayer = players[activeTab];
    if (oldPlayer) oldPlayer.pause();

    activeTab = tab;
    tabButtons.forEach(function (b) {
      var on = b.dataset.tab === tab;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    Object.keys(panels).forEach(function (k) {
      panels[k].classList.toggle('active', k === tab);
    });

    var p = ensurePlayer(tab);
    if (p && p.step < p.steps.length - 1) {
      p.play();
    }
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }

  tabButtons.forEach(function (b) {
    b.addEventListener('click', function () { switchTab(b.dataset.tab); });
  });

  document.addEventListener('keydown', function (e) {
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || tag === 'BUTTON') {
      if (e.code !== 'Space') return;
    }
    if (activeTab === 'review') return;
    var p = players[activeTab];
    if (!p) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      p.next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      p.prev();
    } else if (e.code === 'Space') {
      e.preventDefault();
      if (p.playing) p.pause();
      else p.play();
    }
  });

  // 第一个页签默认自动播放
  ensurePlayer('sched');

  // 页面隐藏时暂停，避免后台一直跳
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      Object.keys(players).forEach(function (k) { players[k].pause(); });
    }
  });
})(window.OSApp);
