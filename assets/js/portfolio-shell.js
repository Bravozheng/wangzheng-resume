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
})();
