/* ==========================================================================
   BARDIA SHEIKH — Interaction & Atmosphere Layer (vanilla JS, no deps)
   ========================================================================== */

(() => {
  'use strict';

  /* ----------------------------------------------------------------
     1. THEME TOGGLE — persisted via localStorage, 500ms smooth swap
  ---------------------------------------------------------------- */
  const themeToggle = document.getElementById('theme-toggle');
  const STORAGE_KEY = 'bardia-theme';

  function applyTheme(theme){
    document.body.classList.toggle('light', theme === 'light');
  }

  // load saved theme, default to dark
  const savedTheme = localStorage.getItem(STORAGE_KEY) || 'dark';
  applyTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.contains('light');
    const next = isLight ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  });

  /* ----------------------------------------------------------------
     2. SCROLL REVEAL — IntersectionObserver fade/slide-up for
        every element with the .reveal class
  ---------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target); // animate once
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ----------------------------------------------------------------
     3. SMOOTH SCROLL — nav links + Badasses CTA button
  ---------------------------------------------------------------- */
  function smoothScrollTo(hash){
    const target = document.querySelector(hash);
    if (target){
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      smoothScrollTo(link.getAttribute('href'));
    });
  });

  const badassesBtn = document.getElementById('badasses-btn');
  if (badassesBtn){
    badassesBtn.addEventListener('click', () => smoothScrollTo('#badasses'));
  }

  /* ----------------------------------------------------------------
     4. HERO GLITCH REVEAL — brief glitch burst on load
  ---------------------------------------------------------------- */
  const heroTitle = document.querySelector('.hero-title');
  window.addEventListener('DOMContentLoaded', () => {
    if (heroTitle){
      // trigger glitch shortly after load, then again occasionally
      setTimeout(() => heroTitle.classList.add('glitch-active'), 400);
      setInterval(() => {
        heroTitle.classList.remove('glitch-active');
        // force reflow so animation can restart
        void heroTitle.offsetWidth;
        heroTitle.classList.add('glitch-active');
      }, 6000);
    }
  });

  /* ----------------------------------------------------------------
     5. CURSOR GLOW + LIGHT MOUSE PARALLAX ON HERO
  ---------------------------------------------------------------- */
  const cursorGlow = document.querySelector('.cursor-glow');
  const heroSection = document.querySelector('.hero');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let glowX = mouseX;
  let glowY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // subtle parallax tilt for hero title based on cursor position
    if (heroSection){
      const rect = heroSection.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0){
        const relX = (e.clientX / window.innerWidth - 0.5) * 2;  // -1 to 1
        const relY = (e.clientY / window.innerHeight - 0.5) * 2;
        heroTitle && (heroTitle.style.transform = `translate(${relX * 8}px, ${relY * 6}px)`);
      }
    }
  });

  // smooth-follow loop for the cursor glow (lerp for buttery motion)
  function animateGlow(){
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    if (cursorGlow){
      cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
    }
    requestAnimationFrame(animateGlow);
  }
  requestAnimationFrame(animateGlow);

  /* ----------------------------------------------------------------
     6. PARTICLE / DUST FIELD — canvas-based ambient atmosphere
  ---------------------------------------------------------------- */
  const canvas = document.getElementById('dust-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let width, height;
  const PARTICLE_COUNT = 90;

  function resizeCanvas(){
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight * 2.2; // cover generous scroll depth visually via fixed positioning
  }

  function createParticles(){
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++){
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.4,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15 - 0.05, // gentle upward drift
        alpha: Math.random() * 0.5 + 0.15,
        hue: Math.random() > 0.5 ? '139,92,246' : '0,229,255' // purple / cyan mix
      });
    }
  }

  function drawParticles(){
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      // wrap around edges so the field feels endless
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue}, ${p.alpha})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = `rgba(${p.hue}, ${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(drawParticles);
  }

  function initParticleField(){
    resizeCanvas();
    createParticles();
    drawParticles();
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    createParticles();
  });

  initParticleField();

})();
