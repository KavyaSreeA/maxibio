// Maxwin Multitec Solutions — site behaviour
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  // ---------- Mobile navigation ----------
  var header = $('.site-header');
  var toggle = $('.nav-toggle');
  var nav = $('#site-nav');

  function setNav(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.site-header')) setNav(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setNav(false); toggle.focus(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setNav(false);
    });
  }

  // ---------- Header shadow + back-to-top ----------
  var backToTop = $('#backToTop');
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle('scrolled', y > 8);
    if (backToTop) backToTop.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---------- Scroll reveal ----------
  var reveals = $$('.reveal');
  if (reveals.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('in'); });
    }
  }

  // ---------- Footer year ----------
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ---------- Product filters (products.html) ----------
  var filterBar = $('.filters');
  if (filterBar) {
    var buttons = $$('.filter-btn', filterBar);
    var cards = $$('.product');

    var applyFilter = function (value) {
      cards.forEach(function (card) {
        var cats = (card.getAttribute('data-category') || '').split(/\s+/);
        card.hidden = !(value === 'all' || cats.indexOf(value) !== -1);
      });
      buttons.forEach(function (btn) {
        var on = btn.getAttribute('data-filter') === value;
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-pressed', String(on));
      });
    };

    filterBar.hidden = false; // filters need JS, so only reveal them when it runs
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var value = btn.getAttribute('data-filter');
        applyFilter(value);
        if (history.replaceState) {
          history.replaceState(null, '', value === 'all' ? location.pathname : '#' + value);
        }
      });
    });

    var initial = location.hash.replace('#', '');
    var known = buttons.some(function (b) { return b.getAttribute('data-filter') === initial; });
    applyFilter(known ? initial : 'all');
  }

  // ---------- Contact form (contact.html) ----------
  var form = $('#contactForm');
  if (form) {
    var submitBtn = $('#submit-button');
    var msg = $('#form-message');
    var idleLabel = submitBtn.innerHTML;

    // Pre-fill the subject when arriving from a product's "Enquire" button
    var product = new URLSearchParams(location.search).get('product');
    if (product && form.subject && !form.subject.value) {
      form.subject.value = 'Enquiry: ' + product;
    }

    var show = function (type, text) {
      msg.className = 'form-message ' + type;
      msg.textContent = text;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      show('', '');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

      var payload = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        subject: form.subject.value.trim(),
        message: form.message.value.trim()
      };

      fetch(form.getAttribute('data-endpoint'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (!data.success) throw new Error(data.message || 'Request failed');
          show('success', data.message || 'Thank you! Your message has been sent. We will get back to you shortly.');
          form.reset();
        })
        .catch(function () {
          show('error', 'We could not send your message right now. Please call +91 93621 18686 or email maxwinmts@gmail.com.');
        })
        .then(function () {
          submitBtn.disabled = false;
          submitBtn.innerHTML = idleLabel;
        });
    });
  }
})();
