(() => {
  const CONFIG = {
    telegramBotUrl: 'https://t.me/KonturSmmAiBot',
    metrikaCounterId: ''
  };

  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('[data-nav]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const botLinks = document.querySelectorAll('[data-bot-link]');
  const yearNode = document.querySelector('[data-year]');
  const faqList = document.querySelector('[data-faq-list]');
  const themeButton = document.querySelector('[data-theme-toggle]');

  const safeUrl = (value) => {
    try {
      return new URL(value, window.location.origin);
    } catch (error) {
      return null;
    }
  };

  const getStartParam = (href) => {
    const url = safeUrl(href);
    if (!url) return 'landing';
    return url.searchParams.get('start') || 'landing';
  };

  const buildBotUrl = (startParam) => {
    const botUrl = safeUrl(CONFIG.telegramBotUrl);
    if (!botUrl) return '#';
    botUrl.searchParams.set('start', startParam);
    return botUrl.toString();
  };

  const setBotLinks = () => {
    botLinks.forEach((link) => {
      const startParam = getStartParam(link.getAttribute('href'));
      link.setAttribute('href', buildBotUrl(startParam));
    });
  };

  const setCurrentYear = () => {
    if (yearNode) {
      yearNode.textContent = new Date().getFullYear();
    }
  };

  const setTheme = (theme, persist = false) => {
    const nextTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = nextTheme;

    if (themeButton) {
      const isDark = nextTheme === 'dark';
      themeButton.setAttribute('aria-label', isDark ? 'Включить светлую тему' : 'Включить тёмную тему');
      themeButton.setAttribute('title', isDark ? 'Светлая тема' : 'Тёмная тема');
    }

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', nextTheme === 'dark' ? '#070d19' : '#1477ff');

    if (persist) {
      try {
        window.localStorage.setItem('kontursmm_theme', nextTheme);
      } catch (error) {
        return;
      }
    }
  };

  const bindTheme = () => {
    const currentTheme = document.documentElement.dataset.theme || 'light';
    setTheme(currentTheme);
    if (!themeButton) return;

    themeButton.addEventListener('click', () => {
      const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme, true);
    });
  };

  const toggleMenu = (forceState) => {
    if (!nav || !menuButton) return;

    const willOpen = typeof forceState === 'boolean'
      ? forceState
      : !nav.classList.contains('is-open');

    nav.classList.toggle('is-open', willOpen);
    menuButton.classList.toggle('is-open', willOpen);
    menuButton.setAttribute('aria-expanded', String(willOpen));
    menuButton.setAttribute('aria-label', willOpen ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('is-locked', willOpen);
  };

  const bindMenu = () => {
    if (!menuButton || !nav) return;

    menuButton.addEventListener('click', () => toggleMenu());

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') toggleMenu(false);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) toggleMenu(false);
    });
  };

  const bindHeaderState = () => {
    if (!header) return;

    const updateHeader = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  };

  const bindFaq = () => {
    if (!faqList) return;

    faqList.addEventListener('click', (event) => {
      const button = event.target.closest('.faq-question');
      if (!button) return;

      const item = button.closest('.faq-item');
      const isOpen = item.classList.contains('is-open');

      faqList.querySelectorAll('.faq-item').forEach((faqItem) => {
        faqItem.classList.remove('is-open');
        const faqButton = faqItem.querySelector('.faq-question');
        if (faqButton) faqButton.setAttribute('aria-expanded', 'false');
      });

      item.classList.toggle('is-open', !isOpen);
      button.setAttribute('aria-expanded', String(!isOpen));
    });
  };

  const bindReveal = () => {
    const revealItems = document.querySelectorAll('.reveal');
    if (!revealItems.length) return;

    if (!('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -70px 0px' });

    revealItems.forEach((item) => observer.observe(item));
  };

  const bindSmoothAnchors = () => {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  const captureAdParams = () => {
    const params = new URLSearchParams(window.location.search);
    const importantKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid'];
    const captured = {};

    importantKeys.forEach((key) => {
      const value = params.get(key);
      if (value) captured[key] = value;
    });

    if (Object.keys(captured).length) {
      try {
        window.sessionStorage.setItem('kontursmm_ad_params', JSON.stringify(captured));
      } catch (error) {
        return;
      }
    }
  };

  const bindBotGoal = () => {
    botLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (!CONFIG.metrikaCounterId || typeof window.ym !== 'function') return;
        window.ym(CONFIG.metrikaCounterId, 'reachGoal', 'telegram_click');
      });
    });
  };

  setBotLinks();
  setCurrentYear();
  bindTheme();
  bindMenu();
  bindHeaderState();
  bindFaq();
  bindReveal();
  bindSmoothAnchors();
  captureAdParams();
  bindBotGoal();
})();
