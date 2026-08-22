(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const supportsObserver = "IntersectionObserver" in window;

  /* Shared navigation */
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navMobile = document.getElementById("navMobile");
  const navLinks = Array.from(document.querySelectorAll("[data-nav]"));

  if (nav) {
    const onScrollNav = () =>
      nav.classList.toggle("is-scrolled", window.scrollY > 12);
    onScrollNav();
    window.addEventListener("scroll", onScrollNav, { passive: true });
  }

  if (navToggle && navMobile) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMobile.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navMobile.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const currentPage = document.body.dataset.page;
  if (currentPage) {
    navLinks.forEach((link) => {
      const fileName =
        new URL(link.href, window.location.href).pathname.split("/").pop() ||
        "index.html";
      const linkPage =
        fileName === "index.html" ? "home" : fileName.replace(/\.html$/i, "");
      const isCurrent = linkPage === currentPage;
      link.classList.toggle("is-active", isCurrent);
      if (isCurrent) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  /* Progress bar */
  const scrollBar = document.getElementById("scrollBar");
  if (scrollBar) {
    const onScrollProgress = () => {
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      scrollBar.style.width =
        (max > 0 ? (root.scrollTop / max) * 100 : 0) + "%";
    };
    onScrollProgress();
    window.addEventListener("scroll", onScrollProgress, { passive: true });
  }

  /* Decorative effects */
  const matrixBg = document.getElementById("matrixBg");
  if (matrixBg && !prefersReducedMotion) {
    const chars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ#*&^%<>/[]{}()=+-|;:!?@~";
    const columnCount = 36;
    for (let i = 0; i < columnCount; i += 1) {
      const column = document.createElement("div");
      column.className = "matrix-column";
      column.style.left = i * (100 / columnCount) + Math.random() * 3.2 + "%";
      column.style.animationDuration = 9 + Math.random() * 10 + "s";
      column.style.animationDelay = -Math.random() * 12 + "s";
      column.style.opacity = (0.45 + Math.random() * 0.55).toFixed(2);
      Array.from({ length: 14 + Math.floor(Math.random() * 16) }, () => {
        const span = document.createElement("span");
        span.textContent = chars[Math.floor(Math.random() * chars.length)];
        return span;
      }).forEach((span) => column.appendChild(span));
      matrixBg.appendChild(column);
    }
  }

  const heroGlow = document.getElementById("heroGlow");
  if (heroGlow && !prefersReducedMotion) {
    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY < window.innerHeight)
          heroGlow.style.transform = `translateY(${window.scrollY * 0.15}px)`;
      },
      { passive: true }
    );
  }

  const cursorGlow = document.querySelector(".cursor-glow");
  if (cursorGlow && window.matchMedia("(hover: hover)").matches) {
    window.addEventListener(
      "mousemove",
      (event) => {
        cursorGlow.style.setProperty("--x", event.clientX + "px");
        cursorGlow.style.setProperty("--y", event.clientY + "px");
      },
      { passive: true }
    );
  }

  const hoverCapable = window.matchMedia("(hover: hover)").matches;
  if (hoverCapable && !prefersReducedMotion) {
    document.addEventListener(
      "pointermove",
      (event) => {
        const card = event.target.closest(".spotlight-card");
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", event.clientX - rect.left + "px");
        card.style.setProperty("--my", event.clientY - rect.top + "px");
      },
      { passive: true }
    );

    document.querySelectorAll(".btn").forEach((button) => {
      button.addEventListener("mousemove", (event) => {
        const rect = button.getBoundingClientRect();
        button.style.transform = `translate(${
          (event.clientX - rect.left - rect.width / 2) * 0.18
        }px, ${(event.clientY - rect.top - rect.height / 2) * 0.35}px)`;
      });
      button.addEventListener("mouseleave", () => {
        button.style.transform = "";
      });
    });
  }

  document.querySelectorAll(".btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (prefersReducedMotion) return;
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "btn__ripple";
      ripple.style.left = event.clientX - rect.left + "px";
      ripple.style.top = event.clientY - rect.top + "px";
      button.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    });
  });

  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  /* Reveals and counters */
  const revealEls = Array.from(
    document.querySelectorAll(".reveal, .about__stats")
  );
  if (prefersReducedMotion || !supportsObserver) {
    revealEls.forEach((element) => element.classList.add("is-visible"));
  } else if (revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((element) => revealObserver.observe(element));
  }

  const statNums = Array.from(document.querySelectorAll(".stat-card__num"));
  if (statNums.length) {
    const updateStat = (element) => {
      const target = Number.parseFloat(element.getAttribute("data-count"));
      const isDecimal = element.getAttribute("data-decimal") === "true";
      const suffix = element.getAttribute("data-suffix") || "";
      if (prefersReducedMotion || !Number.isFinite(target)) {
        element.textContent =
          (isDecimal ? target.toFixed(1) : String(target)) + suffix;
        return;
      }
      const start = performance.now();
      const frame = (now) => {
        const progress = Math.min((now - start) / 1400, 1);
        const value = target * (1 - Math.pow(1 - progress, 3));
        element.textContent =
          (isDecimal ? value.toFixed(1) : Math.round(value)) + suffix;
        if (progress < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    if (!supportsObserver) statNums.forEach(updateStat);
    else {
      const countObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            updateStat(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.5 }
      );
      statNums.forEach((element) => countObserver.observe(element));
    }
  }

  /* Home hero */
  const typewriterEl = document.getElementById("typewriter");
  const roles = [
    "Full-Stack Developer",
    "React · Next.js · Node.js",
    "Building AI-powered products",
    "500+ DSA problems solved",
  ];
  if (typewriterEl) {
    if (prefersReducedMotion) typewriterEl.textContent = roles[0];
    else {
      let roleIndex = 0;
      let charIndex = 0;
      let deleting = false;
      const tick = () => {
        const current = roles[roleIndex];
        charIndex += deleting ? -1 : 1;
        typewriterEl.textContent = current.slice(0, charIndex);
        if (!deleting && charIndex === current.length) {
          deleting = true;
          window.setTimeout(tick, 1800);
          return;
        }
        if (deleting && charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
        window.setTimeout(tick, deleting ? 35 : 65);
      };
      tick();
    }
  }

  const editorCode = document.querySelector("#editorCode code");
  const codeLines = [
    { text: "// always shipping something", cls: "tok-com" },
    { text: "const developer = {" },
    { text: "  name: ", tail: [['"Pushap Raina"', "tok-str"]] },
    { text: "  role: ", tail: [['"Full-Stack Developer"', "tok-str"]] },
    { text: "  based: ", tail: [['"Mumbai, India"', "tok-str"]] },
    {
      text: "  stack: [",
      tail: [
        ['"React"', "tok-str"],
        [", "],
        ['"Next.js"', "tok-str"],
        [", "],
        ['"Node.js"', "tok-str"],
        [", "],
        ['"C++"', "tok-str"],
        ["],"],
      ],
    },
    { text: "  dsaSolved: ", tail: [["500", "tok-prop"]] },
    {
      text: "  ",
      tail: [
        ["availableForWork", "tok-fn"],
        [": "],
        ["true", "tok-prop"],
        [","],
      ],
    },
    { text: "};" },
    { text: "" },
    {
      text: "function",
      cls: "tok-key",
      tail: [[" shipIt", "tok-fn"], ["(idea) {"]],
    },
    {
      text: "  return idea",
      tail: [
        [".build()", "tok-prop"],
        [".ship();", "tok-prop"],
      ],
    },
    { text: "}" },
  ];
  const escapeHtml = (value) =>
    value.replace(
      /[&<>]/g,
      (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[character])
    );
  const renderLineHtml = (line) => {
    let html = line.cls
      ? `<span class="${line.cls}">${escapeHtml(line.text)}</span>`
      : escapeHtml(line.text);
    (line.tail || []).forEach(([text, cls]) => {
      html += cls
        ? `<span class="${cls}">${escapeHtml(text)}</span>`
        : escapeHtml(text);
    });
    return html;
  };
  if (editorCode) {
    if (prefersReducedMotion)
      editorCode.innerHTML = codeLines.map(renderLineHtml).join("\n");
    else {
      let lineIndex = 0;
      const typeNextLine = () => {
        if (lineIndex >= codeLines.length) return;
        const line = codeLines[lineIndex];
        const fullText = line.text;
        let characterIndex = 0;
        const renderPartial = () => {
          const completed = codeLines.slice(0, lineIndex).map(renderLineHtml);
          const partial = line.cls
            ? `<span class="${line.cls}">${escapeHtml(
                fullText.slice(0, characterIndex)
              )}</span>`
            : escapeHtml(fullText.slice(0, characterIndex));
          editorCode.innerHTML = completed.concat(partial).join("\n");
        };
        const step = () => {
          characterIndex += 1;
          renderPartial();
          if (characterIndex < fullText.length) window.setTimeout(step, 14);
          else {
            editorCode.innerHTML = codeLines
              .slice(0, lineIndex)
              .map(renderLineHtml)
              .concat(renderLineHtml(line))
              .join("\n");
            lineIndex += 1;
            window.setTimeout(typeNextLine, 90);
          }
        };
        if (!fullText.length) {
          lineIndex += 1;
          window.setTimeout(typeNextLine, 60);
        } else step();
      };
      typeNextLine();
    }
  }

  /* Contact form */
  const form = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const fieldIds = ["name", "email", "subject", "message"];
  const fields = Object.fromEntries(
    fieldIds.map((id) => [id, document.getElementById(id)])
  );
  const setError = (fieldId, message) => {
    const field = fields[fieldId];
    const error = document.getElementById(fieldId + "Error");
    const wrapper = field && field.closest(".field");
    if (!field || !error || !wrapper) return;
    wrapper.classList.toggle("has-error", Boolean(message));
    error.textContent = message || "";
  };
  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  if (form && formStatus && fieldIds.every((id) => fields[id])) {
    const publicKey = "ElhlwQ4hpsqVwntVc";
    const serviceId = "service_vy2wpzq";
    const templateId = "template_2qmin89";
    if (window.emailjs) window.emailjs.init({ publicKey });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = Object.fromEntries(
        fieldIds.map((id) => [id, fields[id].value.trim()])
      );
      let valid = true;
      if (!values.name) {
        setError("name", "Please enter your name.");
        valid = false;
      } else setError("name", "");
      if (!values.email) {
        setError("email", "Please enter your email.");
        valid = false;
      } else if (!isValidEmail(values.email)) {
        setError("email", "That email doesn't look right.");
        valid = false;
      } else setError("email", "");
      if (!values.subject) {
        setError("subject", "Please add a subject.");
        valid = false;
      } else setError("subject", "");
      if (!values.message) {
        setError("message", "Please write a message.");
        valid = false;
      } else setError("message", "");
      if (!valid) {
        formStatus.textContent = "";
        return;
      }
      if (!window.emailjs) {
        formStatus.style.color = "#e8636b";
        formStatus.textContent =
          "The contact service is unavailable. Please email me directly at rainapushap96@gmail.com.";
        return;
      }
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      formStatus.style.color = "";
      formStatus.textContent = "Sending...";
      window.emailjs
        .send(serviceId, templateId, {
          from_name: values.name,
          from_email: values.email,
          subject: `[Portfolio] ${values.subject}`,
          message: values.message,
        })
        .then(() => {
          formStatus.textContent =
            "Message sent — thanks! I'll get back to you soon.";
          form.reset();
          fieldIds.forEach((id) => setError(id, ""));
          if (submitButton) submitButton.disabled = false;
        })
        .catch((error) => {
          formStatus.style.color = "#e8636b";
          formStatus.textContent =
            "Something went wrong — please email me directly at rainapushap96@gmail.com";
          if (submitButton) submitButton.disabled = false;
          console.log(error);
        });
    });
    fieldIds.forEach((id) =>
      fields[id].addEventListener("input", () => setError(id, ""))
    );
  }

  const copyEmailButton = document.getElementById("copyEmailBtn");
  if (copyEmailButton) {
    copyEmailButton.addEventListener("click", async () => {
      const email = copyEmailButton.getAttribute("data-copy");
      const label = copyEmailButton.querySelector(".copy-btn__label");
      try {
        await navigator.clipboard.writeText(email);
      } catch (error) {
        const temporaryInput = document.createElement("textarea");
        temporaryInput.value = email;
        temporaryInput.style.position = "fixed";
        temporaryInput.style.opacity = "0";
        document.body.appendChild(temporaryInput);
        temporaryInput.select();
        document.execCommand("copy");
        temporaryInput.remove();
      }
      copyEmailButton.classList.add("is-copied");
      copyEmailButton.setAttribute("aria-label", "Email copied to clipboard");
      const originalLabel = label ? label.textContent : "";
      if (label) label.textContent = "Copied!";
      window.setTimeout(() => {
        copyEmailButton.classList.remove("is-copied");
        copyEmailButton.setAttribute("aria-label", "Copy email address");
        if (label) label.textContent = originalLabel;
      }, 2000);
    });
  }

  /* Home terminal */
  const termFab = document.getElementById("termFab");
  const termOverlay = document.getElementById("termOverlay");
  const termClose = document.getElementById("termClose");
  const termBody = document.getElementById("termBody");
  const termInput = document.getElementById("termInput");
  if (termFab && termOverlay && termClose && termBody && termInput) {
    const history = [];
    let historyPosition = -1;
    const openTerminal = () => {
      termOverlay.classList.add("is-open");
      termOverlay.setAttribute("aria-hidden", "false");
      window.setTimeout(() => termInput.focus(), 50);
      document.body.style.overflow = "hidden";
    };
    const closeTerminal = () => {
      termOverlay.classList.remove("is-open");
      termOverlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      termFab.focus();
    };
    const printLine = (html, isCommand) => {
      const line = document.createElement("div");
      line.className = "term-line" + (isCommand ? " term-line--cmd" : "");
      line.innerHTML = html;
      termBody.appendChild(line);
      termBody.scrollTop = termBody.scrollHeight;
    };
    const navigate = (path) => {
      closeTerminal();
      window.location.href = path;
    };
    termFab.addEventListener("click", openTerminal);
    termClose.addEventListener("click", closeTerminal);
    termOverlay.addEventListener("click", (event) => {
      if (event.target === termOverlay) closeTerminal();
    });
    document.addEventListener("keydown", (event) => {
      const isOpen = termOverlay.classList.contains("is-open");
      if (
        !isOpen &&
        event.key === "/" &&
        document.activeElement.tagName !== "INPUT" &&
        document.activeElement.tagName !== "TEXTAREA"
      ) {
        event.preventDefault();
        openTerminal();
      } else if (isOpen && event.key === "Escape") closeTerminal();
    });
    const commands = {
      help: () =>
        printLine(
          [
            "Available commands:",
            '  <span class="tok-str">home</span>          — landing page',
            '  <span class="tok-str">about</span>         — who I am',
            '  <span class="tok-str">experience</span>    — where I\'ve worked',
            '  <span class="tok-str">projects</span>      — things I\'ve built',
            '  <span class="tok-str">skills</span>        — tech I use',
            '  <span class="tok-str">education</span>     — where I studied',
            '  <span class="tok-str">beyond</span>        — activities beyond code',
            '  <span class="tok-str">contact</span>       — get in touch',
            '  <span class="tok-str">social</span>        — GitHub / LinkedIn / LeetCode / email',
            '  <span class="tok-str">resume</span>        — download my CV',
            '  <span class="tok-str">whoami</span>        — one-line intro',
            '  <span class="tok-str">clear</span>         — clear this terminal',
          ].join("\n")
        ),
      home: () => navigate("index.html"),
      about: () => navigate("about.html"),
      experience: () => navigate("experience.html"),
      projects: () => navigate("projects.html"),
      skills: () => navigate("skills.html"),
      education: () => navigate("education.html"),
      beyond: () => navigate("extracurricular.html"),
      extracurricular: () => navigate("extracurricular.html"),
      contact: () => navigate("contact.html"),
      social: () =>
        printLine(
          'GitHub: <a href="https://github.com/pushapraina123" target="_blank" rel="noopener">github.com/pushapraina123</a>\nLinkedIn: <a href="https://linkedin.com/in/pushap-raina" target="_blank" rel="noopener">linkedin.com/in/pushap-raina</a>\nLeetCode: <a href="https://leetcode.com/pushapraina123" target="_blank" rel="noopener">leetcode.com/pushapraina123</a>\nEmail: <a href="mailto:rainapushap96@gmail.com">rainapushap96@gmail.com</a>'
        ),
      resume: () => {
        const resumeLink = document.querySelector(
          'a[download="PushapRaina_SDE.pdf"]'
        );
        if (resumeLink) resumeLink.click();
        else
          printLine(
            "Resume link not found — please use the download button on the Home page."
          );
      },
      whoami: () =>
        printLine(
          "Pushap Raina — final-year CS undergrad at SPIT Mumbai, full-stack developer, 500+ DSA problems deep."
        ),
      clear: () => {
        termBody.innerHTML = "";
      },
    };
    const runCommand = (raw) => {
      const command = raw.trim();
      if (!command) return;
      printLine(escapeHtml(command), true);
      history.push(command);
      historyPosition = history.length;
      const lower = command.toLowerCase();
      if (lower === "sudo make coffee") {
        printLine("brewing... permission denied: I only run on tea, actually.");
        return;
      }
      if (lower.startsWith("sudo")) {
        printLine("Nice try — this terminal doesn't do root.");
        return;
      }
      if (lower === "exit" || lower === "quit") {
        closeTerminal();
        return;
      }
      if (commands[lower]) commands[lower]();
      else
        printLine(
          "command not found: " +
            escapeHtml(command) +
            ' — type <span class="tok-str">help</span> to see what\'s available.'
        );
    };
    termInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        runCommand(termInput.value);
        termInput.value = "";
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (historyPosition > 0) {
          historyPosition -= 1;
          termInput.value = history[historyPosition] || "";
        }
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        if (historyPosition < history.length - 1) {
          historyPosition += 1;
          termInput.value = history[historyPosition] || "";
        } else {
          historyPosition = history.length;
          termInput.value = "";
        }
      }
    });
  }

  /* Lazy-load partial sections */
  (function () {
    const lazySections = Array.from(
      document.querySelectorAll("section.lazy-section[data-src]")
    );
    if (!lazySections.length) return;
    const loadHtml = async (section) => {
      const src = section.getAttribute("data-src");
      if (!src) return;
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(res.statusText);
        const html = await res.text();
        const temp = document.createElement("div");
        temp.innerHTML = html;
        while (temp.firstChild) section.appendChild(temp.firstChild);
        section.classList.remove("lazy-section");
        section.removeAttribute("aria-hidden");
        // initialize reveals inside the newly inserted content
        const reveals = section.querySelectorAll(".reveal");
        if (prefersReducedMotion || !("IntersectionObserver" in window))
          reveals.forEach((el) => el.classList.add("is-visible"));
        else {
          const obs = new IntersectionObserver(
            (entries, o) => {
              entries.forEach((e) => {
                if (e.isIntersecting) {
                  e.target.classList.add("is-visible");
                  o.unobserve(e.target);
                }
              });
            },
            { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
          );
          reveals.forEach((el) => obs.observe(el));
        }
        // initialize stat-number counters
        const nums = section.querySelectorAll(".stat-card__num");
        nums.forEach((el) => {
          const target = Number.parseFloat(el.getAttribute("data-count"));
          const isDecimal = el.getAttribute("data-decimal") === "true";
          const suffix = el.getAttribute("data-suffix") || "";
          if (prefersReducedMotion || !Number.isFinite(target)) {
            el.textContent =
              (isDecimal ? target.toFixed(1) : String(target)) + suffix;
            return;
          }
          const start = performance.now();
          const frame = (now) => {
            const progress = Math.min((now - start) / 1400, 1);
            const value = target * (1 - Math.pow(1 - progress, 3));
            el.textContent =
              (isDecimal ? value.toFixed(1) : Math.round(value)) + suffix;
            if (progress < 1) requestAnimationFrame(frame);
          };
          requestAnimationFrame(frame);
        });
      } catch (err) {
        console.warn("Failed to load partial", src, err);
      }
    };
    if ("IntersectionObserver" in window) {
      const partialObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            loadHtml(entry.target);
          });
        },
        { rootMargin: "300px 0px" }
      );
      lazySections.forEach((s) => partialObserver.observe(s));
    } else {
      lazySections.forEach((s) => loadHtml(s));
    }
  })();
})();
