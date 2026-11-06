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
});
