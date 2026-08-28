/* ==========================================================================
   🪐 Guía del Estudiante (Antigravity & UX/UI) — Lógica Interactiva
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const sidebar = document.getElementById('sidebar');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const backToTopBtn = document.getElementById('back-to-top-btn');
  const progressBar = document.getElementById('reading-progress-bar');
  const toast = document.getElementById('toast-notification');

  // 1. Theme Management (Dark / Light)
  const savedTheme = localStorage.getItem('seminario_theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    themeToggleBtn.textContent = '🌙';
  } else {
    document.body.classList.remove('light-mode');
    themeToggleBtn.textContent = '☀️';
  }

  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('seminario_theme', isLight ? 'light' : 'dark');
    themeToggleBtn.textContent = isLight ? '🌙' : '☀️';
    showToast(isLight ? '☀️ Modo Claro activado' : '🌌 Modo Espacio Profundo activado');
  });

  // 2. Mobile Drawer
  function openMobileDrawer() {
    sidebar.classList.add('open');
    drawerBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    sidebar.classList.remove('open');
    drawerBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      if (sidebar.classList.contains('open')) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });
  }

  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', closeMobileDrawer);
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', closeMobileDrawer);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      closeMobileDrawer();
    }
  });

  // 3. Scroll-Spy & Active TOC Highlight
  const tocLinks = document.querySelectorAll('.toc-link');

  function updateActiveTocLink() {
    const sections = document.querySelectorAll('section[id]');
    let currentId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      if (scrollPos >= top) {
        currentId = section.id;
      }
    });

    tocLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      if (href === currentId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    if (progressBar) progressBar.style.width = `${scrolled}%`;

    if (winScroll > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }

    updateActiveTocLink();
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  tocLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileDrawer();
    });
  });

  // 4. Code & Prompt Copy Buttons
  const copyButtons = document.querySelectorAll('.copy-code-btn');

  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const codeBlock = btn.closest('.code-container').querySelector('.code-content');
      if (!codeBlock) return;

      const textToCopy = codeBlock.textContent;

      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalText = btn.innerHTML;
        btn.classList.add('copied');
        btn.innerHTML = '<span>✓</span> <span>¡Copiado!</span>';
        showToast('📋 Prompt copiado al portapapeles');

        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = originalText;
        }, 2200);
      } catch (err) {
        console.error('Error al copiar:', err);
        showToast('⚠️ No se pudo copiar automáticamente');
      }
    });
  });

  // 5. Toast Notification Helper
  let toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // 6. Interactive Checklist Progress Persistence
  const checklistInputs = document.querySelectorAll('.check-item input[type="checkbox"]');

  checklistInputs.forEach(input => {
    const key = `check_est_${input.id || input.dataset.checkId}`;
    if (key && localStorage.getItem(key) === 'true') {
      input.checked = true;
    }

    input.addEventListener('change', () => {
      if (key) {
        localStorage.setItem(key, input.checked ? 'true' : 'false');
      }
      showToast(input.checked ? '☑️ Paso completado' : '⬜ Paso pendiente');
    });
  });

  // 7. Instant Search Filter
  if (searchInput) {
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
      if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.blur();
      }
    });

    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      const searchableSections = document.querySelectorAll('section, .code-container, .check-item, .feature-card');

      if (!term) {
        searchableSections.forEach(el => el.style.display = '');
        return;
      }

      searchableSections.forEach(el => {
        const text = el.textContent.toLowerCase();
        if (text.includes(term)) {
          el.style.display = '';
        } else {
          el.style.display = 'none';
        }
      });
    });
  }
});
