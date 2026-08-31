/* ============================================
   SMART LT — Shared JavaScript
   Navigation, Scroll Animations, Utilities
   ============================================ */

(function () {
  'use strict';

  // ---- Navigation ----
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const closeBtn = document.querySelector('.nav__close');

  // Scroll effect
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });
  }

  // Mobile menu
  function openMenu() {
    if (mobileMenu) {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }
  function closeMenu() {
    if (mobileMenu) {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (toggle) toggle.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (mobileMenu) {
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) closeMenu();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ---- Scroll Animations ----
  const animElements = document.querySelectorAll('[data-animate]');
  if (animElements.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    animElements.forEach(el => observer.observe(el));
  } else {
    // Fallback: just show everything
    animElements.forEach(el => el.classList.add('visible'));
  }

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        closeMenu();
      }
    });
  });

  // ---- Animated counters ----
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => counterObserver.observe(el));
  }

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    const decimals = (el.getAttribute('data-decimals') || '0');
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1500;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = prefix + current.toFixed(parseInt(decimals)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---- Accordion ----
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const body = item.querySelector('.accordion-body');

      // Close others in same group
      const parent = item.parentElement;
      parent.querySelectorAll('.accordion-item.open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.accordion-body').style.maxHeight = '0';
        }
      });

      // Toggle current
      item.classList.toggle('open');
      if (item.classList.contains('open')) {
        body.style.maxHeight = body.scrollHeight + 'px';
      } else {
        body.style.maxHeight = '0';
      }
    });
  });

  // ---- Architecture layers (expandable) ----
  document.querySelectorAll('.arch-layer').forEach(layer => {
    layer.addEventListener('click', () => {
      const body = layer.querySelector('.arch-layer__body');

      // Close others
      document.querySelectorAll('.arch-layer.open').forEach(openLayer => {
        if (openLayer !== layer) {
          openLayer.classList.remove('open');
          openLayer.querySelector('.arch-layer__body').style.maxHeight = '0';
        }
      });

      layer.classList.toggle('open');
      if (layer.classList.contains('open')) {
        body.style.maxHeight = body.scrollHeight + 'px';
      } else {
        body.style.maxHeight = '0';
      }
    });
  });

  // ---- Tabs ----
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    const tabs = tabGroup.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const targetId = tab.getAttribute('data-tab');
        if (targetId) {
          const parent = tabGroup.closest('.tabs-container') || tabGroup.parentElement;
          parent.querySelectorAll('.tab-panel').forEach(panel => {
            panel.hidden = panel.id !== targetId;
          });
        }
      });
    });
  });

  // ---- Documentation sidebar navigation ----
  document.querySelectorAll('.sidebar__link').forEach(link => {
    link.addEventListener('click', (e) => {
      document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // ---- Contact form handler ----
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const overlay = document.getElementById('successOverlay');
      if (overlay) {
        overlay.classList.add('active');
        setTimeout(() => {
          overlay.classList.remove('active');
        }, 4000);
      }
      contactForm.reset();
    });
  }

  // ---- Lucide icons init ----
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ============================================
  // BACKGROUND CANVAS ANIMATION
  // ============================================
  (function initBgCanvas() {
    let canvas = document.getElementById('globalBgCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'globalBgCanvas';
      document.body.prepend(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 45;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Particle constructor
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.3 ? '#58a6ff' : '#56d4dd'
      });
    }

    let mouse = { x: -1000, y: -1000 };
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // Draw and update particles
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.strokeStyle = '#58a6ff';
            ctx.globalAlpha = (1 - dist / 130) * 0.12;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Mouse interaction glow
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 140) {
          ctx.strokeStyle = '#56d4dd';
          ctx.globalAlpha = (1 - mdist / 140) * 0.25;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }
    draw();
  })();

  // ============================================
  // ⚡ BOLT AI ASSISTANT — Full Nova-Style Replica
  // Powered by Groq LLM via Netlify Function
  // ============================================
  (function initBoltAI() {

    /* ---- SVG Mascot Generator (Nova-Style 3D Blob with Lightning) ---- */
    function mascotSVG(sz, isSmall) {
      const eyeR = isSmall ? 5 : 8;
      const pupR = isSmall ? 2 : 3;
      const hiR = isSmall ? 1 : 1.5;
      return '<svg viewBox="0 0 100 100" width="'+sz+'" height="'+sz+'" class="bolt-mascot-svg" style="overflow:visible;">'
        +'<defs>'
        +'<radialGradient id="boltGrad'+sz+'" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#93c5fd"/><stop offset="35%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></radialGradient>'
        +'<radialGradient id="boltHL'+sz+'" cx="25%" cy="25%" r="40%"><stop offset="0%" stop-color="rgba(255,255,255,0.85)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>'
        +'</defs>'
        +'<!-- Blob Body -->'
        +'<path class="bolt-body" d="M50 10 C80 10,90 30,90 50 C90 80,70 90,50 90 C30 90,10 80,10 50 C10 30,20 10,50 10Z" fill="url(#boltGrad'+sz+')" />'
        +'<path d="M50 10 C80 10,90 30,90 50 C90 80,70 90,50 90 C30 90,10 80,10 50 C10 30,20 10,50 10Z" fill="url(#boltHL'+sz+')" style="mix-blend-mode:overlay;" />'
        +'<!-- Lightning Antenna -->'
        +'<path d="M48 14 L43 25 L49 24 L45 35 L56 22 L49 23 L53 14 Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="0.5" filter="drop-shadow(0 0 4px #fbbf24)"/>'
        +'<!-- Eyes Group -->'
        +'<g class="bolt-eyes-group">'
        +'  <circle cx="35" cy="48" r="'+eyeR+'" fill="#0f172a"/>'
        +'  <circle class="bolt-pupil-left" cx="35" cy="48" r="'+pupR+'" fill="#ffffff"/>'
        +'  <circle class="bolt-hi-left" cx="33" cy="46" r="'+hiR+'" fill="#ffffff"/>'
        +'  <circle cx="65" cy="48" r="'+eyeR+'" fill="#0f172a"/>'
        +'  <circle class="bolt-pupil-right" cx="65" cy="48" r="'+pupR+'" fill="#ffffff"/>'
        +'  <circle class="bolt-hi-right" cx="63" cy="46" r="'+hiR+'" fill="#ffffff"/>'
        +'</g>'
        +'<!-- Tiny Smile -->'
        +'<path class="bolt-mouth" d="M 44 62 Q 50 67 56 62" fill="transparent" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"/>'
        +'<!-- Cheeks Blush -->'
        +'<ellipse cx="22" cy="56" rx="5" ry="3" fill="#fb7185" opacity="0.45"/>'
        +'<ellipse cx="78" cy="56" rx="5" ry="3" fill="#fb7185" opacity="0.45"/>'
        +'</svg>';
    }

    /* ---- State ---- */
    let boltOpen = false;
    let boltTyping = false;
    const boltMsgs = [
      { role:'assistant', content:'⚡ Hey! I\'m **Bolt**, the Smart LT Grid AI. I analyze live grid telemetry, diagnose faults, and explain sub-50ms isolation logic. How can I help you today?' }
    ];
    const boltSuggestions = [
      '⚡ Run fault diagnosis',
      '🔍 How does sub-50ms isolation work?',
      '🛡️ Hackathon MVP Tech Stack',
      '⚡ Simulate line break'
    ];

    /* ---- DOM: Floating Launcher ---- */
    const boltTrig = document.createElement('div');
    boltTrig.id = 'boltTriggerContainer';
    boltTrig.className = 'bolt-launcher-container';
    boltTrig.innerHTML = `
      <div class="bolt-tooltip">Ask Bolt AI ⚡</div>
      <button id="boltTriggerBtn" class="bolt-launcher-btn" aria-label="Open AI Assistant" title="Ask Bolt AI">
        <div class="bolt-mascot-wrapper">${mascotSVG(56, false)}</div>
        <div class="bolt-ping-ring"></div>
        <div class="bolt-badge-dot"></div>
      </button>
    `;
    document.body.appendChild(boltTrig);

    /* ---- DOM: Chat Panel ---- */
    const boltPanel = document.createElement('div');
    boltPanel.id = 'boltPanel';
    boltPanel.className = 'bolt-panel';
    boltPanel.innerHTML = ''
      +'<div class="bolt-panel__header">'
      +'  <div class="bolt-panel__header-left">'
      +'    <div class="bolt-panel__avatar">'+mascotSVG(36, true)+'</div>'
      +'    <div>'
      +'      <div class="bolt-panel__name">Bolt</div>'
      +'      <div class="bolt-panel__status">'
      +'        <span class="bolt-status-dot"></span>'
      +'        <span class="bolt-status-ping"></span>'
      +'        AI ASSISTANT &bull; LIVE'
      +'      </div>'
      +'    </div>'
      +'  </div>'
      +'  <button class="bolt-panel__close" id="boltCloseBtn" aria-label="Close Chat">&times;</button>'
      +'</div>'
      +'<div class="bolt-panel__messages" id="boltMessages"></div>'
      +'<div class="bolt-panel__suggestions" id="boltSuggestions"></div>'
      +'<div class="bolt-panel__input-area">'
      +'  <form id="boltForm" class="bolt-panel__form">'
      +'    <input type="text" id="boltInput" class="bolt-panel__input" placeholder="Message Bolt about grid status, faults..." autocomplete="off"/>'
      +'    <button type="submit" class="bolt-panel__send" id="boltSendBtn" aria-label="Send">'
      +'      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'
      +'    </button>'
      +'  </form>'
      +'</div>';
    document.body.appendChild(boltPanel);

    /* ---- Element References ---- */
    const bLauncherBtn = document.getElementById('boltTriggerBtn');
    const bCloseBtn = document.getElementById('boltCloseBtn');
    const bForm = document.getElementById('boltForm');
    const bInput = document.getElementById('boltInput');
    const bMsgBox = document.getElementById('boltMessages');
    const bSugBox = document.getElementById('boltSuggestions');

    /* ---- Mouse Eye Tracking ---- */
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    function updatePupils() {
      const svgs = document.querySelectorAll('.bolt-mascot-svg');
      svgs.forEach(svg => {
        const rect = svg.getBoundingClientRect();
        if (rect.width === 0) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = mouseX - cx;
        const dy = mouseY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const maxR = 3.5;
        const ratio = Math.min(dist, 400) / 400;
        const ox = (dx / dist) * maxR * ratio;
        const oy = (dy / dist) * maxR * ratio;

        svg.querySelectorAll('.bolt-pupil-left, .bolt-hi-left, .bolt-pupil-right, .bolt-hi-right').forEach(el => {
          el.style.transform = `translate(${ox}px, ${oy}px)`;
        });
      });
      requestAnimationFrame(updatePupils);
    }
    requestAnimationFrame(updatePupils);

    /* ---- Blinking Animation ---- */
    setInterval(() => {
      if (Math.random() > 0.25) {
        document.querySelectorAll('.bolt-eyes-group').forEach(g => {
          g.style.transition = 'transform 0.1s ease';
          g.style.transformOrigin = '50% 48px';
          g.style.transform = 'scaleY(0.1)';
          setTimeout(() => {
            g.style.transform = 'scaleY(1)';
          }, 140);
        });
      }
    }, 3800);

    /* ---- Open / Close Handlers ---- */
    function openBolt() {
      boltOpen = true;
      boltPanel.classList.add('open');
      boltTrig.classList.add('hidden');
      if (bInput) bInput.focus();
      renderMsgs();
      renderSugs();
    }

    function closeBolt() {
      boltOpen = false;
      boltPanel.classList.remove('open');
      boltTrig.classList.remove('hidden');
    }

    if (bLauncherBtn) bLauncherBtn.addEventListener('click', openBolt);
    if (bCloseBtn) bCloseBtn.addEventListener('click', closeBolt);

    // Click outside to close
    document.addEventListener('mousedown', (e) => {
      if (boltOpen && !boltPanel.contains(e.target) && !boltTrig.contains(e.target)) {
        closeBolt();
      }
    });

    // Custom Event & Global Trigger
    window.addEventListener('open-bolt-chat', openBolt);
    window.addEventListener('open-nova-chat', openBolt);

    // Universal selector for any Launch AI button on the site
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button, a');
      if (!btn) return;
      if (
        btn.hasAttribute('data-open-ai') ||
        btn.classList.contains('btn-open-ai') ||
        btn.id === 'aiAssistantBtn' ||
        btn.id === 'boltTriggerBtn'
      ) {
        e.preventDefault();
        openBolt();
      }
    });

    /* ---- Rendering ---- */
    function esc(s) {
      return s.replace(/[&<>'"]/g, t => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[t] || t));
    }
    function formatMarkdown(s) {
      return s
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
    }

    function renderMsgs() {
      if (!bMsgBox) return;
      bMsgBox.innerHTML = '';
      boltMsgs.forEach(m => {
        const d = document.createElement('div');
        d.className = `bolt-msg bolt-msg--${m.role === 'assistant' ? 'bot' : 'user'}`;
        if (m.role === 'assistant') {
          d.innerHTML = `<div class="bolt-msg__avatar">${mascotSVG(28, true)}</div><div class="bolt-msg__bubble">${formatMarkdown(m.content)}</div>`;
        } else {
          d.innerHTML = `<div class="bolt-msg__bubble">${esc(m.content)}</div>`;
        }
        bMsgBox.appendChild(d);
      });

      if (boltTyping) {
        const td = document.createElement('div');
        td.className = 'bolt-msg bolt-msg--bot';
        td.innerHTML = `<div class="bolt-msg__avatar">${mascotSVG(28, true)}</div>`
          +`<div class="bolt-msg__bubble bolt-typing"><span class="bolt-dot"></span><span class="bolt-dot"></span><span class="bolt-dot"></span></div>`;
        bMsgBox.appendChild(td);
      }
      bMsgBox.scrollTop = bMsgBox.scrollHeight;
    }

    function renderSugs() {
      if (!bSugBox) return;
      if (boltMsgs.length > 1) {
        bSugBox.style.display = 'none';
        return;
      }
      bSugBox.style.display = 'flex';
      bSugBox.innerHTML = '';
      boltSuggestions.forEach(s => {
        const b = document.createElement('button');
        b.className = 'bolt-suggestion';
        b.textContent = s;
        b.addEventListener('click', () => handleSend(s.replace(/^[^\w]+/, '').trim()));
        bSugBox.appendChild(b);
      });
    }

    /* ---- Send Message to AI ---- */
    async function handleSend(text) {
      if (!text || !text.trim() || boltTyping) return;
      const cleanText = text.trim();
      const lower = cleanText.toLowerCase();

      // Special action: Trigger line break on monitoring page if requested
      if (lower.includes('simulate') && (lower.includes('line break') || lower.includes('fault') || lower.includes('break'))) {
        const simBtn = document.getElementById('simBtn');
        if (simBtn) {
          boltMsgs.push({ role: 'user', content: cleanText });
          boltTyping = true;
          renderMsgs();
          renderSugs();
          setTimeout(() => {
            simBtn.click();
            boltMsgs.push({
              role: 'assistant',
              content: '⚡ **Fault Simulation Triggered!** I\'ve initiated a simulated line break on **Section 03**. Watch the 6-step progress pipeline on the dashboard as the system detects and isolates the break in real-time.'
            });
            boltTyping = false;
            renderMsgs();
          }, 500);
          return;
        }
      }

      boltMsgs.push({ role: 'user', content: cleanText });
      boltTyping = true;
      renderMsgs();
      renderSugs();

      const apiMsgs = boltMsgs.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));

      try {
        // 1. Attempt fetch from Netlify function endpoint
        const endpoints = ['/api/chat', '/.netlify/functions/chat'];
        let res = null;
        for (const ep of endpoints) {
          try {
            const r = await fetch(ep, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ messages: apiMsgs })
            });
            if (r.ok) { res = r; break; }
          } catch (e) { /* try next endpoint */ }
        }

        if (res && res.ok) {
          const data = await res.json();
          if (data.reply) {
            boltMsgs.push({ role: 'assistant', content: data.reply });
            return;
          }
        }

        // 2. Direct Groq API client call as fallback
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer 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"
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages: [
              {
                role: "system",
                content: "You are Bolt, the Smart LT Grid AI Assistant — a smart diagnostic companion for the Smart LT hackathon project. You explain electrical line break detection, sub-50ms isolation, and grid telemetry. Keep answers concise, lively, and technical (1-2 short paragraphs max). Speak directly to the user without any internal reasoning or thinking steps. Use ⚡ and 🔍 occasionally."
              },
              ...apiMsgs
            ],
            temperature: 0.7,
            max_tokens: 450
          })
        });

        if (groqRes.ok) {
          const gData = await groqRes.json();
          let reply = gData.choices?.[0]?.message?.content;
          if (reply) {
            reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/Here's a thinking process:[\s\S]*?(?=(\n\n|\n[A-Z⚡👋🔍]|$))/i, '').trim();
            boltMsgs.push({ role: 'assistant', content: reply });
            return;
          }
        }

        throw new Error('API unreachable');
      } catch (err) {
        console.warn('API error, using local fallback:', err);
        const fallback = getLocalKnowledge(cleanText);
        boltMsgs.push({ role: 'assistant', content: fallback });
      } finally {
        boltTyping = false;
        renderMsgs();
      }
    }

    /* ---- Local Knowledgebase Engine (Fallback) ---- */
    function getLocalKnowledge(q) {
      const l = q.toLowerCase();
      if (l.includes('diagnosis') || l.includes('health') || l.includes('status') || l.includes('check')) {
        return '📊 **Grid Telemetry Diagnostics:**\n- **System Uptime:** 99.97% (Nominal)\n- **Line Voltage:** 240.0V (±0.5% balanced)\n- **Grid Frequency:** 50.00 Hz (Phase-locked)\n- **Monitored Sections:** 8 / 8 Active\n- **Fault Relays:** Armed & Ready (< 50ms trigger)';
      }
      if (l.includes('isolation') || l.includes('50ms') || l.includes('how') || l.includes('latency')) {
        return '🔍 **Sub-50ms Detection & Isolation Pipeline:**\n1. **10kHz Waveform Sampling:** Sensors monitor transient impedance shifts.\n2. **Edge ML Inference:** Lightweight model detects true break signatures within 15ms.\n3. **IEC 61850 GOOSE:** Peer-to-peer trip signals open sectionalizer switches in < 50ms.\n4. **Auto-Restoration:** Power reroutes to adjacent healthy zones automatically.';
      }
      if (l.includes('stack') || l.includes('tech') || l.includes('hackathon') || l.includes('project') || l.includes('mvp')) {
        return '🛠️ **Smart LT Hackathon Stack:**\n- **UI/Frontend:** Vanilla HTML5, Glassmorphism CSS, Canvas 2D telemetry, Lucide icons.\n- **AI Assistant:** Groq LLM (Llama 3.1 8B) with serverless Netlify function proxy.\n- **Simulations:** 6-step fault injector, live voltage charts, and topology canvas.';
      }
      if (l.includes('hello') || l.includes('hi') || l.includes('hey')) {
        return '👋 Hey there! I\'m **Bolt**, your AI grid assistant. Ask me to run a fault diagnosis, explain our sub-50ms isolation tech, or try simulating a line break!';
      }
      return '⚡ Smart LT continuously monitors line parameters to prevent electrocution and wildfire risks. You can explore the **Monitoring Console** for live telemetry or the **Technology** page for our full detection pipeline!';
    }

    /* ---- Form Handler ---- */
    if (bForm && bInput) {
      bForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = bInput.value.trim();
        if (!val) return;
        bInput.value = '';
        handleSend(val);
      });
    }

    // Initial render
    renderMsgs();

    // Expose open function
    window.openBoltAI = openBolt;
    return openBolt;
  })();

  // ---- Expose Global Utilities ----
  window.SmartLT = {
    closeMenu,
    openMenu,
    animateCounter,
    openAI: function() {
      if (typeof window.openBoltAI === 'function') {
        window.openBoltAI();
      } else {
        window.dispatchEvent(new CustomEvent('open-bolt-chat'));
      }
    }
  };

})();

