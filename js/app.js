/* ============================================================
   杨红 · 湖北大学文学院 —— 前台脚本
   数据来源：data/site.json（静态文件）
   ============================================================ */
(function () {
  'use strict';

  var DATA = null;
  var $ = function (s) { return document.querySelector(s); };
  var main = $('#main'), navlinks = $('#navlinks'), navEl = $('#nav');

  /* ---------- 语言与界面文案 ---------- */
  var IS_EN = (document.documentElement.getAttribute('data-lang') || 'zh').toLowerCase() === 'en';
  var DATA_URL = IS_EN ? 'data/site-en.json' : 'data/site.json';
  var OTHER_PAGE = IS_EN ? 'index.html' : 'en.html';
  var T = IS_EN ? {
    tagLink: 'Link',
    tagText: 'Text',
    emptyList: 'No content yet',
    defaultAffil: 'Academic Homepage',
    ctaPubs: 'Publications',
    ctaContact: 'Contact',
    scrollHint: 'Scroll down',
    aboutKicker: 'About',
    aboutTitle: 'Biography',
    noBio: 'Biography to be added.',
    labelAffil: 'Affiliation',
    labelTitle: 'Title',
    labelInterests: 'Research Areas',
    interestsKicker: 'Research',
    interestsTitle: 'Research Interests',
    overview: 'Overview',
    recent: 'Recent',
    none: 'None',
    count: function (n) { return n + (n === 1 ? ' item' : ' items'); },
    contactTitle: 'Get in <em>Touch</em>',
    contactLead: 'Feel free to get in touch if you share an interest in these research areas.',
    emailMe: 'Email Me',
    facultyPage: 'Faculty Page',
    navHome: 'Home',
    navContact: 'Contact',
    noResults: 'No results found',
    pdfMobile: 'Your browser may not preview PDFs inline.<br><br>',
    pdfOpen: 'Open PDF in a new tab',
    pdfTitle: 'PDF preview',
    loadFail: 'Failed to load content. Please serve the site over a web server (see README).',
    langLabel: '中文',
    langTitle: '切换到中文'
  } : {
    tagLink: '链接',
    tagText: '正文',
    emptyList: '暂无内容',
    defaultAffil: '个人学术主页',
    ctaPubs: '查看论著成果',
    ctaContact: '联系我',
    scrollHint: '向下浏览',
    aboutKicker: '关于我',
    aboutTitle: '简介',
    noBio: '暂无简介。',
    labelAffil: '工作单位',
    labelTitle: '职称',
    labelInterests: '研究方向',
    interestsKicker: '研究方向',
    interestsTitle: '研究兴趣',
    overview: '学术概览',
    recent: '最新动态',
    none: '暂无',
    count: function (n) { return n + ' 条'; },
    contactTitle: '欢迎<em>交流</em>与合作',
    contactLead: '如对相关研究方向感兴趣，欢迎通过以下方式联系我。',
    emailMe: '发送邮件',
    facultyPage: '学院主页',
    navHome: '首页',
    navContact: '联系',
    noResults: '未找到相关内容',
    pdfMobile: '手机浏览器可能无法直接内嵌预览 PDF。<br><br>',
    pdfOpen: '在新标签页打开 PDF',
    pdfTitle: 'PDF 预览',
    loadFail: '数据加载失败，请确认通过本地服务器访问（见 README）。',
    langLabel: 'EN',
    langTitle: 'Switch to English'
  };

  /* ---------- 基础工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function h(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* 把 meta 拆成「年份」与「其余」两部分，年份用于左侧栏 */
  function splitMeta(meta, year) {
    meta = meta || '';
    var m = /^(\d{4})\s*[·•:：]\s*/.exec(meta);
    if (m) return { year: m[1], rest: meta.slice(m[0].length) };
    return { year: (year == null ? '' : String(year)), rest: meta };
  }

  /* ---------- 轻量 Markdown ---------- */
  function inline(s) {
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+|#[^)\s]*)\)/g,
      function (m, t, u) {
        return '<a href="' + u + '"' + (/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : '') + '>' + t + '</a>';
      });
    return s;
  }
  function md(src) {
    if (!src) return '';
    var lines = String(src).replace(/\r\n/g, '\n').split('\n');
    var out = [], i = 0;
    function listBlock(ordered) {
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
      var hd = /^(#{1,6})\s+(.*)$/.exec(line);
      if (hd) { var lv = Math.min(hd[1].length, 4); out.push('<h' + lv + '>' + inline(hd[2]) + '</h' + lv + '>'); i++; continue; }
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
      if (/^\s*[-*+]\s+/.test(line)) { out.push(listBlock(false)); continue; }
      if (/^\s*\d+[.)]\s+/.test(line)) { out.push(listBlock(true)); continue; }
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
      mBody.innerHTML = isMobile
        ? '<div class="pdffb">' + T.pdfMobile +
          '<a class="btn btn-primary" href="' + opts.pdf + '" target="_blank" rel="noopener">' + T.pdfOpen + '</a></div>'
        : '<iframe src="' + opts.pdf + '#view=FitH" title="' + T.pdfTitle + '"></iframe>';
    }
    mOpen.style.display = opts.openUrl ? 'inline-flex' : 'none';
    if (opts.openUrl) mOpen.href = opts.openUrl;
    $('#modal').style.maxWidth = (opts.pdf && !window.matchMedia('(max-width: 860px)').matches) ? '1000px' : '';
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

  /* ---------- 条目 ---------- */
  function itemTag(it) {
    if (it.type === 'pdf') return '<span class="tag">PDF</span>';
    if (it.type === 'url') return '<span class="tag">' + T.tagLink + '</span>';
    if (it.type === 'text') return '<span class="tag">' + T.tagText + '</span>';
    return '';
  }
  function itemBody(it) {
    var ym = splitMeta(it.meta, it.year);
    var inner =
      '<div class="tt">' + esc(it.title || '') + itemTag(it) + '</div>' +
      (ym.rest ? '<div class="mt">' + esc(ym.rest) + '</div>' : '');
    return { year: ym.year, inner: inner };
  }
  function itemLi(it) {
    var b = itemBody(it);
    var li = h('li');
    li.dataset.id = it.id || '';
    var cell = b.inner;
    if (it.type === 'url' && it.url) {
      li.innerHTML = '<span class="yr">' + esc(b.year) + '</span><a class="it" href="' + esc(it.url) + '" target="_blank" rel="noopener">' + cell + '</a>';
    } else if (it.type === 'pdf' && it.pdf) {
      li.innerHTML = '<span class="yr">' + esc(b.year) + '</span><button class="it" data-act="pdf" data-src="' + esc(it.pdf) + '">' + cell + '</button>';
    } else if (it.type === 'text' && it.text) {
      li.innerHTML = '<span class="yr">' + esc(b.year) + '</span><button class="it" data-act="text" data-id="' + esc(it.id) + '">' + cell + '</button>';
    } else {
      li.innerHTML = '<span class="yr">' + esc(b.year) + '</span><div class="it">' + cell + '</div>';
    }
    return li;
  }
  function listEl(items) {
    var ul = h('ul', 'list');
    if (!items || !items.length) {
      ul.appendChild(h('li', 'empty', T.emptyList));
      return ul;
    }
    items.forEach(function (it) { ul.appendChild(itemLi(it)); });
    return ul;
  }

  /* 论著列表：年份列 + 标题 + 出处 */
  function pubListEl(items) {
    var ul = h('ul', 'pub-list');
    (items || []).forEach(function (it) {
      var ym = splitMeta(it.meta, it.year);
      var li = h('li', 'pub-item');
      li.dataset.id = it.id || '';
      var tail = '';
      if (it.type === 'url' && it.url) tail = '<a class="it" href="' + esc(it.url) + '" target="_blank" rel="noopener">' + esc(it.title) + '</a>';
      else if (it.type === 'pdf' && it.pdf) tail = '<button class="it" data-act="pdf" data-src="' + esc(it.pdf) + '">' + esc(it.title) + '</button>';
      else if (it.type === 'text' && it.text) tail = '<button class="it" data-act="text" data-id="' + esc(it.id) + '">' + esc(it.title) + '</button>';
      else tail = esc(it.title);
      li.innerHTML =
        '<div class="pub-year">' + esc(ym.year) + '</div>' +
        '<div><div class="pub-title">' + tail + itemTag(it) + '</div>' +
        (ym.rest ? '<div class="pub-meta">' + esc(ym.rest) + '</div>' : '') + '</div>';
      ul.appendChild(li);
    });
    return ul;
  }

  /* 项目列表：标题 + 右侧年份 + 说明行 */
  function grantListEl(items) {
    var ul = h('ul', 'grant-list');
    (items || []).forEach(function (it) {
      var ym = splitMeta(it.meta, it.year);
      var li = h('li', 'grant-item');
      li.dataset.id = it.id || '';
      var titleHtml;
      if (it.type === 'url' && it.url) titleHtml = '<a class="it" href="' + esc(it.url) + '" target="_blank" rel="noopener">' + esc(it.title) + '</a>';
      else if (it.type === 'pdf' && it.pdf) titleHtml = '<button class="it" data-act="pdf" data-src="' + esc(it.pdf) + '">' + esc(it.title) + '</button>';
      else if (it.type === 'text' && it.text) titleHtml = '<button class="it" data-act="text" data-id="' + esc(it.id) + '">' + esc(it.title) + '</button>';
      else titleHtml = esc(it.title);
      li.innerHTML =
        '<div class="grant-top"><div class="grant-title">' + titleHtml + itemTag(it) + '</div>' +
        (ym.year ? '<div class="grant-year">' + esc(ym.year) + '</div>' : '') + '</div>' +
        (ym.rest ? '<div class="grant-meta">' + esc(ym.rest) + '</div>' : '');
      ul.appendChild(li);
    });
    return ul;
  }

  /* 标签云：用于课程 */
  function chipCloudEl(items) {
    var box = h('div', 'chip-cloud');
    (items || []).forEach(function (it) {
      var label = it.title || '';
      var note = splitMeta(it.meta, it.year).rest;
      var span = h('span', 'chip', esc(label) + (note ? '<span class="cn">' + esc(note) + '</span>' : ''));
      box.appendChild(span);
    });
    return box;
  }

  /* ---------- 各区块渲染 ---------- */
  function renderHome() {
    var p = DATA.profile || {};
    main.innerHTML = '';

    /* Hero */
    var hero = h('section', 'hero');
    var intro = p.tagline ? '<p>' + esc(p.tagline) + '</p>' : '';
    hero.innerHTML =
      '<div class="wrap hero-inner">' +
        '<div class="eyebrow">' + esc(p.affil || T.defaultAffil) + (p.title ? ' · ' + esc(p.title) : '') + '</div>' +
        '<h1>' + esc(p.name || '') + '</h1>' +
        (p.enName ? '<div class="en">' + esc(p.enName) + '</div>' : '') +
        intro +
      '</div>' +
      '<div class="scroll-hint">' + T.scrollHint + '</div>';
    if (!p.tagline && p.bio) {
      hero.querySelector('.hero-inner').insertAdjacentHTML('beforeend',
        '<p>' + esc(p.bio.slice(0, 90)) + (p.bio.length > 90 ? '…' : '') + '</p>');
    }
    var cta = h('div', 'hero-cta');
    cta.innerHTML =
      '<a class="btn btn-primary" href="#/sec-pub">' + T.ctaPubs + '</a>' +
      '<a class="btn btn-ghost" href="#/contact">' + T.ctaContact + '</a>';
    hero.querySelector('.hero-inner').appendChild(cta);
    main.appendChild(hero);

    /* 关于我 */
    var about = h('section', 'section');
    about.id = 'about';
    var wrapA = h('div', 'wrap');
    wrapA.innerHTML = '<div class="kicker">' + T.aboutKicker + '</div><h2 class="sec-title">' + T.aboutTitle + '</h2>';
    var grid = h('div', 'about-grid');
    var txt = h('div', 'about-text');
    var paragraphs = String(p.bio || '').split(/\n+/).filter(Boolean);
    if (!paragraphs.length) paragraphs = [T.noBio];
    paragraphs.forEach(function (t) { txt.appendChild(h('p', null, esc(t))); });
    var photo = h('img', 'profile-photo');
    photo.src = p.photo || 'assets/avatar.svg';
    photo.alt = p.name || '';
    grid.appendChild(txt);
    grid.appendChild(photo);
    wrapA.appendChild(grid);

    var pillars = h('div', 'pillars');
    [
      [T.labelAffil, p.affil || ''],
      [T.labelTitle, p.title || ''],
      [T.labelInterests, (p.interests || []).slice(0, 3).join(' · ')]
    ].forEach(function (kv) {
      if (!kv[1]) return;
      pillars.appendChild(h('div', 'pillar',
        '<div class="pillar-label">' + esc(kv[0]) + '</div><div class="pillar-val">' + esc(kv[1]) + '</div>'));
    });
    if (pillars.children.length) wrapA.appendChild(pillars);
    about.appendChild(wrapA);
    main.appendChild(about);

    /* 研究兴趣 */
    if ((p.interests || []).length) {
      var it = h('section', 'section');
      it.style.paddingTop = '0';
      var wrapI = h('div', 'wrap');
      wrapI.innerHTML = '<div class="kicker">' + T.interestsKicker + '</div><h2 class="sec-title">' + T.interestsTitle + '</h2>';
      var cloud = h('div', 'skill-cloud');
      p.interests.forEach(function (x, idx) {
        cloud.appendChild(h('span', 'skill-pill' + (idx === 0 ? ' featured' : ''), esc(x)));
      });
      wrapI.appendChild(cloud);
      it.appendChild(wrapI);
      main.appendChild(it);
    }

    /* 学术概览 + 最新动态 */
    var over = h('section', 'section');
    over.style.paddingTop = '0';
    var wrapO = h('div', 'wrap');
    var hg = h('div', 'home-grid');

    var cStat = h('div', 'card');
    cStat.innerHTML = '<h3>' + T.overview + '</h3><ul class="ct-list" id="statList"></ul>';
    hg.appendChild(cStat);

    var cNews = h('div', 'card');
    cNews.innerHTML = '<h3>' + T.recent + '</h3><ul class="ct-list" id="newsList"></ul>';
    hg.appendChild(cNews);

    wrapO.appendChild(hg);
    over.appendChild(wrapO);
    main.appendChild(over);

    var counts = [];
    (DATA.sections || []).forEach(function (s) {
      var n = (s.items || []).length;
      (s.subsections || []).forEach(function (sb) { n += (sb.items || []).length; });
      counts.push('<li><span class="lb">' + esc(s.title) + '</span><span class="vl">' + T.count(n) + '</span></li>');
    });
    $('#statList').innerHTML = counts.join('') || '<li><span class="vl">' + T.none + '</span></li>';

    var recent = allItems().filter(function (x) { return x.item.year; })
      .sort(function (a, b) { return b.item.year - a.item.year; }).slice(0, 6);
    $('#newsList').innerHTML = recent.length
      ? recent.map(function (x) {
          return '<li><span class="lb">' + esc(x.item.year) + '</span><span class="vl">' + esc(x.item.title) + '</span></li>';
        }).join('')
      : '<li><span class="vl">' + T.none + '</span></li>';

    /* 联系 */
    var ct = h('section', 'section');
    ct.id = 'contact';
    ct.style.paddingTop = '0';
    var wrapC = h('div', 'wrap');
    var contacts = p.contacts || [];
    var mail = (contacts.filter(function (c) { return /mailto:/.test(c.href || ''); })[0] || {}).value || '';
    var home = (contacts.filter(function (c) { return /^https?:/.test(c.href || ''); })[0] || {});
    var card = h('div', 'contact-card');
    card.innerHTML =
      '<h2>' + T.contactTitle + '</h2>' +
      '<p>' + T.contactLead + '</p>' +
      (mail ? '<div class="addr">' + esc(mail) + '</div>' : '');
    var row = h('div', 'contact-row');
    if (mail) row.insertAdjacentHTML('beforeend', '<a class="btn btn-primary" href="mailto:' + esc(mail) + '">' + T.emailMe + '</a>');
    if (home.href) row.insertAdjacentHTML('beforeend', '<a class="btn btn-ghost" href="' + esc(home.href) + '" target="_blank" rel="noopener">' + T.facultyPage + '</a>');
    card.appendChild(row);

    var others = contacts.filter(function (c) { return c.label && c.value && c.value !== mail; });
    if (others.length) {
      var ul = h('ul', 'ct-list');
      ul.style.cssText = 'max-width:460px;margin:34px auto 0;text-align:left;';
      others.forEach(function (c) {
        ul.insertAdjacentHTML('beforeend',
          '<li><span class="lb">' + esc(c.label) + '</span><span class="vl">' +
          (c.href ? '<a href="' + esc(c.href) + '"' + (/^https?:/.test(c.href) ? ' target="_blank" rel="noopener"' : '') + '>' + esc(c.value) + '</a>' : esc(c.value)) +
          '</span></li>');
      });
      card.appendChild(ul);
    }
    wrapC.appendChild(card);
    ct.appendChild(wrapC);
    main.appendChild(ct);
  }

  function renderSection(sec) {
    main.innerHTML = '';
    var wrap = h('div', 'wrap');
    wrap.innerHTML =
      '<div class="page-head"><div class="kicker">' + esc(sec.kicker || '') + '</div>' +
      '<h2 class="sec-title">' + esc(sec.title) + '</h2>' +
      (sec.desc ? '<div class="sec-sub">' + esc(sec.desc) + '</div>' : '') + '</div>';
    var body = h('div', 'section');
    body.style.paddingTop = '34px';
    wrap.appendChild(body);
    main.appendChild(wrap);

    var subs = sec.subsections || [];
    var usePubs = sec.id === 'sec-pub';
    var useGrants = sec.id === 'sec-proj';

    function block(title, items, subId) {
      var g = h('div', 'subgroup');
      if (title) g.appendChild(h('div', 'subgroup-title', esc(title)));
      if (subId === 'sub-course') g.appendChild(chipCloudEl(items));
      else if (usePubs) g.appendChild(pubListEl(items));
      else if (useGrants) g.appendChild(grantListEl(items));
      else g.appendChild(listEl(items));
      body.appendChild(g);
    }

    if (subs.length) {
      subs.forEach(function (sb) { block(sb.title, sb.items, sb.id); });
    } else {
      block('', sec.items, null);
    }
  }

  /* ---------- 路由 ---------- */
  function route() {
    var hash = (location.hash || '').replace(/^#\/?/, '');
    if (!hash) hash = 'home';
    var langA = navlinks.querySelector('a.lang');
    if (langA) langA.href = OTHER_PAGE + (hash === 'home' ? '' : '#/' + hash);
    Array.prototype.forEach.call(navlinks.querySelectorAll('a'), function (a) {
      a.classList.toggle('on', a.dataset.route === hash);
    });
    if (hash === 'home') { renderHome(); window.scrollTo(0, 0); return; }
    var sec = (DATA.sections || []).filter(function (s) { return s.id === hash; })[0];
    if (!sec) { renderHome(); window.scrollTo(0, 0); return; }
    renderSection(sec);
    window.scrollTo(0, 0);
  }
  function renderNav() {
    var html = '<a href="#/home" data-route="home">' + T.navHome + '</a>';
    (DATA.sections || []).forEach(function (s) {
      html += '<a href="#/' + esc(s.id) + '" data-route="' + esc(s.id) + '">' + esc(s.title) + '</a>';
    });
    html += '<a href="#/home" data-scrollto="contact">' + T.navContact + '</a>';
    html += '<a class="lang" href="' + OTHER_PAGE + '" hreflang="' + (IS_EN ? 'zh-CN' : 'en') + '"' +
            ' title="' + esc(T.langTitle) + '">' + esc(T.langLabel) + '</a>';
    navlinks.innerHTML = html;
  }

  /* ---------- 点击（PDF / 正文） ---------- */
  main.addEventListener('click', function (e) {
    var btn = e.target.closest('button.it');
    if (!btn) return;
    var act = btn.dataset.act;
    if (act === 'pdf') {
      var tt = btn.querySelector('.pub-title') || btn.querySelector('.grant-title') || btn.querySelector('.tt');
      openModal(tt ? tt.textContent : '', '', { pdf: btn.dataset.src, openUrl: btn.dataset.src });
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
    var out = '';
    if (!hits.length) {
      out = '<div class="none">' + T.noResults + '</div>';
    } else {
      var last = '';
      hits.slice(0, 40).forEach(function (x) {
        var g = x.sec + (x.sub ? ' · ' + x.sub : '');
        if (g !== last) { out += '<div class="grp">' + esc(g) + '</div>'; last = g; }
        out += '<a class="hit" href="#/' + esc(x.secId) + '" data-id="' + esc(x.item.id) + '" data-sec="' + esc(x.secId) + '">' +
          '<div class="t">' + esc(x.item.title) + '</div>' +
          (x.item.meta ? '<div class="m">' + esc(x.item.meta) + '</div>' : '') + '</a>';
      });
    }
    panel.innerHTML = out;
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

  /* ---------- 汉堡菜单 / 滚动描边 ---------- */
  var burger = $('#burger');
  if (burger) burger.addEventListener('click', function () { navlinks.classList.toggle('open'); });
  navlinks.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    navlinks.classList.remove('open');
    if (a.dataset.scrollto) {
      e.preventDefault();
      if (location.hash && location.hash !== '#/home') location.hash = '#/home';
      setTimeout(function () {
        var t = document.getElementById(a.dataset.scrollto);
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  });
  window.addEventListener('scroll', function () {
    navEl.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });

  /* ---------- 启动 ---------- */
  fetch(DATA_URL).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function (d) {
    DATA = d;
    document.title = (d.profile && d.profile.name ? d.profile.name + ' · ' : '') +
      ((d.profile && d.profile.affil) || T.defaultAffil);
    if (d.profile) {
      var desc = document.querySelector('meta[name="description"]');
      if (desc && d.profile.bio) desc.setAttribute('content', d.profile.bio.slice(0, 120));
    }
    $('#footerIn').innerHTML =
      '<div>' + esc([d.profile && d.profile.affil, '© ' + new Date().getFullYear()].filter(Boolean).join(' · ')) + '</div>';
    renderNav();
    route();
  }).catch(function () {
    main.innerHTML = '<div class="section"><div class="wrap"><p style="color:#b3a8c4">' + T.loadFail + '</p></div></div>';
  });

  window.addEventListener('hashchange', function () { if (DATA) route(); });
})();
