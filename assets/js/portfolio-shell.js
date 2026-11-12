(() => {
  const works = document.querySelector('[data-portfolio-works]');
  const button = document.querySelector('[data-portfolio-works-button]');
  if (!works || !button) return;

  const close = () => {
    works.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
  };

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = works.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(open));
  });
  works.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
  document.addEventListener('click', (event) => {
    if (!works.contains(event.target)) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });

  const mobileCanvas = window.matchMedia('(max-width: 720px), (max-aspect-ratio: 4/5)');
  if (mobileCanvas.matches) {
    document.querySelectorAll('.hc-screen, .dl-screen').forEach((screen) => {
      if (screen.scrollWidth <= screen.clientWidth + 1) return;
      const hint = document.createElement('span');
      hint.className = 'mobile-pan-hint';
      hint.setAttribute('aria-hidden', 'true');
      hint.textContent = '左右滑动查看完整画面';
      screen.append(hint);
      const dismissHint = () => {
        if (screen.scrollLeft <= 12) return;
        screen.classList.add('has-panned');
        screen.removeEventListener('scroll', dismissHint);
      };
      screen.addEventListener('scroll', dismissHint, { passive: true });
    });
  }
})();
