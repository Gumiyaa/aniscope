// AniScope — shared interactions
document.addEventListener('DOMContentLoaded', function () {
  // ---- active nav ------------------------------------------------------
  var path = window.location.pathname.replace(/\/+$/, '') || '/';
  var map = {
    '/': 'features',
    '/features': 'features',
    '/reviews': 'reviews',
    '/explore': 'explore',
    '/essays': 'essays',
    '/community': 'community',
  };
  var current = map[path];
  document.querySelectorAll('.primary-nav a[data-nav]').forEach(function (link) {
    if (link.getAttribute('data-nav') === current) link.classList.add('is-active');
  });

  // ---- grouped toggle buttons -----------------------------------------
  var groups = [
    '.shelf-tabs',
    '.essay-chips',
    '.essay-sort',
    '.filter-tabs',
    '.taxonomy',
    '.tax-row',
    '.reaction-pills',
  ];

  groups.forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (group) {
      var buttons = group.querySelectorAll('button');
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          buttons.forEach(function (b) { b.classList.remove('is-active'); });
          button.classList.add('is-active');
        });
      });
    });
  });

  // ---- newsletter / subscribe -----------------------------------------
  document.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var note = form.querySelector('[data-form-note]');
      if (note) {
        note.textContent = 'Received — the dispatch will reach you shortly.';
        note.classList.add('is-visible');
      }
    });
  });

  var subscribeBtn = document.querySelector('.btn-subscribe');
  if (subscribeBtn) {
    subscribeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var input = document.querySelector('.form-group input[type="email"]');
      if (input && input.value) {
        alert('Thank you for subscribing to the AniScope Dispatch!');
        input.value = '';
      } else {
        alert('Please enter your email address.');
      }
    });
  }

  // ---- fade in lazy images --------------------------------------------
  document.querySelectorAll('img').forEach(function (img) {
    if (img.complete) return;
    img.style.opacity = '0.8';
    img.style.transition = 'opacity 0.5s';
    img.addEventListener('load', function () { img.style.opacity = '1'; });
  });

  // ---- saved articles (localStorage) ----------------------------------
  var SAVE_KEY = 'aniscope:saved';
  var savedBtn = document.querySelector('[data-action="saved"]');
  var savedDialog = document.getElementById('saved-dialog');
  var savedList = document.getElementById('saved-list');

  function readSaved() {
    try {
      var raw = JSON.parse(localStorage.getItem(SAVE_KEY));
      return Array.isArray(raw) ? raw : [];
    } catch (err) {
      return [];
    }
  }

  function writeSaved(list) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(list)); } catch (err) { /* private mode */ }
  }

  function saveKey(url, title) {
    return url + '::' + title;
  }

  function pageName() {
    var label = map[path] || 'features';
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  function isSaved(url, title) {
    var key = saveKey(url, title);
    return readSaved().some(function (item) { return item.key === key; });
  }

  function updateSavedBadge() {
    if (!savedBtn) return;
    var count = readSaved().length;
    var badge = savedBtn.querySelector('.tool__count');
    if (badge) {
      badge.textContent = count;
      badge.hidden = count === 0;
    }
    savedBtn.setAttribute('aria-label', count ? 'Saved articles (' + count + ')' : 'Saved articles');
  }

  function renderSaved() {
    if (!savedList) return;
    var list = readSaved();
    savedList.textContent = '';
    if (!list.length) {
      var hint = document.createElement('p');
      hint.className = 'panel__hint';
      hint.textContent = 'Nothing saved yet — tap the bookmark icon on a review or catalogue entry.';
      savedList.appendChild(hint);
      return;
    }
    list.forEach(function (item) {
      var row = document.createElement('div');
      row.className = 'saved-item';

      var link = document.createElement('a');
      link.href = item.url;
      link.textContent = item.title;
      var meta = document.createElement('span');
      meta.className = 'saved-item__meta';
      meta.textContent = item.page;
      link.appendChild(meta);

      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'saved-item__remove';
      remove.setAttribute('aria-label', 'Remove ' + item.title);
      remove.textContent = '×';
      remove.addEventListener('click', function () {
        writeSaved(readSaved().filter(function (entry) { return entry.key !== item.key; }));
        syncBookmarkButtons();
        renderSaved();
        updateSavedBadge();
      });

      row.appendChild(link);
      row.appendChild(remove);
      savedList.appendChild(row);
    });
  }

  function bookmarkTitle(button) {
    var card = button.closest('.catalogue-card');
    var heading = card && card.querySelector('h3');
    if (heading) return heading.textContent.trim();
    return document.title.replace(/\s+[—-]\s+AniScope$/, '');
  }

  function syncBookmarkButtons() {
    document.querySelectorAll('button[aria-label*="Bookmark"], button[data-bookmark]').forEach(function (button) {
      var saved = isSaved(window.location.pathname, bookmarkTitle(button));
      button.classList.toggle('is-saved', saved);
      button.setAttribute('aria-pressed', String(saved));
      button.title = saved ? 'Remove from saved' : 'Save this piece';
    });
  }

  document.querySelectorAll('button[aria-label*="Bookmark"], button[data-bookmark]').forEach(function (button) {
    button.addEventListener('click', function () {
      var list = readSaved();
      var title = bookmarkTitle(button);
      var key = saveKey(window.location.pathname, title);
      var exists = list.some(function (item) { return item.key === key; });
      if (exists) {
        list = list.filter(function (item) { return item.key !== key; });
      } else {
        list.unshift({ key: key, title: title, url: window.location.pathname, page: pageName() });
      }
      writeSaved(list);
      syncBookmarkButtons();
      renderSaved();
      updateSavedBadge();
    });
  });

  // ---- dialogs (search + saved) ---------------------------------------
  function openDialog(dialog, trigger) {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
  }

  function closeDialog(dialog, trigger) {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  document.querySelectorAll('.panel').forEach(function (dialog) {
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) closeDialog(dialog);
    });
    dialog.querySelectorAll('[data-close]').forEach(function (button) {
      button.addEventListener('click', function () { closeDialog(dialog); });
    });
  });

  if (savedBtn) {
    savedBtn.addEventListener('click', function () {
      renderSaved();
      openDialog(savedDialog, savedBtn);
    });
    savedDialog && savedDialog.addEventListener('close', function () {
      savedBtn.setAttribute('aria-expanded', 'false');
    });
  }

  // ---- search ---------------------------------------------------------
  var searchBtn = document.querySelector('[data-action="search"]');
  var searchDialog = document.getElementById('search-dialog');
  var searchInput = document.getElementById('search-input');
  var searchResults = document.getElementById('search-results');
  var searchIndex = null;

  function scoreEntry(entry, terms) {
    var haystack = (entry.title + ' ' + entry.text).toLowerCase();
    var score = 0;
    for (var i = 0; i < terms.length; i++) {
      var term = terms[i];
      var at = haystack.indexOf(term);
      if (at === -1) return -1;
      var hits = haystack.split(term).length - 1;
      score += hits + (entry.title.toLowerCase().indexOf(term) !== -1 ? 12 : 0);
    }
    return score;
  }

  function excerpt(entry, term) {
    var text = entry.text;
    var at = text.toLowerCase().indexOf(term);
    if (at === -1) return text.slice(0, 150) + '…';
    var start = Math.max(0, at - 60);
    return (start > 0 ? '…' : '') + text.slice(start, at + 110).trim() + '…';
  }

  function runSearch() {
    if (!searchResults) return;
    var query = (searchInput.value || '').trim().toLowerCase();
    searchResults.textContent = '';
    if (query.length < 2) {
      var hint = document.createElement('p');
      hint.className = 'panel__hint';
      hint.textContent = 'Search titles, essays, and catalogue entries.';
      searchResults.appendChild(hint);
      return;
    }
    if (!searchIndex) {
      var loading = document.createElement('p');
      loading.className = 'panel__hint';
      loading.textContent = 'Searching…';
      searchResults.appendChild(loading);
      return;
    }
    var terms = query.split(/\s+/).filter(Boolean);
    var matches = searchIndex
      .map(function (entry) { return { entry: entry, score: scoreEntry(entry, terms) }; })
      .filter(function (match) { return match.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 8);

    if (!matches.length) {
      var empty = document.createElement('p');
      empty.className = 'panel__hint';
      empty.textContent = 'No matches for “' + searchInput.value.trim() + '”.';
      searchResults.appendChild(empty);
      return;
    }

    matches.forEach(function (match) {
      var link = document.createElement('a');
      link.className = 'panel-result';
      link.href = match.entry.url;

      var title = document.createElement('span');
      title.className = 'panel-result__title';
      title.textContent = match.entry.title;

      var page = document.createElement('span');
      page.className = 'panel-result__page';
      page.textContent = match.entry.page;
      title.appendChild(page);

      var body = document.createElement('p');
      body.className = 'panel-result__excerpt';
      body.textContent = excerpt(match.entry, terms[0]);

      link.appendChild(title);
      link.appendChild(body);
      searchResults.appendChild(link);
    });
  }

  function loadIndex() {
    if (searchIndex || !searchResults) return;
    fetch('/search-index.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        searchIndex = Array.isArray(data) ? data : [];
        runSearch();
      })
      .catch(function () {
        searchIndex = [];
        runSearch();
      });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', function () {
      loadIndex();
      openDialog(searchDialog, searchBtn);
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    });
    searchDialog && searchDialog.addEventListener('close', function () {
      searchBtn.setAttribute('aria-expanded', 'false');
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', runSearch);
  }

  document.addEventListener('keydown', function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (searchBtn) searchBtn.click();
    }
  });

  // ---- edition menu ---------------------------------------------------
  var editionMenu = document.querySelector('.head-menu');
  if (editionMenu) {
    document.addEventListener('click', function (event) {
      if (!editionMenu.contains(event.target)) editionMenu.removeAttribute('open');
    });
  }

  // ---- init -----------------------------------------------------------
  syncBookmarkButtons();
  updateSavedBadge();
  renderSaved();
});
