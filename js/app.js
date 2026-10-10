/* ============================================================
   杨红个人学术网站 —— 前台脚本
   ============================================================ */
(function () {
  'use strict';

  var DATA = null;
  var $ = function (s) { return document.querySelector(s); };
  var main = $('#main'), nav = $('#nav');

  /* ---------- 轻量 Markdown 渲染 ---------- */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function inline(s) {
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+|#[^)\s]*)\)/g,
      function (m, t, u) { return '<a href="' + u + '"' + (/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : '') + '>' + t + '</a>'; });
    return s;
  }
  function md(src) {
    if (!src) return '';
    var lines = String(src).replace(/\r\n/g, '\n').split('\n');
    var out = [], i = 0;
    function listBlock(marker, ordered) {
      var items = [];
      while (i < lines.length) {
        var L = lines[i];
        var m = ordered ? /^\s*\d+[.)]\s+(.*)$/.exec(L) : /^\s*[-*+]\s+(.*)$/.exec(L);
        if (!m) {
          if (/^\s{2,}\S/.test(L) && items.length) { items[items.length - 1] += ' ' + L.trim(); i++; continue; }
          break;
        }
        items.push(m[1]); i++;
      }
      var tag = ordered ? 'ol' : 'ul';
      return '<' + tag + '>' + items.map(function (x) { return '<li>' + inline(x) + '</li>'; }).join('') + '</' + tag + '>';
    }
    while (i < lines.length) {
      var line = lines[i];
      if (/^\s*$/.test(line)) { i++; continue; }
      var h = /^(#{1,6})\s+(.*)$/.exec(line);
      if (h) { var lv = Math.min(h[1].length, 4); out.push('<h' + lv + '>' + inline(h[2]) + '</h' + lv + '>'); i++; continue; }
      if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
      if (/^\s*```/.test(line)) {
        var buf = []; i++;
        while (i < lines.length && !/^\s*```/.test(lines[i])) { buf.push(esc(lines[i])); i++; }
        i++;
        out.push('<pre><code>' + buf.join('\n') + '</code></pre>'); continue;
      }
      if (/^\s*>\s?/.test(line)) {
        var q = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) { q.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
        out.push('<blockquote>' + md(q.join('\n')) + '</blockquote>'); continue;
      }
      if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
        var cells = function (r) { return r.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(function (c) { return c.trim(); }); };
        var head = cells(line); i += 2; var body = [];
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) { body.push(cells(lines[i])); i++; }
        out.push('<table><thead><tr>' + head.map(function (c) { return '<th>' + inline(c) + '</th>'; }).join('') +
          '</tr></thead><tbody>' + body.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + inline(c) + '</td>'; }).join('') + '</tr>'; }).join('') +
          '</tbody></table>'); continue;
      }
      if (/^\s*[-*+]\s+/.test(line)) { out.push(listBlock(null, false)); continue; }
      if (/^\s*\d+[.)]\s+/.test(line)) { out.push(listBlock(null, true)); continue; }
      var para = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) &&
             !/^(#{1,6})\s+/.test(lines[i]) && !/^\s*[-*+]\s+/.test(lines[i]) &&
             !/^\s*\d+[.)]\s+/.test(lines[i]) && !/^\s*>/.test(lines[i]) && !/^\s*```/.test(lines[i])) {
        para.push(lines[i]); i++;
      }
      if (para.length) out.push('<p>' + inline(para.join(' ')) + '</p>');
    }
    return out.join('\n');
  }

  /* ---------- 弹层 ---------- */
  var mask = $('#mask'), mBody = $('#mBody'), mTitle = $('#mTitle'), mOpen = $('#mOpen');
  function openModal(title, html, opts) {
    opts = opts || {};
    mTitle.textContent = title;
    mBody.className = 'modal-bd';
    mBody.innerHTML = html;
    if (opts.pdf) {
      mBody.className = 'pdfbox';
      var isMobile = window.matchMedia('(max-width: 860px)').matches;
      if (isMobile) {
        mBody.innerHTML = '<div class="pdffb">手机浏览器可能无法直接内嵌预览 PDF。<br><br>' +
          '<a href="' + opts.pdf + '" target="_blank" rel="noopener" ' +
          'style="display:inline-block;padding:10px 18px;background:#fff;color:#3C5A6B;border-radius:8px;font-size:15px;">在新标签页打开 PDF</a></div>';
      } else {
        mBody.innerHTML = '<iframe src="' + opts.pdf + '#view=FitH" title="PDF 预览"></iframe>';
      }
    }
    mOpen.style.display = opts.openUrl ? 'inline-flex' : 'none';
    if (opts.openUrl) mOpen.href = opts.openUrl;
    $('#modal').style.maxWidth = opts.pdf && !window.matchMedia('(max-width: 860px)').matches ? '1000px' : '';
    mask.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    mask.classList.remove('open');
    mBody.innerHTML = '';
    document.body.style.overflow = '';
  }
  $('#mClose').addEventListener('click', closeModal);
  mask.addEventListener('click', function (e) { if (e.target === mask) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  /* ---------- 工具 ---------- */
  function itemTag(it) {
    if (it.type === 'pdf') return '<span class="tag pdf">PDF</span>';
    if (it.type === 'url') return '<span class="tag url">链接</span>';
    if (it.type === 'text') return '<span class="tag doc">正文</span>';
    return '';
  }
  function itemEl(it) {
    var inner = '<span class="row"><span class="tt">' + esc(it.title || '') + '</span>' + itemTag(it) + '</span>' +
      (it.meta ? '<span class="mt">' + esc(it.meta) + '</span>' : '');
    var li = document.createElement('li');
    li.dataset.id = it.id || '';
    if (it.type === 'url' && it.url) {
      li.innerHTML = '<a class="it" href="' + esc(it.url) + '" target="_blank" rel="noopener">' + inner + '</a>';
    } else if (it.type === 'pdf' && it.pdf) {
      li.innerHTML = '<button class="it" data-act="pdf" data-src="' + esc(it.pdf) + '">' + inner + '</button>';
    } else if (it.type === 'text' && it.text) {
      li.innerHTML = '<button class="it" data-act="text" data-id="' + esc(it.id) + '">' + inner + '</button>';
    } else {
      li.innerHTML = '<div class="it">' + inner + '</div>';
    }
    return li;
  }
  function listEl(items) {
    var ul = document.createElement('ul');
    ul.className = 'list';
    if (!items || !items.length) {
      var li = document.createElement('li');
      li.className = 'empty';
      li.textContent = '暂无内容';
      ul.appendChild(li);
      return ul;
    }
    items.forEach(function (it) { ul.appendChild(itemEl(it)); });
    return ul;
  }

  /* ---------- 首页 ---------- */
  function renderHome() {
    var p = DATA.profile || {};
    main.innerHTML = '';
    var hero = document.createElement('section');
    hero.className = 'hero';
    hero.innerHTML =
      '<div class="photo"><img src="' + esc(p.photo || 'assets/avatar.svg') + '" alt="' + esc(p.name || '') + '"></div>' +
      '<div>' +
        '<h1>' + esc(p.name || '') + '</h1>' +
        (p.title ? '<div class="ttl">' + esc(p.title) + '</div>' : '') +
        (p.affil ? '<div class="aff">' + esc(p.affil) + '</div>' : '') +
        (p.roles ? '<div class="roles">' + esc(p.roles) + '</div>' : '') +
        (p.bio ? '<div class="bio">' + esc(p.bio) + '</div>' : '') +
      '</div>';
    main.appendChild(hero);

    var grid = document.createElement('div');
    grid.className = 'home-grid';

    var c1 = document.createElement('div');
    c1.className = 'card';
    c1.innerHTML = '<h3>研究兴趣</h3>';
    var chips = document.createElement('div');
    chips.className = 'chips';
    (p.interests || []).forEach(function (x, i) {
      var s = document.createElement('span');
      s.className = 'chip' + (i % 2 ? ' alt' : '');
      s.textContent = x;
      chips.appendChild(s);
    });
    c1.appendChild(chips);
    grid.appendChild(c1);

    var c2 = document.createElement('div');
    c2.className = 'card';
    c2.innerHTML = '<h3>联系方式</h3>';
    var ul = document.createElement('ul');
    ul.className = 'ct-list';
    (p.contacts || []).forEach(function (c) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="lb">' + esc(c.label || '') + '</span><span class="vl">' +
        (c.href ? '<a href="' + esc(c.href) + '"' + (/^https?:/.test(c.href) ? ' target="_blank" rel="noopener"' : '') + '>' + esc(c.value || '') + '</a>'
                : esc(c.value || '')) + '</span>';
      ul.appendChild(li);
    });
    c2.appendChild(ul);
    grid.appendChild(c2);

    main.appendChild(grid);

    // 快速一览
    var over = document.createElement('div');
    over.className = 'home-grid';
    var c3 = document.createElement('div');
    c3.className = 'card';
    c3.innerHTML = '<h3>学术概览</h3><ul class="ct-list" id="statList"></ul>';
    over.appendChild(c3);
    var c4 = document.createElement('div');
    c4.className = 'card';
    c4.innerHTML = '<h3>最新动态</h3><ul class="ct-list" id="最新List"></ul>';
    over.appendChild(c4);
    main.appendChild(over);

    var counts = [];
    DATA.sections.forEach(function (s) {
      var n = (s.items || []).length;
      (s.subsections || []).forEach(function (sb) { n += (sb.items || []).length; });
      counts.push('<li><span class="lb">' + esc(s.title) + '</span><span class="vl">' + n + ' 条</span></li>');
    });
    $('#statList').innerHTML = counts.join('');

    var recent = allItems().filter(function (x) { return x.item.year; })
      .sort(function (a, b) { return b.item.year - a.item.year; }).slice(0, 6);
    $('#最新List').innerHTML = recent.length
      ? recent.map(function (x) {
          return '<li><span class="lb">' + esc(x.item.year) + '</span><span class="vl">' + esc(x.item.title) + '</span></li>';
        }).join('')
      : '<li><span class="vl">暂无</span></li>';
  }

  /* ---------- 栏目页 ---------- */
  function renderSection(sec) {
    main.innerHTML = '';
    var head = document.createElement('div');
    head.className = 'page-head';
    head.innerHTML = '<h2>' + esc(sec.title) + '</h2><div class="bar"></div>';
    main.appendChild(head);

    var subs = sec.subsections || [];
    if (subs.length) {
      subs.forEach(function (sb) {
        var box = document.createElement('section');
        box.className = 'sub';
        var h = document.createElement('h3');
        h.textContent = sb.title;
        box.appendChild(h);
        box.appendChild(listEl(sb.items));
        main.appendChild(box);
      });
    } else {
      main.appendChild(listEl(sec.items));
    }
  }

  /* ---------- 路由 ---------- */
  function route() {
    var h = (location.hash || '').replace(/^#\/?/, '');
    if (!h) h = 'home';
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (a) {
      a.classList.toggle('on', a.dataset.route === h);
    });
    if (h === 'home') { renderHome(); return; }
    var sec = (DATA.sections || []).filter(function (s) { return s.id === h; })[0];
    if (!sec) { renderHome(); return; }
    renderSection(sec);
  }
  function renderNav() {
    var html = '<a href="#/home" data-route="home">首页</a>';
    (DATA.sections || []).forEach(function (s) {
      html += '<a href="#/' + esc(s.id) + '" data-route="' + esc(s.id) + '">' + esc(s.title) + '</a>';
    });
    nav.innerHTML = html;
  }

  /* ---------- 事件委托 ---------- */
  main.addEventListener('click', function (e) {
    var btn = e.target.closest('button.it');
    if (!btn) return;
    var act = btn.dataset.act;
    if (act === 'pdf') {
      openModal(btn.querySelector('.tt').textContent, '', { pdf: btn.dataset.src, openUrl: btn.dataset.src });
    } else if (act === 'text') {
      var it = findItem(btn.dataset.id);
      if (it) openModal(it.title, '<div class="md">' + md(it.text) + '</div>');
    }
  });

  function findItem(id) {
    var r = null;
    (DATA.sections || []).forEach(function (s) {
      (s.items || []).forEach(function (x) { if (x.id === id) r = x; });
      (s.subsections || []).forEach(function (sb) {
        (sb.items || []).forEach(function (x) { if (x.id === id) r = x; });
      });
    });
    return r;
  }
  function allItems() {
    var out = [];
    (DATA.sections || []).forEach(function (s) {
      (s.items || []).forEach(function (x) { out.push({ item: x, sec: s.title, sub: '', secId: s.id }); });
      (s.subsections || []).forEach(function (sb) {
        (sb.items || []).forEach(function (x) { out.push({ item: x, sec: s.title, sub: sb.title, secId: s.id }); });
      });
    });
    return out;
  }

  /* ---------- 搜索 ---------- */
  var q = $('#q'), panel = $('#srchPanel');
  function doSearch() {
    var k = q.value.trim().toLowerCase();
    if (!k) { panel.classList.remove('open'); panel.innerHTML = ''; return; }
    var hits = allItems().filter(function (x) {
      return ((x.item.title || '') + ' ' + (x.item.meta || '') + ' ' + (x.item.text || '')).toLowerCase().indexOf(k) >= 0;
    });
    // 简介也参与匹配时给出提示
    var hitsHtml = '';
    if (!hits.length) {
      hitsHtml = '<div class="none">未找到相关内容</div>';
    } else {
      var last = '';
      hits.slice(0, 40).forEach(function (x) {
        var g = (x.sec + (x.sub ? ' · ' + x.sub : ''));
        if (g !== last) { hitsHtml += '<div class="grp">' + esc(g) + '</div>'; last = g; }
        hitsHtml += '<a class="hit" href="#/' + esc(x.secId) + '" data-id="' + esc(x.item.id) + '" data-sec="' + esc(x.secId) + '">' +
          '<div class="t">' + esc(x.item.title) + '</div>' +
          (x.item.meta ? '<div class="m">' + esc(x.item.meta) + '</div>' : '') + '</a>';
      });
    }
    panel.innerHTML = hitsHtml;
    panel.classList.add('open');
  }
  q.addEventListener('input', doSearch);
  q.addEventListener('focus', function () { if (q.value.trim()) doSearch(); });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.search')) panel.classList.remove('open');
  });
  panel.addEventListener('click', function (e) {
    var a = e.target.closest('.hit');
    if (!a) return;
    panel.classList.remove('open');
    q.value = '';
    var id = a.dataset.id, secId = a.dataset.sec;
    setTimeout(function () {
      if (location.hash !== '#/' + secId) { location.hash = '#/' + secId; }
      route();
      var es = window.CSS && CSS.escape ? CSS.escape(id) : String(id).replace(/["\\]/g, '\\$&');
      var li = main.querySelector('li[data-id="' + es + '"]');
      if (li) {
        li.scrollIntoView({ behavior: 'smooth', block: 'center' });
        li.classList.add('flash');
        setTimeout(function () { li.classList.remove('flash'); }, 2200);
      }
    }, 20);
  });

  /* ---------- 汉堡菜单 ---------- */
  $('#burger').addEventListener('click', function () {
    nav.classList.toggle('open');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) nav.classList.remove('open');
  });

  /* ---------- 启动 ---------- */
  var SITE_DATA = 'data/site.json';
  fetch(SITE_DATA).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function (d) {
    DATA = d;
    document.title = (d.profile && d.profile.name ? d.profile.name + ' · ' : '') +
      ((d.profile && d.profile.affil) || '个人学术主页');
    if (d.profile) {
      $('#ftName').textContent = [d.profile.name, d.profile.affil].filter(Boolean).join(' · ');
    }
    $('#yr').textContent = new Date().getFullYear();
    renderNav();
    route();
  }).catch(function () {
    main.innerHTML = '<div class="page"><p>数据加载失败，请确认服务已启动。</p></div>';
  });

  window.addEventListener('hashchange', function () { if (DATA) route(); });
})();
