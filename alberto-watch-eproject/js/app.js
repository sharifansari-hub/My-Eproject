/* =========================================================
   Alberto Watch Company - single-page application
   Requires: jQuery 3, Bootstrap 5 (bundle), data/watches.json
   ========================================================= */
(function ($) {
  'use strict';

  var DATA = null;
  var FEATURED = ['datejust-36', 'accutron-214', 's1-smart-sport', 'promaster-diver'];
  var ROUTES = ['home', 'products', 'price-list', 'technology', 'stores', 'support', 'gallery', 'about', 'contact', 'sitemap'];

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { $.fx.off = true; }

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) { return '$' + Number(n).toLocaleString('en-US'); }
  function product(id) { return $.grep(DATA.products, function (p) { return p.id === id; })[0]; }
  function category(id) { return $.grep(DATA.categories, function (c) { return c.id === id; })[0]; }
  function catName(id) { var c = category(id); return c ? c.name : id; }
  function inCategory(id) { return $.grep(DATA.products, function (p) { return p.cat === id; }); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  /* ---------- data ---------- */
  function loadData() {
    var d = $.Deferred();
    $.getJSON('data/watches.json').done(d.resolve).fail(function () {
      // Opened straight from disk (file://): browsers block JSON requests, so use the bundled copy.
      if (window.WATCH_DATA) { d.resolve(window.WATCH_DATA); } else { d.reject(); }
    });
    return d.promise();
  }

  /* =========================================================
     Router: shows one "page" at a time with a fade
     ========================================================= */
  var currentRoute = null, navToken = 0, firstShow = true;

  function parseHash() {
    var parts = (location.hash || '').replace(/^#\/?/, '').split('/');
    var route = parts[0] || 'home';
    if (ROUTES.indexOf(route) === -1) { route = 'home'; }
    return { route: route, arg: parts[1] || '' };
  }

  function onRoute() {
    var r = parseHash();
    if (r.route === 'products') { setCategory(r.arg || 'all'); }
    hideCartToast();
    show(r.route);
  }

  function show(route) {
    var $next = $('#page-' + route);
    var title = $next.data('title');
    document.title = route === 'home' ? 'Alberto Watch Company' : title + ' | Alberto Watch Company';

    $('#menuList .nav-link').removeClass('active').removeAttr('aria-current')
      .filter('[data-route="' + route + '"]').addClass('active').attr('aria-current', 'page');

    var menu = document.getElementById('mainMenu');
    if ($(menu).hasClass('show')) { bootstrap.Collapse.getOrCreateInstance(menu).hide(); }

    if (currentRoute === route) { return; }
    currentRoute = route;
    var token = ++navToken;
    var $cur = $('.page:visible').not($next);
    $('.page').not($next).not($cur).hide();

    function reveal() {
      if (token !== navToken) { return; }
      $next.stop(true, true).fadeIn(300);
      if (!firstShow) {
        window.scrollTo(0, 0);
        document.getElementById('app').focus({ preventScroll: true });
      }
      firstShow = false;
    }
    if ($cur.length) { $cur.stop(true, true).fadeOut(180, reveal); } else { reveal(); }
  }

  /* =========================================================
     Home
     ========================================================= */
  function renderHome() {
    var tiles = $.map(DATA.categories, function (c) {
      var list = inCategory(c.id), first = list[0];
      return '<div class="col-6 col-md-4 col-lg"><a class="tile" href="#/products/' + c.id + '">' +
        '<img src="' + first.image + '" alt="" width="400" height="400" loading="lazy">' +
        '<span class="tile-label"><span class="tile-name">' + esc(c.name) + '</span>' +
        '<span class="tile-count">' + plural(list.length, 'item', 'items') + '</span></span></a></div>';
    });
    $('#lineupTiles').html(tiles.join(''));
    $('#featuredGrid').html($.map(FEATURED, function (id) { return cardHtml(product(id), 'col-6 col-lg-3'); }).join(''));
  }

  function cardHtml(p, cols) {
    return '<div class="' + cols + '"><div class="p-card-wrap h-100 d-flex flex-column">' +
      '<button type="button" class="p-card" data-product="' + esc(p.id) + '">' +
      '<img src="' + p.image + '" alt="' + esc(p.brand + ' ' + p.name) + '" width="400" height="400" loading="lazy">' +
      '<span class="p-body"><span class="p-brand">' + esc(p.brand) + '</span>' +
      '<span class="p-name">' + esc(p.name) + '</span>' +
      '<span class="p-short">' + esc(p.short) + '</span>' +
      '<span class="p-price">' + money(p.price) + '</span></span></button>' +
      '<div class="px-1 pb-1"><button type="button" class="add-cart-btn" data-add-cart="' + esc(p.id) + '">Add to cart</button></div>' +
      '</div></div>';
  }

  /* live analog clock in the hero */
  function buildClockFace() {
    var s = '', i, a, x1, y1, x2, y2, r = 172;
    function pt(rad, deg) { var t = deg * Math.PI / 180; return [200 + rad * Math.sin(t), 200 - rad * Math.cos(t)]; }
    for (i = 0; i < 60; i++) {
      if (i % 5 === 0) { continue; }
      a = pt(r - 6, i * 6); x1 = a[0]; y1 = a[1]; a = pt(r - 16, i * 6);
      s += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + a[0].toFixed(1) + '" y2="' + a[1].toFixed(1) + '" stroke="#5d7269" stroke-width="1.5"/>';
    }
    for (i = 0; i < 12; i++) {
      if (i % 3 === 0) { continue; }
      a = pt(r - 8, i * 30); x1 = a[0]; y1 = a[1]; a = pt(r - 30, i * 30);
      s += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + a[0].toFixed(1) + '" y2="' + a[1].toFixed(1) + '" stroke="#0f2b26" stroke-width="6"/>';
    }
    $.each([[12, 0], [3, 90], [6, 180], [9, 270]], function (_, n) {
      var p = pt(r - 36, n[1]);
      s += '<text x="' + p[0].toFixed(1) + '" y="' + p[1].toFixed(1) + '" dy=".35em" text-anchor="middle" font-family="\'Bodoni Moda\', Didot, Georgia, serif" font-size="40" font-weight="500" fill="#0f2b26">' + n[0] + '</text>';
    });
    s += '<text x="200" y="128" text-anchor="middle" font-family="\'Bodoni Moda\', Didot, Georgia, serif" font-size="15" letter-spacing="4" fill="#8f6a26">ALBERTO</text>';
    $('#clockFace').html(s);
  }

  var clockTurns = 0, lastSec = null;
  function tickClock() {
    var d = new Date(), s = d.getSeconds(), m = d.getMinutes(), h = d.getHours() % 12;
    if (lastSec !== null && s < lastSec) { clockTurns++; }
    lastSec = s;
    $('#hSec').css('transform', 'rotate(' + (clockTurns * 360 + s * 6) + 'deg)');
    $('#hMin').css('transform', 'rotate(' + ((m + s / 60) * 6) + 'deg)');
    $('#hHour').css('transform', 'rotate(' + ((h + m / 60) * 30) + 'deg)');
    $('#clockCaption').text(d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
  }

  /* =========================================================
     Products
     ========================================================= */
  var currentCat = 'all';

  function renderPills() {
    var html = '<button type="button" class="pill" data-cat="all">All</button>';
    $.each(DATA.categories, function (_, c) {
      html += '<button type="button" class="pill" data-cat="' + c.id + '">' + esc(c.name) + '</button>';
    });
    $('#categoryPills').html(html);
  }

  function setCategory(id) {
    if (id !== 'all' && !category(id)) { id = 'all'; }
    currentCat = id;
    $('#categoryPills .pill').each(function () {
      var on = $(this).data('cat') === id;
      $(this).toggleClass('active', on).attr('aria-pressed', on);
    });
    var list = id === 'all' ? DATA.products : inCategory(id);
    $('#categoryBlurb').text(id === 'all' ? 'All watches and clocks we carry.' : category(id).blurb);
    $('#resultCount').text('Showing ' + plural(list.length, 'item', 'items') + (id === 'all' ? '' : ' in ' + catName(id)));
    $('#productGrid').html($.map(list, function (p) { return cardHtml(p, 'col-6 col-md-4 col-lg-3'); }).join(''));
  }

  /* product popup */
  var currentProduct = null;
  function openProduct(id) {
    var p = product(id);
    if (!p) { return; }
    currentProduct = p;
    $('#pmBrand').text(p.brand + ' | ' + catName(p.cat));
    $('#pmTitle').text(p.name);
    $('#pmImage').attr({ src: p.image, alt: p.brand + ' ' + p.name });
    $('#pmPrice').text(money(p.price));
    $('#pmDesc').text(p.desc);
    $('#pmSpecs').html($.map(p.specs, function (s) {
      return '<tr><th scope="row">' + esc(s.label) + '</th><td>' + esc(s.value) + '</td></tr>';
    }).join(''));
    bootstrap.Modal.getOrCreateInstance(document.getElementById('productModal')).show();
  }

  /* =========================================================
     Price list
     ========================================================= */
  var priceState = { q: '', cat: 'all', key: 'price', dir: 1 };

  function renderPriceControls() {
    var opts = '<option value="all">All line-ups</option>';
    $.each(DATA.categories, function (_, c) { opts += '<option value="' + c.id + '">' + esc(c.name) + '</option>'; });
    $('#priceCategory').html(opts);
  }

  function renderPriceList() {
    var q = priceState.q.toLowerCase();
    var list = $.grep(DATA.products, function (p) {
      var okCat = priceState.cat === 'all' || p.cat === priceState.cat;
      var okText = !q || (p.name + ' ' + p.brand).toLowerCase().indexOf(q) !== -1;
      return okCat && okText;
    });
    var k = priceState.key, dir = priceState.dir;
    list.sort(function (a, b) {
      var va = k === 'cat' ? catName(a.cat) : a[k], vb = k === 'cat' ? catName(b.cat) : b[k];
      if (typeof va === 'number') { return (va - vb) * dir; }
      return String(va).localeCompare(String(vb)) * dir;
    });
    var rows = $.map(list, function (p) {
      return '<tr data-product="' + esc(p.id) + '" tabindex="0"><td><div class="d-flex align-items-center">' +
        '<img class="thumb" src="' + p.image + '" alt="" width="44" height="44" loading="lazy"><span>' + esc(p.name) + '</span></div></td>' +
        '<td>' + esc(p.brand) + '</td><td>' + esc(catName(p.cat)) + '</td><td class="amount">' + money(p.price) + '</td></tr>';
    });
    if (!rows.length) {
      rows = ['<tr><td colspan="4" class="text-center py-4 text-muted">No watches match. Clear the search or choose All line-ups.</td></tr>'];
    }
    $('#priceBody').html(rows.join(''));
    $('#priceCount').text('Showing ' + list.length + ' of ' + DATA.products.length);
    $('.sort-btn').removeClass('asc desc').closest('th').removeAttr('aria-sort');
    $('.sort-btn[data-sort="' + k + '"]').addClass(dir === 1 ? 'asc' : 'desc')
      .closest('th').attr('aria-sort', dir === 1 ? 'ascending' : 'descending');
  }

  /* =========================================================
     Technology
     ========================================================= */
  function renderTechnology() {
    var html = $.map(DATA.technology, function (t, i) {
      var found = $.map(t.found, function (id) {
        var p = product(id);
        return p ? '<button type="button" class="chip" data-product="' + esc(p.id) + '">' + esc(p.name) + '</button>' : '';
      }).join('');
      return '<div class="accordion-item"><h2 class="accordion-header" id="th-' + t.id + '">' +
        '<button class="accordion-button' + (i ? ' collapsed' : '') + '" type="button" data-bs-toggle="collapse" data-bs-target="#tc-' + t.id + '" aria-expanded="' + (i ? 'false' : 'true') + '" aria-controls="tc-' + t.id + '">' + esc(t.title) + '</button></h2>' +
        '<div id="tc-' + t.id + '" class="accordion-collapse collapse' + (i ? '' : ' show') + '" data-bs-parent="#techAccordion" aria-labelledby="th-' + t.id + '"><div class="accordion-body">' +
        '<p>' + esc(t.summary) + '</p><ul>' + $.map(t.points, function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
        '<div class="found-in">Found in: ' + found + '</div></div></div></div>';
    });
    $('#techAccordion').html(html.join(''));
    $('#waterTable tbody').html($.map(DATA.waterResistance, function (w) {
      return '<tr><td>' + esc(w.depth) + '</td><td>' + esc(w.use) + '</td></tr>';
    }).join(''));
  }

  /* =========================================================
     Store locator (uses HTML5 geolocation for "nearest")
     ========================================================= */
  var posCache = null;
  function getPosition() {
    var d = $.Deferred();
    if (posCache) { return d.resolve(posCache).promise(); }
    if (!navigator.geolocation) { return d.reject({ code: 0 }).promise(); }
    navigator.geolocation.getCurrentPosition(function (p) {
      posCache = { lat: p.coords.latitude, lng: p.coords.longitude };
      d.resolve(posCache);
    }, function (e) { d.reject(e); }, { timeout: 10000, maximumAge: 600000 });
    return d.promise();
  }

  function distanceKm(a, b) {
    var R = 6371, rad = Math.PI / 180;
    var dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    var h = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.pow(Math.sin(dLng / 2), 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  var storeState = { q: '', nearest: false };
  function renderStores() {
    var q = storeState.q.toLowerCase();
    var list = $.grep(DATA.stores, function (s) { return !q || (s.city + ' ' + s.name).toLowerCase().indexOf(q) !== -1; });
    if (posCache) {
      $.each(list, function (_, s) { s._km = distanceKm(posCache, s); });
      if (storeState.nearest) { list.sort(function (a, b) { return a._km - b._km; }); }
    }
    var html = $.map(list, function (s, i) {
      var isNearest = storeState.nearest && posCache && i === 0;
      var dist = posCache && storeState.nearest ? '<p class="s-dist">' + (isNearest ? 'Nearest to you: about ' : 'About ') + Math.round(s._km).toLocaleString('en-US') + ' km away</p>' : '';
      return '<div class="col-md-6 col-lg-4"><article class="s-card"><h3>' + esc(s.name) + '</h3><p class="s-city">' + esc(s.city) + '</p>' + dist +
        '<p>' + esc(s.address) + '</p><p><a href="tel:' + esc(s.phone.replace(/\s/g, '')) + '">' + esc(s.phone) + '</a></p><p>' + esc(s.hours) + '</p>' +
        '<div>' + $.map(s.services, function (x) { return '<span class="service-tag">' + esc(x) + '</span>'; }).join('') + '</div>' +
        '<p class="mt-3 mb-0"><a class="link-brass" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&amp;query=' + s.lat + ',' + s.lng + '">Open in Google Maps</a></p></article></div>';
    });
    $('#storeList').html(html.length ? html.join('') : '<div class="col-12"><p class="text-muted">No store found in that city. Try another name, or clear the box to see every store.</p></div>');
  }

  /* =========================================================
     Support, gallery, about, contact, sitemap
     ========================================================= */
  function renderFaq() {
    $('#faqAccordion').html($.map(DATA.faqs, function (f, i) {
      return '<div class="accordion-item"><h3 class="accordion-header" id="fh-' + i + '"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#fc-' + i + '" aria-expanded="false" aria-controls="fc-' + i + '">' + esc(f.q) + '</button></h3>' +
        '<div id="fc-' + i + '" class="accordion-collapse collapse" aria-labelledby="fh-' + i + '" data-bs-parent="#faqAccordion"><div class="accordion-body">' + esc(f.a) + '</div></div></div>';
    }).join(''));
  }

  var galleryItems = [], galleryIndex = 0;
  function renderGallery() {
    galleryItems = $.map(DATA.products, function (p) { return { src: p.image, caption: p.brand + ' ' + p.name }; })
      .concat($.map(DATA.galleryExtra, function (g) { return { src: g.file, caption: g.caption }; }));
    $('#galleryGrid').html($.map(galleryItems, function (g, i) {
      return '<div class="col-6 col-md-4 col-lg-3"><button type="button" class="g-item" data-gallery="' + i + '">' +
        '<img src="' + g.src + '" alt="' + esc(g.caption) + '" width="400" height="400" loading="lazy"><span>' + esc(g.caption) + '</span></button></div>';
    }).join(''));
  }
  function showGallery(i) {
    galleryIndex = (i + galleryItems.length) % galleryItems.length;
    var g = galleryItems[galleryIndex];
    $('#gmImage').attr({ src: g.src, alt: g.caption });
    $('#gmCaption').text(g.caption + ' (' + (galleryIndex + 1) + ' of ' + galleryItems.length + ')');
  }

  function contactHtml(withTitle) {
    var c = DATA.company, hq = DATA.stores[0];
    return (withTitle ? '<h2>Get in touch</h2>' : '') +
      '<dl class="mb-0"><dt>Email</dt><dd><a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a></dd>' +
      '<dt>Phone</dt><dd><a href="tel:' + esc(c.phone.replace(/\s/g, '')) + '">' + esc(c.phone) + '</a></dd>' +
      '<dt>Address</dt><dd>' + esc(c.address) + '</dd><dt>Opening hours</dt><dd>' + esc(hq.hours) + '</dd></dl>';
  }

  function renderSitemap() {
    function link(route, label) { return '<a href="#/' + route + '">' + esc(label) + '</a>'; }
    var lineups = $.map(DATA.categories, function (c) { return '<li><a href="#/products/' + c.id + '">' + esc(c.name) + '</a></li>'; }).join('');
    var groups = [
      ['Shop', '<li>' + link('home', 'Home') + '</li><li>' + link('products', 'Products') + '<ul><li><a href="#/products/all">All products</a></li>' + lineups + '</ul></li><li>' + link('price-list', 'Price list') + '</li>'],
      ['Learn and visit', '<li>' + link('technology', 'Technology') + '</li><li>' + link('stores', 'Store locator') + '</li><li>' + link('support', 'Support') + '</li>'],
      ['About us', '<li>' + link('gallery', 'Gallery') + '</li><li>' + link('about', 'About us') + '</li><li>' + link('contact', 'Contact us') + '</li><li>' + link('sitemap', 'Site map') + '</li>']
    ];
    $('#sitemapGrid').html($.map(groups, function (g) {
      return '<div class="col-md-4 sm-group"><h2>' + g[0] + '</h2><ul>' + g[1] + '</ul></div>';
    }).join(''));
  }

  /* form handling: validate, save to this browser's localStorage, confirm */
  function bindForm(formId, doneId, storeKey, message) {
    $(formId).on('submit', function (e) {
      e.preventDefault();
      var f = this;
      if (!f.checkValidity()) {
        $(f).addClass('was-validated');
        $(f).find(':invalid').first().trigger('focus');
        return;
      }
      var rec = { savedAt: new Date().toISOString() };
      $(f).find('input, select, textarea').each(function () { rec[this.id] = $(this).val(); });
      var ref = 'AWC-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      rec.reference = ref;
      try {
        var list = JSON.parse(localStorage.getItem(storeKey) || '[]');
        list.push(rec);
        localStorage.setItem(storeKey, JSON.stringify(list));
      } catch (err) { /* storage unavailable: still confirm */ }
      f.reset();
      $(f).removeClass('was-validated');
      $(doneId).removeClass('d-none').text(message(ref, rec));
    });
  }

  /* =========================================================
     Account (sign in / register) - demo only, stored in this browser
     ========================================================= */
  var currentUser = null;

  function loadAccounts() {
    try { return JSON.parse(localStorage.getItem('awc_accounts') || '[]'); } catch (e) { return []; }
  }
  function saveAccounts(list) {
    try { localStorage.setItem('awc_accounts', JSON.stringify(list)); } catch (e) { /* storage unavailable */ }
  }
  function setCurrentUser(user) {
    currentUser = user;
    try {
      if (user) { sessionStorage.setItem('awc_session', JSON.stringify(user)); }
      else { sessionStorage.removeItem('awc_session'); }
    } catch (e) { /* storage unavailable */ }
    renderAccount();
  }
  function restoreSession() {
    try {
      var u = JSON.parse(sessionStorage.getItem('awc_session') || 'null');
      if (u) { currentUser = u; }
    } catch (e) { /* ignore */ }
    renderAccount();
  }

  function renderAccount() {
    if (currentUser) {
      $('#accountLabel').text(currentUser.name.split(' ')[0]);
      $('#authView').addClass('d-none');
      $('#profileView').removeClass('d-none');
      $('#profileName').text(currentUser.name);
      $('#profileEmail').text(currentUser.email);
      $('#accountModalLabel').text('Your account');
    } else {
      $('#accountLabel').text('Sign in');
      $('#authView').removeClass('d-none');
      $('#profileView').addClass('d-none');
      $('#accountModalLabel').text('Sign in');
    }
  }

  function openAccount() {
    bootstrap.Modal.getOrCreateInstance(document.getElementById('accountModal')).show();
  }

  function bindAccount() {
    $('#accountBtn').on('click', openAccount);
    $('#signOutBtn').on('click', function () {
      setCurrentUser(null);
      bootstrap.Modal.getInstance(document.getElementById('accountModal')).hide();
    });

    $('#signinForm').on('submit', function (e) {
      e.preventDefault();
      var f = this;
      $('#siError').addClass('d-none');
      if (!f.checkValidity()) { $(f).addClass('was-validated'); return; }
      var email = $.trim($('#siEmail').val()).toLowerCase(), pass = $('#siPassword').val();
      var match = $.grep(loadAccounts(), function (a) { return a.email === email && a.password === pass; })[0];
      if (!match) { $('#siError').removeClass('d-none'); return; }
      $(f).removeClass('was-validated')[0].reset();
      setCurrentUser({ name: match.name, email: match.email });
      bootstrap.Modal.getInstance(document.getElementById('accountModal')).hide();
    });

    $('#registerForm').on('submit', function (e) {
      e.preventDefault();
      var f = this;
      $('#rgError').addClass('d-none');
      if (!f.checkValidity()) { $(f).addClass('was-validated'); return; }
      var email = $.trim($('#rgEmail').val()).toLowerCase();
      var accounts = loadAccounts();
      if ($.grep(accounts, function (a) { return a.email === email; }).length) { $('#rgError').removeClass('d-none'); return; }
      var user = { name: $.trim($('#rgName').val()), email: email, password: $('#rgPassword').val() };
      accounts.push(user);
      saveAccounts(accounts);
      $(f).removeClass('was-validated')[0].reset();
      setCurrentUser({ name: user.name, email: user.email });
      bootstrap.Modal.getInstance(document.getElementById('accountModal')).hide();
    });
  }

  /* =========================================================
     Shopping cart - demo only, stored in this browser
     ========================================================= */
  var cart = {};

  function loadCart() {
    try { cart = JSON.parse(localStorage.getItem('awc_cart') || '{}'); } catch (e) { cart = {}; }
  }
  function saveCart() {
    try { localStorage.setItem('awc_cart', JSON.stringify(cart)); } catch (e) { /* storage unavailable */ }
  }
  function cartCount() {
    var n = 0; $.each(cart, function (_, q) { n += q; }); return n;
  }
  function addToCart(id, qty) {
    cart[id] = (cart[id] || 0) + (qty || 1);
    saveCart(); renderCart();
  }
  function setQty(id, qty) {
    if (qty <= 0) { delete cart[id]; } else { cart[id] = qty; }
    saveCart(); renderCart();
  }

  function renderCart() {
    var ids = $.grep(Object.keys(cart), function (id) { return !!product(id); });
    var count = 0, total = 0;
    var rows = $.map(ids, function (id) {
      var p = product(id), q = cart[id];
      count += q; total += q * p.price;
      return '<div class="cart-item" data-id="' + esc(id) + '">' +
        '<img src="' + p.image + '" alt="" width="64" height="64">' +
        '<div class="cart-item-body"><div class="cart-item-name">' + esc(p.name) + '</div>' +
        '<div class="cart-item-brand">' + esc(p.brand) + '</div>' +
        '<div class="cart-item-row"><div class="qty-group">' +
        '<button type="button" class="qty-dec" aria-label="Decrease quantity">\u2212</button>' +
        '<span>' + q + '</span>' +
        '<button type="button" class="qty-inc" aria-label="Increase quantity">+</button></div>' +
        '<span class="cart-item-price">' + money(q * p.price) + '</span></div>' +
        '<button type="button" class="remove-item">Remove</button></div></div>';
    });
    $('#cartItems').html(rows.join(''));
    $('#cartEmpty').toggleClass('d-none', ids.length > 0);
    $('#cartSummary').toggleClass('d-none', ids.length === 0);
    $('#cartSubtotal').text(money(total));
    $('#checkoutNote').text(currentUser ? 'Checking out as ' + currentUser.name + '.' : 'Sign in to check out.');
    var $badge = $('#cartCount').text(count);
    $badge.attr('data-zero', count === 0 ? '1' : '0');
    $('[data-add-cart]').each(function () {
      var id = $(this).data('add-cart');
      $(this).toggleClass('added', !!cart[id]).text(cart[id] ? 'In cart (' + cart[id] + ')' : 'Add to cart');
    });
  }

  function flashAdded($btn) {
    $btn.addClass('added');
    clearTimeout($btn.data('flashTimer'));
    var t = setTimeout(function () { renderCart(); }, 1400);
    $btn.data('flashTimer', t);
  }

  var toastTimer = null;
  function showCartToast(p) {
    $('#ctImage').attr({ src: p.image, alt: '' });
    $('#ctName').text(p.brand + ' ' + p.name);
    var $toast = $('#cartToast').addClass('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { $toast.removeClass('show'); }, 3200);
  }
  function hideCartToast() { clearTimeout(toastTimer); $('#cartToast').removeClass('show'); }

  function bindCart() {
    $(document).on('click', '[data-add-cart]', function (e) {
      e.stopPropagation();
      var id = $(this).data('add-cart'), p = product(id);
      addToCart(id, 1);
      flashAdded($(this));
      if (p) { showCartToast(p); }
    });
    $('#pmAddCart').on('click', function () {
      if (!currentProduct) { return; }
      addToCart(currentProduct.id, 1);
      $(this).text('Added \u2713');
      showCartToast(currentProduct);
      var self = this;
      setTimeout(function () { $(self).text('Add to cart'); }, 1400);
    });
    $('#ctClose').on('click', hideCartToast);
    $('#ctViewCart').on('click', function (e) {
      e.preventDefault();
      hideCartToast();
      bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('cartPanel')).show();
    });
    $('#cartItems').on('click', '.qty-inc, .qty-dec, .remove-item', function () {
      var id = $(this).closest('.cart-item').data('id');
      if ($(this).hasClass('qty-inc')) { setQty(id, (cart[id] || 0) + 1); }
      else if ($(this).hasClass('qty-dec')) { setQty(id, (cart[id] || 0) - 1); }
      else { setQty(id, 0); }
    });
    $('#checkoutBtn').on('click', function () {
      var panel = bootstrap.Offcanvas.getInstance(document.getElementById('cartPanel'));
      if (!currentUser) {
        if (panel) { panel.hide(); }
        openAccount();
        return;
      }
      var count = cartCount();
      cart = {}; saveCart(); renderCart();
      if (panel) { panel.hide(); }
      alert('Thank you, ' + currentUser.name + '! Your order of ' + plural(count, 'watch', 'watches') + ' has been placed. This demo site has no payment processing.');
    });
  }

  /* =========================================================
     Visitor counter (top right)
     ========================================================= */
  function initVisitors() {
    var base = DATA.company.baseVisitors || 0, n = 0;
    try {
      n = parseInt(localStorage.getItem('awc_visits'), 10) || 0;
      if (!sessionStorage.getItem('awc_counted')) {
        n++;
        localStorage.setItem('awc_visits', String(n));
        sessionStorage.setItem('awc_counted', '1');
      }
    } catch (e) { /* storage blocked: show the base count */ }
    $('#visitorCount').text((base + n).toLocaleString('en-US'));
  }

  /* =========================================================
     Ticker: date, time and location
     ========================================================= */
  var tickerState = { place: '', coords: '', status: 'Finding your location...' };

  function fmtCoord(v, pos, neg) { return Math.abs(v).toFixed(2) + '\u00b0 ' + (v >= 0 ? pos : neg); }

  function renderTicker() {
    var d = new Date();
    var date = d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    var time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    var where = tickerState.coords ? (tickerState.place ? tickerState.place + ' (' + tickerState.coords + ')' : tickerState.coords) : tickerState.status;
    var html = '<span class="ticker-item"><strong>Date</strong> ' + esc(date) + '</span>' +
      '<span class="ticker-item"><strong>Time</strong> ' + esc(time) + '</span>' +
      '<span class="ticker-item"><strong>Location</strong> ' + esc(where) + '</span>' +
      '<span class="ticker-item">Alberto Watch Company: watch repair, appraisal and retail</span>' +
      '<span class="ticker-item">Use the Store Locator to find a workshop near you</span>';
    $('#tickerTrack .ticker-group').html(html);
  }

  function initTicker() {
    renderTicker();
    setInterval(renderTicker, 1000);
    getPosition().done(function (pos) {
      tickerState.coords = fmtCoord(pos.lat, 'N', 'S') + ', ' + fmtCoord(pos.lng, 'E', 'W');
      renderTicker();
      // Optional: turn the coordinates into a place name. Fails quietly if offline.
      if (window.fetch) {
        var ctl = window.AbortController ? new AbortController() : null;
        var timer = setTimeout(function () { if (ctl) { ctl.abort(); } }, 5000);
        fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&lat=' + pos.lat + '&lon=' + pos.lng,
          { headers: { 'Accept-Language': 'en' }, signal: ctl ? ctl.signal : undefined })
          .then(function (r) { return r.json(); })
          .then(function (j) {
            var a = j && j.address ? j.address : {};
            var name = a.city || a.town || a.village || a.county || a.state || '';
            tickerState.place = name ? name + (a.country ? ', ' + a.country : '') : '';
            renderTicker();
          })
          .catch(function () { /* keep the coordinates */ })
          .then(function () { clearTimeout(timer); });
      }
    }).fail(function (err) {
      tickerState.status = err && err.code === 1
        ? 'Location blocked. Allow location access in your browser to show it here'
        : 'Location not available in this browser';
      renderTicker();
    });
  }

  /* =========================================================
     Start-up
     ========================================================= */
  function bindEvents() {
    // any element with data-product opens the details popup
    $(document).on('click keydown', '[data-product]', function (e) {
      if (e.type === 'keydown') {
        if ($(this).is('button') || (e.key !== 'Enter' && e.key !== ' ')) { return; }  // buttons already react to click
        e.preventDefault();
      }
      openProduct($(this).data('product'));
    });

    $('#categoryPills').on('click', '.pill', function () { location.hash = '#/products/' + $(this).data('cat'); });

    $('#priceSearch').on('input', function () { priceState.q = $.trim(this.value); renderPriceList(); });
    $('#priceCategory').on('change', function () { priceState.cat = this.value; renderPriceList(); });
    $('.sort-btn').on('click', function () {
      var k = $(this).data('sort');
      priceState.dir = priceState.key === k ? -priceState.dir : 1;
      priceState.key = k;
      renderPriceList();
    });

    $('#storeSearch').on('input', function () { storeState.q = $.trim(this.value); renderStores(); });
    $('#nearestBtn').on('click', function () {
      var $status = $('#storeStatus').text('Finding your location...');
      getPosition().done(function () {
        storeState.nearest = true; storeState.q = ''; $('#storeSearch').val('');
        renderStores();
        $status.text('Stores sorted by distance from your current location.');
      }).fail(function (err) {
        $status.text(err && err.code === 1
          ? 'Location access is blocked. Allow it in your browser settings, or type a city instead.'
          : 'Your location could not be found. Type a city instead.');
      });
    });

    $(document).on('click', '[data-gallery]', function () {
      showGallery(parseInt($(this).data('gallery'), 10));
      bootstrap.Modal.getOrCreateInstance(document.getElementById('galleryModal')).show();
    });
    $('#gmPrev').on('click', function () { showGallery(galleryIndex - 1); });
    $('#gmNext').on('click', function () { showGallery(galleryIndex + 1); });
    $('#galleryModal').on('keydown', function (e) {
      if (e.key === 'ArrowLeft') { showGallery(galleryIndex - 1); }
      if (e.key === 'ArrowRight') { showGallery(galleryIndex + 1); }
    });

    $('#pmAsk').on('click', function () {
      var p = currentProduct;
      $('#productModal').one('hidden.bs.modal', function () {
        $('#cSubject').val('Enquiry: ' + p.brand + ' ' + p.name);
        $('#cMessage').val('Hello, I would like to know more about the ' + p.brand + ' ' + p.name + ' (' + money(p.price) + '). ');
        location.hash = '#/contact';
      });
      bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
    });

    bindForm('#supportForm', '#supportDone', 'awc_requests', function (ref, r) {
      return 'Thank you, ' + r.sName + '. Your request ' + ref + ' has been recorded. This demo site has no server, so it is stored in this browser only.';
    });
    bindForm('#contactForm', '#contactDone', 'awc_messages', function (ref, r) {
      return 'Thank you, ' + r.cName + '. Your message ' + ref + ' has been recorded. This demo site has no server, so it is stored in this browser only.';
    });

    $('#cartBtn').on('click', function () {
      bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('cartPanel')).toggle();
    });

    $(window).on('hashchange', onRoute);
  }

  $(function () {
    loadData().done(function (data) {
      DATA = data;
      renderHome();
      renderPills();
      renderPriceControls();
      renderTechnology();
      renderStores();
      renderFaq();
      renderGallery();
      renderSitemap();
      $('#aboutContact').html(contactHtml(true));
      $('#contactDetails').html(contactHtml(true));
      buildClockFace();
      tickClock();
      setInterval(tickClock, 250);
      initVisitors();
      initTicker();
      bindEvents();
      bindAccount();
      bindCart();
      loadCart();
      restoreSession();
      renderCart();
      setCategory('all');
      renderPriceList();
      onRoute();
    }).fail(function () {
      $('#app').html('<div class="container py-5"><h1>The site could not load its data</h1><p>Check that data/watches.json is present and open the site from a web server.</p></div>').show();
      $('.page').show();
    });
  });
})(jQuery);
