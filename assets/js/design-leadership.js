(() => {
  document.documentElement.classList.add('has-js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hero = document.querySelector('.dl-hero');
  const heroImage = hero?.querySelector('.dl-canvas > img');
  const revealHero = () => window.requestAnimationFrame(() => window.requestAnimationFrame(() => hero?.classList.add('is-ready')));
  if (heroImage?.complete) revealHero();
  else heroImage?.addEventListener('load', revealHero, { once: true });

  const worksNav = document.querySelector('[data-works-nav]');
  const worksButton = document.querySelector('[data-works-button]');
  const closeWorksMenu = () => {
    worksNav?.classList.remove('is-open');
    worksButton?.setAttribute('aria-expanded', 'false');
  };
  worksButton?.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = worksNav.classList.toggle('is-open');
    worksButton.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (event) => {
    if (!worksNav?.contains(event.target)) closeWorksMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeWorksMenu();
  });

  document.querySelectorAll('[data-slider]').forEach((slider) => {
    const layers = [...slider.querySelectorAll('[data-frame-layer]')];
    const tabs = [...slider.querySelectorAll('[data-slide-index]')];
    const controlGroups = [...slider.querySelectorAll('[data-slider-controls]')];
    const previous = slider.querySelector('[data-slide-prev]');
    const next = slider.querySelector('[data-slide-next]');
    const autoplayToggle = slider.querySelector('[data-autoplay-toggle]');
    const delay = Number(slider.dataset.autoplay) || 6000;
    const transition = reduceMotion ? 0 : Number(slider.dataset.transition) || 450;
    let index = Number(slider.dataset.state) || 0;
    let visibleLayer = 0;
    let requestId = 0;
    let timer = 0;
    let inView = false;
    let manualPause = false;
    let controlPause = false;

    slider.style.setProperty('--frame-transition', `${transition}ms`);
    tabs.forEach((tab) => {
      const preload = new Image();
      preload.src = tab.dataset.src;
    });

    const canPlay = () => inView && !reduceMotion && !manualPause && !controlPause && !document.hidden;
    const clearTimer = () => window.clearTimeout(timer);
    const schedule = () => {
      clearTimer();
      if (!canPlay()) return;
      timer = window.setTimeout(() => activate((index + 1) % tabs.length), delay);
    };
    const updateControls = () => {
      slider.dataset.state = String(index);
      tabs.forEach((tab, tabIndex) => tab.setAttribute('aria-selected', String(tabIndex === index)));
    };
    const activate = async (nextIndex, userInitiated = false) => {
      const normalized = (nextIndex + tabs.length) % tabs.length;
      if (normalized === index) {
        if (userInitiated) schedule();
        return;
      }
      const id = ++requestId;
      const tab = tabs[normalized];
      const incomingIndex = 1 - visibleLayer;
      const incoming = layers[incomingIndex];
      const outgoing = layers[visibleLayer];
      incoming.src = tab.dataset.src;
      incoming.alt = tab.dataset.alt;
      try { if (incoming.decode) await incoming.decode(); } catch (_) {}
      if (id !== requestId) return;
      incoming.removeAttribute('aria-hidden');
      incoming.classList.add('is-visible');
      outgoing.classList.remove('is-visible');
      outgoing.setAttribute('aria-hidden', 'true');
      visibleLayer = incomingIndex;
      index = normalized;
      updateControls();
      schedule();
    };

    tabs.forEach((tab, tabIndex) => {
      tab.addEventListener('click', () => activate(tabIndex, true));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const target = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : tabIndex + (event.key === 'ArrowRight' ? 1 : -1);
        const normalized = (target + tabs.length) % tabs.length;
        tabs[normalized].focus();
        activate(normalized, true);
      });
    });
    previous?.addEventListener('click', () => activate(index - 1, true));
    next?.addEventListener('click', () => activate(index + 1, true));
    controlGroups.forEach((group) => {
      group.addEventListener('pointerenter', () => { controlPause = true; clearTimer(); });
      group.addEventListener('pointerleave', () => { controlPause = false; schedule(); });
      group.addEventListener('focusin', () => { controlPause = true; clearTimer(); });
      group.addEventListener('focusout', () => { controlPause = false; schedule(); });
    });
    autoplayToggle?.addEventListener('click', () => {
      manualPause = !manualPause;
      autoplayToggle.setAttribute('aria-pressed', String(manualPause));
      autoplayToggle.setAttribute('aria-label', manualPause ? '继续自动轮播' : '暂停自动轮播');
      autoplayToggle.querySelector('span').textContent = manualPause ? '继续自动轮播' : '暂停自动轮播';
      schedule();
    });
    document.addEventListener('visibilitychange', schedule);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        schedule();
      }, { threshold: .35 });
      observer.observe(slider);
    } else {
      inView = true;
      schedule();
    }
    updateControls();
  });

  const metrics = document.querySelector('[data-ai-metrics]');
  const metricValues = [...(metrics?.querySelectorAll('[data-metric-value]') || [])];
  const setMetricText = (element, value) => {
    element.textContent = `${value}${element.dataset.metricSuffix || ''}`;
  };
  const runMetrics = () => {
    if (!metrics || metrics.classList.contains('is-counting') || metrics.classList.contains('is-complete')) return;
    metrics.classList.add('is-counting');
    const duration = 1300;
    const start = performance.now();
    const update = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      metricValues.forEach((element) => setMetricText(element, Math.round(Number(element.dataset.metricValue) * eased)));
      if (progress < 1) window.requestAnimationFrame(update);
      else {
        metrics.classList.remove('is-counting');
        metrics.classList.add('is-complete');
      }
    };
    window.requestAnimationFrame(update);
  };
  if (metrics) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      metricValues.forEach((element) => setMetricText(element, element.dataset.metricValue));
      metrics.classList.add('is-complete');
    } else {
      metricValues.forEach((element) => setMetricText(element, 0));
      const metricObserver = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        metricObserver.disconnect();
        runMetrics();
      }, { threshold: .48 });
      metricObserver.observe(metrics.closest('.dl-screen') || metrics);
    }
  }

  const modal = document.querySelector('[data-video-modal]');
  const player = modal?.querySelector('[data-video-player]');
  const heading = modal?.querySelector('[data-video-heading]');
  const closeButton = modal?.querySelector('[data-video-close]');
  let opener = null;
  const closeVideo = () => {
    if (!modal || modal.hidden) return;
    player.pause();
    player.removeAttribute('src');
    player.load();
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    opener?.focus();
  };
  document.querySelectorAll('[data-video-src]').forEach((button) => {
    button.addEventListener('click', () => {
      opener = button;
      heading.textContent = button.dataset.videoTitle;
      player.src = button.dataset.videoSrc;
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
      player.load();
      player.play().catch(() => {});
      closeButton.focus();
    });
  });
  closeButton?.addEventListener('click', closeVideo);
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) closeVideo();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal?.hidden) closeVideo();
  });
})();
