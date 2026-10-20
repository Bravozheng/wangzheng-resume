(() => {
  const body = document.body;
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-button]');
  const menu = document.querySelector('[data-menu]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const syncHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (menuButton && menu) {
    const closeMenu = () => {
      body.classList.remove('menu-open');
      menuButton.setAttribute('aria-expanded', 'false');
    };
    menuButton.addEventListener('click', () => {
      const open = !body.classList.contains('menu-open');
      body.classList.toggle('menu-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const reveals = [...document.querySelectorAll('.reveal:not(.is-visible)')];
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((item) => revealObserver.observe(item));
  }

  document.querySelectorAll('[data-slider]').forEach((slider) => {
    const tabs = [...slider.querySelectorAll('[data-slide-to]')];
    const image = slider.querySelector('[data-slide-image]');
    const count = slider.querySelector('[data-slide-count]');
    const previous = slider.querySelector('[data-slide-prev]');
    const next = slider.querySelector('[data-slide-next]');
    const autoButton = slider.querySelector('[data-slide-autoplay]');
    const duration = Number(slider.dataset.autoplay || 0);
    let index = Math.max(0, tabs.findIndex((tab) => tab.classList.contains('is-active')));
    let timer = null;
    let visible = false;
    let pausedByUser = false;
    let pointerX = null;

    tabs.forEach((tab) => {
      const preload = new Image();
      preload.src = tab.dataset.src;
    });

    const updateAutoplayLabel = () => {
      if (!autoButton) return;
      autoButton.textContent = pausedByUser ? '继续自动播放' : '暂停自动播放';
      autoButton.setAttribute('aria-pressed', String(pausedByUser));
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    const start = () => {
      stop();
      if (!duration || reduceMotion || pausedByUser || !visible || document.hidden) return;
      timer = window.setInterval(() => activate((index + 1) % tabs.length, false), duration);
    };

    const render = (newIndex) => {
      const tab = tabs[newIndex];
      tabs.forEach((item, itemIndex) => {
        const active = itemIndex === newIndex;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      if (count) count.textContent = `${newIndex + 1} / ${tabs.length}`;
      if (!image || image.src.endsWith(tab.dataset.src)) return;
      image.classList.add('is-changing');
      window.setTimeout(() => {
        image.src = tab.dataset.src;
        image.alt = tab.dataset.alt || tab.textContent.trim();
        image.addEventListener('load', () => image.classList.remove('is-changing'), { once: true });
      }, reduceMotion ? 0 : 150);
    };

    function activate(newIndex, userInitiated = true) {
      index = (newIndex + tabs.length) % tabs.length;
      if (userInitiated && duration) pausedByUser = true;
      render(index);
      updateAutoplayLabel();
      start();
    }

    tabs.forEach((tab, tabIndex) => {
      tab.addEventListener('click', () => activate(tabIndex));
      tab.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault();
          activate(tabIndex + 1);
          tabs[(tabIndex + 1) % tabs.length].focus();
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault();
          activate(tabIndex - 1);
          tabs[(tabIndex - 1 + tabs.length) % tabs.length].focus();
        }
      });
    });
    previous?.addEventListener('click', () => activate(index - 1));
    next?.addEventListener('click', () => activate(index + 1));
    autoButton?.addEventListener('click', () => {
      pausedByUser = !pausedByUser;
      updateAutoplayLabel();
      start();
    });

    slider.addEventListener('pointerdown', (event) => { pointerX = event.clientX; });
    slider.addEventListener('pointerup', (event) => {
      if (pointerX === null) return;
      const distance = event.clientX - pointerX;
      pointerX = null;
      if (Math.abs(distance) < 56) return;
      activate(index + (distance < 0 ? 1 : -1));
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', start);

    if ('IntersectionObserver' in window) {
      const sliderObserver = new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        visible ? start() : stop();
      }, { threshold: .35 });
      sliderObserver.observe(slider);
    } else {
      visible = true;
    }
    render(index);
    updateAutoplayLabel();
    start();
  });
})();
