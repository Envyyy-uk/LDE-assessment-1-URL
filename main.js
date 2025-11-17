// SPA logic for 4 tasks + Home + reference highlight (final)
// (unchanged — keeps behavior the same)

const tasks = {
  "home": "",
  "task1": "",
  "task2": "",
  "task3": "",
  "task4": ""
};

// Load all pages
fetch("Home.html").then(r=>r.text()).then(html=>{ tasks.home = html; if(getPage()==="home") renderTask("home"); });
fetch("Task1.html").then(r=>r.text()).then(html=>{ tasks.task1 = html; if(getPage()==="task1") renderTask("task1"); });
fetch("Task2.html").then(r=>r.text()).then(html=>{ tasks.task2 = html; if(getPage()==="task2") renderTask("task2"); });
fetch("Task3.html").then(r=>r.text()).then(html=>{ tasks.task3 = html; if(getPage()==="task3") renderTask("task3"); });
fetch("Task4.html").then(r=>r.text()).then(html=>{ tasks.task4 = html; if(getPage()==="task4") renderTask("task4"); });

function getPage() {
  const hash = location.hash.replace("#", "");
  return (!hash || hash === "home") ? "home" : hash;
}

function renderTask(page) {
  document.getElementById("app").innerHTML = tasks[page] || tasks["home"];
  ["navHome","nav1","nav2","nav3","nav4"].forEach(id=>{
    const el = document.getElementById(id); if(el) el.classList.remove("active");
  });
  if(page==="home") document.getElementById("navHome")?.classList.add("active");
  if(page==="task1") document.getElementById("nav1")?.classList.add("active");
  if(page==="task2") document.getElementById("nav2")?.classList.add("active");
  if(page==="task3") document.getElementById("nav3")?.classList.add("active");
  if(page==="task4") document.getElementById("nav4")?.classList.add("active");
  activateReferenceLinks();
  initializeLightbox(); // Initialize lightbox after each page render
}

// Hash change handler
window.addEventListener("hashchange", function() {
  const hash = location.hash.replace("#", "");
  if (hash.startsWith('ref')) {
    const ref = document.getElementById(hash);
    if (ref) {
      openParentCardIfClosed(ref);
      ref.classList.add("ref-highlight");
      ref.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => ref.classList.remove("ref-highlight"), 5000);
    }
    return;
  }
  renderTask(getPage());
});

// Initial render
renderTask(getPage());

// Home logo -> home (anchor still works because id="home-link" used)
document.getElementById("home-link").onclick = function() { location.hash = "#home"; };

// Reference highlight handlers
function activateReferenceLinks() {
  document.querySelectorAll('.ref-link').forEach(link => {
    link.addEventListener('mouseenter', highlightReference);
    link.addEventListener('mouseleave', unhighlightReference);
    link.addEventListener('click', function(e) {
      const refId = (this.getAttribute('href') || '').replace('#', '');
      const ref = document.getElementById(refId);
      if (ref) {
        openParentCardIfClosed(ref);
        ref.classList.add('ref-highlight');
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => ref.classList.remove('ref-highlight'), 5000);
        e.preventDefault();
      }
    });
  });

  function highlightReference() {
    const refId = (this.getAttribute('href') || '').replace('#', '');
    const ref = document.getElementById(refId);
    if(ref) ref.classList.add('ref-highlight');
  }
  function unhighlightReference() {
    const refId = (this.getAttribute('href') || '').replace('#', '');
    const ref = document.getElementById(refId);
    if(ref) ref.classList.remove('ref-highlight');
  }
}

// Open parent card if closed
function openParentCardIfClosed(elementInside) {
  if(!elementInside) return;
  const parentCard = elementInside.closest('.task-card1');
  if(!parentCard) return;
  if(parentCard.classList.contains('collapsed')) {
    parentCard.classList.remove('collapsed');
    const btn = parentCard.querySelector('.collapse-btn');
    if(btn) btn.textContent = '−';
  }
}

// Toggle collapse
function toggleCard(header) {
  const card = header.closest ? header.closest('.task-card1') : (header.parentElement || null);
  if(!card) return;
  card.classList.toggle("collapsed");
  let headerEl = header;
  if(!headerEl.classList || !headerEl.classList.contains('card-header')) {
    headerEl = card.querySelector('.card-header') || headerEl;
  }
  const btn = headerEl ? headerEl.querySelector('.collapse-btn') : null;
  if(btn) {
    btn.textContent = card.classList.contains('collapsed') ? '+' : '−';
  }
}

// Show preview and navigate
function showPreview(taskName) {
  const fragmentId = "preview-" + taskName;
  const fragmentEl = document.getElementById(fragmentId);
  if(fragmentEl) {
    let htmlFrag = '';
    try {
      const temp = document.createElement('div');
      temp.innerHTML = tasks[taskName] || '';
      const h1 = temp.querySelector('h1');
      const p = temp.querySelector('p');
      htmlFrag = '';
      if(h1) htmlFrag += '<b>'+h1.textContent+'</b><br>';
      if(p) htmlFrag += p.textContent;
    } catch(e) {}
    fragmentEl.innerHTML = htmlFrag ? htmlFrag : 'Preview unavailable';
  }
  location.hash = '#' + taskName;
}

/* APPEND: Adjust floating logo so it doesn't overlap the footer */
(function() {
  const logo = document.querySelector('.floating-logo');
  const footer = document.querySelector('.gh-footer');
  if (!logo || !footer) return;
  const margin = 18; // default margin from bottom

  function updateLogoPosition() {
    const footerRect = footer.getBoundingClientRect();
    const overlap = Math.max(0, window.innerHeight - footerRect.top);
    if (overlap > 0) {
      logo.style.bottom = (overlap + margin) + 'px';
    } else {
      logo.style.bottom = margin + 'px';
    }
  }

  let rafId = null;
  function scheduleUpdate() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      updateLogoPosition();
      rafId = null;
    });
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate);

  scheduleUpdate();
})();

/* ========== THEME TOGGLE (Added) ========== */
// Initialize theme from localStorage or default to light
(function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', savedTheme);
})();

// Theme toggle button handler
document.addEventListener('DOMContentLoaded', function() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function() {
      const currentTheme = document.body.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }
});

/* ========== LIGHTBOX FUNCTIONALITY (Added for Gallery) ========== */
function initializeLightbox() {
  // Remove existing lightbox overlay if any
  const existingOverlay = document.getElementById('lightbox-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // Create lightbox overlay
  const overlay = document.createElement('div');
  overlay.id = 'lightbox-overlay';
  overlay.className = 'lb-overlay';
  overlay.innerHTML = `
    <div class="lb-content">
      <span class="lb-close" onclick="closeLightbox()">&times;</span>
      <img class="lb-img" src="" alt="">
      <div class="lb-caption"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Close lightbox when clicking outside the image
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      closeLightbox();
    }
  });

  // Close lightbox on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  });
}

function openLightbox(figureElement) {
  const img = figureElement.querySelector('img');
  if (!img) return;
  
  const overlay = document.getElementById('lightbox-overlay');
  const lbImg = overlay.querySelector('.lb-img');
  const lbCaption = overlay.querySelector('.lb-caption');
  
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lbCaption.textContent = img.getAttribute('data-caption') || img.alt;
  
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeLightbox() {
  const overlay = document.getElementById('lightbox-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable scrolling
  }
}

// Make functions globally accessible
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;