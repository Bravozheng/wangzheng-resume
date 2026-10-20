(() => {
  const desktopQuery = window.matchMedia('(min-width: 721px) and (min-aspect-ratio: 4/5)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const fitFrames = () => {
    if (!desktopQuery.matches) {
      document.documentElement.style.setProperty('--frame-scale', '1');
      document.documentElement.style.setProperty('--screen-height', 'auto');
      return;
    }
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    document.documentElement.style.setProperty('--frame-scale', String(scale));
    document.documentElement.style.setProperty('--screen-height', `${1080 * scale}px`);
  };

  fitFrames();
  window.addEventListener('resize', fitFrames, { passive: true });

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

  const personaData = {
    director: {
      name: 'Zhang Ting',
      meta: '主任医师 · 48 岁',
      description: '每日评估助理提交的拟诊、随访与报告信息，审核开药建议并给出专业决策。',
      goal: '高效完成关键诊疗信息审核，<br>及时给出准确、专业的决策建议。',
      tasks: ['拟诊审核', '报告解读', '开药建议'],
      image: 'director.png',
      alt: '主任医师人物插画',
      blockers: [
        ['提交信息集中', '多名助理同时提交时，<br>审核支持容易滞后。'],
        ['开药审核耗时', '单据内容较多，审核过程长，<br>容易影响提交时效。'],
        ['信息核对分散', '还需同步查看患者消费信息，<br>增加判断与核对负担。'],
      ],
    },
    assistant: {
      name: 'Li Yi Jie',
      meta: '全科医师助理 · 26 岁',
      description: '每天完成大量在线问诊，使用电子健康记录、远程问诊与随访管理系统。',
      goal: '准确、安全地完成<br>问诊到随访的全流程服务。',
      tasks: ['健康数据查阅', '问诊随访操作', 'SOP 使用'],
      image: 'assistant.png',
      alt: '医师助理人物插画',
      blockers: [
        ['预诊信息不足', '模板式预诊提供的信息较少，<br>仍需大量在线问询确认。'],
        ['记录查阅复杂', '问诊过程中反复翻阅记录，<br>影响其他患者的回复速度。'],
        ['回复时效提醒过多', '提醒持续出现，<br>容易打断当前问诊。'],
      ],
    },
    trainer: {
      name: 'Ling Ling',
      meta: '项目经理 · 36 岁',
      description: '负责新功能发布、培训与考核，面向数百名医师助理组织在线答疑和协助。',
      goal: '让新功能被准确理解并顺利使用，<br>完成大规模培训、答疑与考核。',
      tasks: ['功能发布', '培训答疑', '考核执行'],
      image: 'trainer.png',
      alt: '医师培训员人物插画',
      blockers: [
        ['大版本难讲清', '仅靠在线口述和个人 PPT，<br>难以完整引导功能使用。'],
        ['集中答疑压力', '大量人员同时提问时，<br>技术问题难以及时解决。'],
        ['专业内容消化慢', '复杂内容需要先自行理解，<br>再转化为培训材料。'],
      ],
    },
  };

  const personaRoot = document.querySelector('[data-persona]');
  if (personaRoot) {
    const tabs = [...personaRoot.querySelectorAll('[data-persona-tab]')];
    const renderPersona = (key, focus = false) => {
      const data = personaData[key];
      if (!data) return;
      tabs.forEach((tab) => {
        const active = tab.dataset.personaTab === key;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && focus) tab.focus();
      });
      const image = personaRoot.querySelector('[data-persona-image]');
      image.src = `../../assets/images/bianque/personas/${data.image}`;
      image.alt = data.alt;
      personaRoot.querySelector('[data-persona-name]').textContent = data.name;
      personaRoot.querySelector('[data-persona-meta]').textContent = data.meta;
      personaRoot.querySelector('[data-persona-description]').textContent = data.description;
      personaRoot.querySelector('[data-persona-goal]').innerHTML = data.goal;
      personaRoot.querySelector('[data-persona-tasks]').innerHTML = data.tasks.map((task) => `<li>${task}</li>`).join('');
      personaRoot.querySelector('[data-persona-blockers]').innerHTML = data.blockers.map(([title, copy]) => `<article><h4>${title}</h4><p>${copy}</p></article>`).join('');
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => renderPersona(tab.dataset.personaTab));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const next = tabs[(index + direction + tabs.length) % tabs.length];
        renderPersona(next.dataset.personaTab, true);
      });
    });

    renderPersona('director');
  }

  const healthSection = document.querySelector('#health');
  if (healthSection) {
    healthSection.classList.add('is-reveal-ready');
    const revealHealth = () => healthSection.classList.add('is-revealed');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealHealth();
    } else {
      const healthObserver = new IntersectionObserver((entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        revealHealth();
        observer.disconnect();
      }, { threshold: .35 });
      healthObserver.observe(healthSection);
    }
  }

  const evaluationSection = document.querySelector('#evaluation');
  const metricValues = evaluationSection ? [...evaluationSection.querySelectorAll('[data-metric-value]')] : [];
  const setMetricValues = (progress = 1) => {
    metricValues.forEach((metric) => {
      const value = Number(metric.dataset.metricValue);
      const decimals = Number(metric.dataset.metricDecimals || 0);
      metric.querySelector('span').textContent = (value * progress).toFixed(decimals);
    });
  };
  const animateMetrics = () => {
    if (!evaluationSection || !metricValues.length) return;
    evaluationSection.classList.add('is-metric-active');
    if (reduceMotion) {
      setMetricValues();
      return;
    }
    const startedAt = performance.now();
    const duration = 960;
    const update = (now) => {
      const elapsed = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setMetricValues(eased);
      if (elapsed < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  };

  if (evaluationSection && metricValues.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      animateMetrics();
    } else {
      setMetricValues(0);
      const metricObserver = new IntersectionObserver((entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        animateMetrics();
        observer.disconnect();
      }, { threshold: .35 });
      metricObserver.observe(evaluationSection);
    }
  }

})();
