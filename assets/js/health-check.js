(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  document.querySelectorAll('[data-state-switcher]').forEach((switcher) => {
    const image = switcher.querySelector('[data-state-image]');
    const controls = [...switcher.querySelectorAll('[data-state-control]')];
    const autoplayDelay = Number(switcher.dataset.autoplay) || 0;
    const crossfade = switcher.hasAttribute('data-crossfade') && !reduceMotion;
    const transition = Number(switcher.dataset.transition) || 650;
    const layers = [image];
    let activeLayer = image;
    let switching = false;

    if (crossfade) {
      const alternate = image.cloneNode(false);
      alternate.removeAttribute('data-state-image');
      alternate.alt = '';
      alternate.setAttribute('aria-hidden', 'true');
      image.classList.add('hc-state-frame', 'is-active');
      alternate.classList.add('hc-state-frame');
      switcher.style.setProperty('--state-transition', `${transition}ms`);
      image.after(alternate);
      layers.push(alternate);
    }

    [...new Set(controls.map((control) => control.dataset.src))].forEach((src) => { const preload = new Image(); preload.src = src; });
    const activate = (control) => {
      const state = control.dataset.stateControl;
      if (!state || switcher.dataset.state === state || switching) return;

      const updateState = () => {
        switcher.dataset.state = state;
        controls.forEach((item) => {
          const active = item.dataset.stateControl === state;
          if (item.getAttribute('role') === 'tab') item.setAttribute('aria-selected', String(active));
          if (item.hasAttribute('aria-pressed')) item.setAttribute('aria-pressed', String(active));
        });
      };

      if (!crossfade) {
        updateState();
        image.src = control.dataset.src;
        image.alt = control.dataset.alt;
        return;
      }

      switching = true;
      const incoming = layers.find((layer) => layer !== activeLayer);
      incoming.src = control.dataset.src;
      const reveal = () => {
        updateState();
        incoming.alt = control.dataset.alt;
        incoming.removeAttribute('aria-hidden');
        activeLayer.alt = '';
        activeLayer.setAttribute('aria-hidden', 'true');
        activeLayer.classList.add('is-underlay');
        activeLayer.classList.remove('is-active');
        incoming.classList.add('is-active');
        const outgoing = activeLayer;
        activeLayer = incoming;
        window.setTimeout(() => {
          outgoing.classList.remove('is-underlay');
          switching = false;
        }, transition);
      };
      if (incoming.decode) incoming.decode().catch(() => {}).finally(() => window.requestAnimationFrame(reveal));
      else incoming.addEventListener('load', () => window.requestAnimationFrame(reveal), { once: true });
    };

    let autoTimer = 0;
    let inView = !('IntersectionObserver' in window);
    const stopAutoPlay = () => {
      window.clearInterval(autoTimer);
      autoTimer = 0;
    };
    const startAutoPlay = () => {
      if (!autoplayDelay || reduceMotion || !inView || autoTimer) return;
      autoTimer = window.setInterval(() => {
        const currentIndex = controls.findIndex((control) => control.dataset.stateControl === switcher.dataset.state);
        activate(controls[(currentIndex + 1) % controls.length]);
      }, autoplayDelay);
    };
    const resetAutoPlay = () => {
      stopAutoPlay();
      startAutoPlay();
    };
    controls.forEach((control) => control.addEventListener('click', () => {
      activate(control);
      resetAutoPlay();
    }));

    if (autoplayDelay && !reduceMotion && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (inView) startAutoPlay();
        else stopAutoPlay();
      }, { threshold: .35 });
      observer.observe(switcher);
    } else {
      startAutoPlay();
    }
  });

  const revealMasks = [...document.querySelectorAll('[data-reveal-mask]')];
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealMasks.forEach((mask) => mask.classList.add('is-revealed'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: .45, rootMargin: '0px 0px -8% 0px' });
    revealMasks.forEach((mask) => revealObserver.observe(mask));
  }

  const booking = document.querySelector('[data-booking-switcher]');
  if (booking) {
    const image = booking.querySelector('[data-booking-image]');
    const controls = [...booking.querySelectorAll('[data-booking-step]')];
    const close = booking.querySelector('[data-booking-close]');
    const overviewSrc = image.getAttribute('src');
    const overviewAlt = image.getAttribute('alt');
    let currentControl = null;
    let timer = 0;
    let busy = false;

    const restartAnimatedImage = (src) => {
      image.src = `${src}${src.includes('?') ? '&' : '?'}play=${Date.now()}`;
    };
    const finish = (state, src, alt) => {
      window.clearTimeout(timer);
      image.src = src;
      image.alt = alt;
      booking.dataset.state = state;
      busy = false;
      close.hidden = state === 'overview';
    };
    const openStep = (control) => {
      if (busy || booking.dataset.state !== 'overview') return;
      currentControl = control;
      if (reduceMotion) {
        finish(control.dataset.bookingStep, control.dataset.finalSrc, control.dataset.alt);
        return;
      }
      busy = true;
      booking.dataset.state = 'opening';
      image.alt = `${control.dataset.alt}，展开中`;
      restartAnimatedImage(control.dataset.motionSrc);
      timer = window.setTimeout(() => finish(control.dataset.bookingStep, control.dataset.finalSrc, control.dataset.alt), Number(control.dataset.duration));
    };
    const closeStep = () => {
      if (busy || !currentControl || booking.dataset.state === 'overview') return;
      if (reduceMotion) {
        finish('overview', overviewSrc, overviewAlt);
        currentControl = null;
        return;
      }
      busy = true;
      booking.dataset.state = 'closing';
      close.hidden = true;
      image.alt = '返回三步预约总览';
      restartAnimatedImage(currentControl.dataset.reverseSrc);
      timer = window.setTimeout(() => {
        finish('overview', overviewSrc, overviewAlt);
        currentControl = null;
      }, Number(currentControl.dataset.reverseDuration));
    };

    controls.forEach((control) => {
      [control.dataset.hoverSrc, control.dataset.motionSrc, control.dataset.reverseSrc, control.dataset.finalSrc].forEach((src) => {
        const preload = new Image();
        preload.src = src;
      });
      control.addEventListener('pointerenter', () => {
        if (!busy && booking.dataset.state === 'overview') {
          image.src = control.dataset.hoverSrc;
          image.alt = `${control.dataset.alt}，可点击展开`;
        }
      });
      control.addEventListener('pointerleave', () => {
        if (!busy && booking.dataset.state === 'overview') {
          image.src = overviewSrc;
          image.alt = overviewAlt;
        }
      });
      control.addEventListener('focus', () => {
        if (!busy && booking.dataset.state === 'overview') image.src = control.dataset.hoverSrc;
      });
      control.addEventListener('blur', () => {
        if (!busy && booking.dataset.state === 'overview') image.src = overviewSrc;
      });
      control.addEventListener('click', () => openStep(control));
    });
    close.addEventListener('click', closeStep);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && booking.dataset.state !== 'overview') closeStep();
    });
  }
})();
