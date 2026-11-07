// ========================================================
// JACK 3D PORTFOLIO — INTERACTIVE PHYSICS & TRACKING ENGINE
// ========================================================

document.addEventListener('DOMContentLoaded', () => {

  // 1. CUSTOM MOUSE CURSOR WITH INERTIA / LERP
  const cursor = document.getElementById('custom-cursor');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  const lerp = (start, end, factor) => start + (end - start) * factor;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function renderCursor() {
    cursorX = lerp(cursorX, mouseX, 0.22);
    cursorY = lerp(cursorY, mouseY, 0.22);
    if (cursor) {
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    }
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover states for links & interactive items
  const interactives = document.querySelectorAll('a, button, .service-row, .marquee-card, #character-wrapper');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => cursor?.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => cursor?.classList.remove('cursor-hover'));
  });

  // 2. 3D HERO HEAD MOUSE TRACKING
  const charWrapper = document.getElementById('character-wrapper');
  const eyeLeft = document.getElementById('eye-left-tracker');
  const eyeRight = document.getElementById('eye-right-tracker');

  let targetRotX = 0;
  let targetRotY = 0;
  let currRotX = 0;
  let currRotY = 0;

  window.addEventListener('mousemove', (e) => {
    const { innerWidth: w, innerHeight: h } = window;
    // Normalized coordinates (-1 to 1)
    const nx = (e.clientX - w / 2) / (w / 2);
    const ny = (e.clientY - h / 2) / (h / 2);

    // Max rotation angles (degrees)
    targetRotY = nx * 22;  // Left-right tilt
    targetRotX = -ny * 18; // Up-down tilt
  });

  function updateHeadRotation() {
    currRotX = lerp(currRotX, targetRotX, 0.1);
    currRotY = lerp(currRotY, targetRotY, 0.1);

    if (charWrapper) {
      charWrapper.style.transform = `rotateX(${currRotX.toFixed(2)}deg) rotateY(${currRotY.toFixed(2)}deg) translateZ(10px)`;
    }
    requestAnimationFrame(updateHeadRotation);
  }
  requestAnimationFrame(updateHeadRotation);

  // 3. ABOUT ME FLOATING ARTIFACTS MOUSE PARALLAX
  const floatingItems = document.querySelectorAll('.floating-item');
  window.addEventListener('mousemove', (e) => {
    const { innerWidth: w, innerHeight: h } = window;
    const nx = (e.clientX - w / 2) / (w / 2);
    const ny = (e.clientY - h / 2) / (h / 2);

    floatingItems.forEach(item => {
      const speed = parseFloat(item.getAttribute('data-speed') || '1.0');
      const offsetX = nx * 25 * speed;
      const offsetY = ny * 25 * speed;
      item.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
    });
  });

  // 4. STICKY STACKED CARDS DEPTH ON SCROLL
  const stackCards = document.querySelectorAll('.stack-card');
  window.addEventListener('scroll', () => {
    stackCards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const topOffset = 80 + index * 24;
      
      // When card hits its sticky top anchor
      if (rect.top <= topOffset + 10) {
        const nextCard = stackCards[index + 1];
        if (nextCard) {
          const nextRect = nextCard.getBoundingClientRect();
          const progress = Math.max(0, Math.min(1, (topOffset + 300 - nextRect.top) / 300));
          const scale = 1 - progress * 0.04;
          const brightness = 1 - progress * 0.2;
          card.style.transform = `scale(${scale.toFixed(3)})`;
          card.style.filter = `brightness(${brightness.toFixed(2)})`;
        }
      } else {
        card.style.transform = 'scale(1)';
        card.style.filter = 'brightness(1)';
      }
    });
  }, { passive: true });

});

