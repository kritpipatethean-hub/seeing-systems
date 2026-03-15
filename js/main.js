// ========================================
// Main JS - Navigation, Hero Animation
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSidebar();
  initHeroAnimation();
});

// --- Navbar scroll effect ---
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// --- Sidebar menu ---
function initSidebar() {
  const hamburger = document.querySelector('.nav-hamburger');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  const closeBtn = document.querySelector('.sidebar-close');

  if (!hamburger || !sidebar) return;

  const toggle = (open) => {
    sidebar.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
  };

  hamburger.addEventListener('click', () => toggle(true));
  closeBtn?.addEventListener('click', () => toggle(false));
  overlay?.addEventListener('click', () => toggle(false));
}

// --- Hero: Animated feedback loop visualization ---
function initHeroAnimation() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, particles, connections;

  const colors = ['#00b4d8', '#06d6a0', '#e94560', '#ffd166', '#a78bfa', '#f97316', '#ff6b9d', '#48dbfb'];

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.radius = Math.random() * 6 + 2;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.alpha = Math.random() * 0.5 + 0.3;
      // Orbit around center for spiral effect
      this.angle = Math.random() * Math.PI * 2;
      this.orbitRadius = Math.random() * Math.min(width, height) * 0.4 + 50;
      this.orbitSpeed = (Math.random() * 0.003 + 0.001) * (Math.random() > 0.5 ? 1 : -1);
    }

    update() {
      this.angle += this.orbitSpeed;
      const centerX = width / 2;
      const centerY = height / 2;
      const targetX = centerX + Math.cos(this.angle) * this.orbitRadius;
      const targetY = centerY + Math.sin(this.angle) * this.orbitRadius;
      this.x += (targetX - this.x) * 0.02 + this.vx;
      this.y += (targetY - this.y) * 0.02 + this.vy;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  function init() {
    resize();
    const count = Math.min(Math.floor((width * height) / 4000), 200);
    particles = Array.from({ length: count }, () => new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = particles[i].color;
          ctx.globalAlpha = (1 - dist / 100) * 0.15;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    drawConnections();
    requestAnimationFrame(animate);
  }

  init();
  animate();
  window.addEventListener('resize', () => {
    resize();
    particles.forEach(p => p.reset());
  });
}
