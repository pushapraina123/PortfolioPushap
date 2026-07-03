(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     NAV: scrolled state, mobile toggle, active-link tracking,
     smooth-scroll with fixed-header offset
  --------------------------------------------------------- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');
  const navLinkEls = document.querySelectorAll('[data-nav]');

  function onScrollNav() {
    nav.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  navToggle.addEventListener('click', () => {
    const isOpen = navMobile.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinkEls.forEach((link) => {
    link.addEventListener('click', () => {
      navMobile.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Active section highlighting
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navByHash = new Map();
  navLinkEls.forEach((a) => {
    const hash = a.getAttribute('href');
    if (!navByHash.has(hash)) navByHash.set(hash, []);
    navByHash.get(hash).push(a);
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const hash = '#' + entry.target.id;
        const links = navByHash.get(hash);
        if (!links) return;
        if (entry.isIntersecting) {
          navLinkEls.forEach((l) => l.classList.remove('is-active'));
          links.forEach((l) => l.classList.add('is-active'));
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );
  sections.forEach((s) => sectionObserver.observe(s));

  /* ---------------------------------------------------------
     SCROLL PROGRESS BAR
  --------------------------------------------------------- */
  const scrollBar = document.getElementById('scrollBar');
  function onScrollProgress() {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (scrolled / max) * 100 : 0;
    scrollBar.style.width = pct + '%';
  }
  onScrollProgress();
  window.addEventListener('scroll', onScrollProgress, { passive: true });

  /* ---------------------------------------------------------
     CURSOR GLOW (desktop only, decorative)
  --------------------------------------------------------- */
  const glow = document.querySelector('.cursor-glow');
  if (glow && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('mousemove', (e) => {
      glow.style.setProperty('--x', e.clientX + 'px');
      glow.style.setProperty('--y', e.clientY + 'px');
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     SPOTLIGHT CARDS — mouse-follow glow, delegated to one
     listener rather than one per card for performance
  --------------------------------------------------------- */
  const hoverCapable = window.matchMedia('(hover: hover)').matches;
  if (hoverCapable && !prefersReducedMotion) {
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest('.spotlight-card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     MAGNETIC BUTTONS — primary/ghost buttons pull gently
     toward the cursor within their bounds
  --------------------------------------------------------- */
  if (hoverCapable && !prefersReducedMotion) {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${relX * 0.18}px, ${relY * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------------------
     BUTTON RIPPLE — lightweight click feedback
  --------------------------------------------------------- */
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (prefersReducedMotion) return;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'btn__ripple';
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ---------------------------------------------------------
     BACK TO TOP
  --------------------------------------------------------- */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------------------------------------------------------
     SCROLL REVEAL
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal, .about__stats');
  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------------------------------------------------------
     HERO TYPEWRITER (role rotation)
  --------------------------------------------------------- */
  const typewriterEl = document.getElementById('typewriter');
  const roles = [
    'Full-Stack Developer',
    'React & Node.js Engineer',
    'Applied NLP Enthusiast',
    'Computer Science Student'
  ];

  function startTypewriter() {
    if (!typewriterEl) return;
    if (prefersReducedMotion) {
      typewriterEl.textContent = roles[0];
      return;
    }
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const current = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        typewriterEl.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          return setTimeout(tick, 1800);
        }
      } else {
        charIndex--;
        typewriterEl.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      const speed = deleting ? 35 : 65;
      setTimeout(tick, speed);
    }
    tick();
  }
  startTypewriter();

  /* ---------------------------------------------------------
     HERO CODE EDITOR — typed-in code block
  --------------------------------------------------------- */
  const editorCode = document.querySelector('#editorCode code');

  const codeLines = [
    { text: '// building products end to end', cls: 'tok-com' },
    { text: 'const developer = {', cls: null },
    { text: '  name: ', cls: null, tail: [['"Pushap Raina"', 'tok-str']] },
    { text: '  role: ', cls: null, tail: [['"Full-Stack Developer"', 'tok-str']] },
    { text: '  based: ', cls: null, tail: [['"Mumbai, India"', 'tok-str']] },
    { text: '  stack: [', cls: null, tail: [['"React"', 'tok-str'], [', ', null], ['"Node.js"', 'tok-str'], [', ', null], ['"MongoDB"', 'tok-str'], ['],', null]] },
    { text: '  passion: ', cls: null, tail: [['"NLP + clean UX"', 'tok-str']] },
    { text: '};', cls: null },
    { text: '', cls: null },
    { text: 'function', cls: 'tok-key', tail: [[' shipIt', 'tok-fn'], ['(idea) {', null]] },
    { text: '  return idea', cls: null, tail: [['.build()', 'tok-prop'], ['.ship();', 'tok-prop']] },
    { text: '}', cls: null },
  ];

  function renderLineHTML(line) {
    let html = '';
    if (line.cls) {
      html += `<span class="${line.cls}">${escapeHtml(line.text)}</span>`;
    } else {
      html += escapeHtml(line.text);
    }
    if (line.tail) {
      line.tail.forEach(([text, cls]) => {
        html += cls ? `<span class="${cls}">${escapeHtml(text)}</span>` : escapeHtml(text);
      });
    }
    return html;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  }

  function typeEditorCode() {
    if (!editorCode) return;
    if (prefersReducedMotion) {
      editorCode.innerHTML = codeLines.map(renderLineHTML).join('\n');
      return;
    }

    let lineIdx = 0;

    function typeNextLine() {
      if (lineIdx >= codeLines.length) return;
      const line = codeLines[lineIdx];
      const full = line.text;
      let charIdx = 0;

      // Render already-completed lines fully, current line char-by-char
      function renderPartial() {
        const completed = codeLines.slice(0, lineIdx).map(renderLineHTML);
        const partial = line.cls
          ? `<span class="${line.cls}">${escapeHtml(full.slice(0, charIdx))}</span>`
          : escapeHtml(full.slice(0, charIdx));
        editorCode.innerHTML = completed.concat(partial).join('\n');
      }

      function step() {
        charIdx++;
        renderPartial();
        if (charIdx < full.length) {
          setTimeout(step, 14);
        } else {
          // append tail (colored tokens) instantly once base text is typed
          const completed = codeLines.slice(0, lineIdx).map(renderLineHTML);
          editorCode.innerHTML = completed.concat(renderLineHTML(line)).join('\n');
          lineIdx++;
          setTimeout(typeNextLine, 90);
        }
      }

      if (full.length === 0) {
        lineIdx++;
        setTimeout(typeNextLine, 60);
      } else {
        step();
      }
    }

    typeNextLine();
  }

  // Trigger editor typing once it scrolls into view (or immediately on load for hero)
  typeEditorCode();

  /* ---------------------------------------------------------
     ANIMATED STAT COUNTERS
  --------------------------------------------------------- */
  const statNums = document.querySelectorAll('.stat-card__num');
  const countObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-count'));
        const isDecimal = el.getAttribute('data-decimal') === 'true';
        if (prefersReducedMotion) {
          el.textContent = isDecimal ? target.toFixed(1) : String(target);
          obs.unobserve(el);
          return;
        }
        const duration = 1400;
        const start = performance.now();
        function frame(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = target * eased;
          el.textContent = isDecimal ? value.toFixed(1) : Math.round(value);
          if (progress < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
        obs.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  statNums.forEach((el) => countObserver.observe(el));

  /* ---------------------------------------------------------
     CONTACT FORM — validation + mailto (no backend)
  --------------------------------------------------------- */
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  function setError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + 'Error');
    const wrapper = field.closest('.field');
    if (message) {
      wrapper.classList.add('has-error');
      errorEl.textContent = message;
    } else {
      wrapper.classList.remove('has-error');
      errorEl.textContent = '';
    }
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

 // ---- EmailJS config — fill in your own values from the dashboard ----
  const EMAILJS_PUBLIC_KEY = 'ElhlwQ4hpsqVwntVc';
  const EMAILJS_SERVICE_ID = 'service_vy2wpzq';
  const EMAILJS_TEMPLATE_ID = 'template_2qmin89';

  if (window.emailjs) {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const message = document.getElementById('message').value.trim();

      let valid = true;

      if (!name) { setError('name', 'Please enter your name.'); valid = false; }
      else setError('name', '');

      if (!email) { setError('email', 'Please enter your email.'); valid = false; }
      else if (!isValidEmail(email)) { setError('email', 'That email doesn\'t look right.'); valid = false; }
      else setError('email', '');

      if (!subject) { setError('subject', 'Please add a subject.'); valid = false; }
      else setError('subject', '');

      if (!message) { setError('message', 'Please write a message.'); valid = false; }
      else setError('message', '');

      if (!valid) {
        formStatus.textContent = '';
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      formStatus.style.color = '';
      formStatus.textContent = 'Sending...';

      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name: name,
        from_email: email,
        subject: `[Portfolio] ${subject}`,
        message: message
      }).then(() => {
        formStatus.textContent = 'Message sent — thanks! I\'ll get back to you soon.';
        form.reset();
        ['name', 'email', 'subject', 'message'].forEach((id) => setError(id, ''));
        submitBtn.disabled = false;
      }).catch((error) => {
        formStatus.style.color = '#e8636b';
        formStatus.textContent = 'Something went wrong — please email me directly at rainapushap96@gmail.com';
        submitBtn.disabled = false;
        console.log(error);
    console.log(error.text);
    console.log(error.status);
      });
    });

    // Clear individual field errors as the person types
    ['name', 'email', 'subject', 'message'].forEach((id) => {
      document.getElementById(id).addEventListener('input', () => setError(id, ''));
    });
  }

  /* ---------------------------------------------------------
     COPY EMAIL BUTTON
  --------------------------------------------------------- */
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = copyEmailBtn.getAttribute('data-copy');
      const label = copyEmailBtn.querySelector('.copy-btn__label');
      try {
        await navigator.clipboard.writeText(email);
      } catch (err) {
        // Fallback for browsers without Clipboard API access
        const tmp = document.createElement('textarea');
        tmp.value = email;
        tmp.style.position = 'fixed';
        tmp.style.opacity = '0';
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
      }
      copyEmailBtn.classList.add('is-copied');
      copyEmailBtn.setAttribute('aria-label', 'Email copied to clipboard');
      const original = label.textContent;
      label.textContent = 'Copied!';
      setTimeout(() => {
        copyEmailBtn.classList.remove('is-copied');
        copyEmailBtn.setAttribute('aria-label', 'Copy email address');
        label.textContent = original;
      }, 2000);
    });
  }

  /* ---------------------------------------------------------
     INTERACTIVE TERMINAL
  --------------------------------------------------------- */
  const termFab = document.getElementById('termFab');
  const termOverlay = document.getElementById('termOverlay');
  const termClose = document.getElementById('termClose');
  const termBody = document.getElementById('termBody');
  const termInput = document.getElementById('termInput');

  const history = [];
  let historyPos = -1;

  function openTerminal() {
    termOverlay.classList.add('is-open');
    termOverlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => termInput.focus(), 50);
    document.body.style.overflow = 'hidden';
  }
  function closeTerminal() {
    termOverlay.classList.remove('is-open');
    termOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    termFab.focus();
  }

  if (termFab) termFab.addEventListener('click', openTerminal);
  if (termClose) termClose.addEventListener('click', closeTerminal);
  if (termOverlay) {
    termOverlay.addEventListener('click', (e) => {
      if (e.target === termOverlay) closeTerminal();
    });
  }

  document.addEventListener('keydown', (e) => {
    const isOpen = termOverlay.classList.contains('is-open');
    if (!isOpen && e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      openTerminal();
    } else if (isOpen && e.key === 'Escape') {
      closeTerminal();
    }
  });

  function printLine(html, isCmd) {
    const line = document.createElement('div');
    line.className = 'term-line' + (isCmd ? ' term-line--cmd' : '');
    line.innerHTML = html;
    termBody.appendChild(line);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      closeTerminal();
      setTimeout(() => el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' }), 200);
    }
  }

  const commands = {
    help: () => {
      printLine([
        'Available commands:',
        '  <span class="tok-str">about</span>         — who I am',
        '  <span class="tok-str">experience</span>    — where I\'ve worked',
        '  <span class="tok-str">projects</span>       — things I\'ve built',
        '  <span class="tok-str">skills</span>         — tech I use',
        '  <span class="tok-str">education</span>      — where I studied',
        '  <span class="tok-str">contact</span>        — get in touch',
        '  <span class="tok-str">social</span>         — GitHub / LinkedIn / email',
        '  <span class="tok-str">resume</span>         — download my CV',
        '  <span class="tok-str">whoami</span>         — one-line intro',
        '  <span class="tok-str">clear</span>          — clear this terminal',
        '  <span class="tok-str">sudo make coffee</span> — try it'
      ].join('\n'));
    },
    about: () => scrollToSection('about'),
    experience: () => scrollToSection('experience'),
    projects: () => scrollToSection('projects'),
    skills: () => scrollToSection('skills'),
    education: () => scrollToSection('education'),
    contact: () => scrollToSection('contact'),
    social: () => {
      printLine('GitHub: <a href="https://github.com/pushapraina123" target="_blank" rel="noopener">github.com/pushapraina123</a>\nLinkedIn: <a href="https://linkedin.com/in/pushap-raina" target="_blank" rel="noopener">linkedin.com/in/pushap-raina</a>\nEmail: <a href="mailto:rainapushap96@gmail.com">rainapushap96@gmail.com</a>');
    },
    resume: () => {
      const resumeLink = document.querySelector('.hero__actions a[download]');
      if (!resumeLink) {
        printLine('Resume link not found — grab it from the hero section above.');
        return;
      }
      printLine('Downloading resume...');
      resumeLink.click();
    },
    whoami: () => {
      printLine('Pushap Raina — CS student at SPIT Mumbai, full-stack developer, occasional NLP tinkerer.');
    },
    clear: () => {
      termBody.innerHTML = '';
    },
  };

  function runCommand(raw) {
    const cmd = raw.trim();
    if (!cmd) return;

    printLine(escapeHtml(cmd), true);
    history.push(cmd);
    historyPos = history.length;

    const lower = cmd.toLowerCase();

    if (lower === 'sudo make coffee') {
      printLine('brewing... permission denied: I only run on tea, actually.');
      return;
    }
    if (lower.startsWith('sudo')) {
      printLine("Nice try — this terminal doesn't do root.");
      return;
    }
    if (lower === 'exit' || lower === 'quit') {
      closeTerminal();
      return;
    }

    const fn = commands[lower];
    if (fn) {
      fn();
    } else {
      printLine('command not found: ' + escapeHtml(cmd) + ' — type <span class="tok-str">help</span> to see what\'s available.');
    }
  }

  if (termInput) {
    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        runCommand(termInput.value);
        termInput.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyPos > 0) {
          historyPos--;
          termInput.value = history[historyPos] || '';
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyPos < history.length - 1) {
          historyPos++;
          termInput.value = history[historyPos] || '';
        } else {
          historyPos = history.length;
          termInput.value = '';
        }
      }
    });
  }

})();