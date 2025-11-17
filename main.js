// SPA logic for 4 tasks + Home + reference highlight (final)

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
  initLightbox(); // Initialize lightbox for any new content
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

// Home logo -> home
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
  const card = header.closest('.task-card1');
  if(!card) return;
  card.classList.toggle("collapsed");
  const btn = card.querySelector('.collapse-btn');
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

/* APPEND: Adjust floating logo */
(function() {
  const logo = document.querySelector('.floating-logo');
  const footer = document.querySelector('.gh-footer');
  if (!logo || !footer) return;
  const margin = 18;

  function updateLogoPosition() {
    const footerRect = footer.getBoundingClientRect();
    const overlap = Math.max(0, window.innerHeight - footerRect.top);
    logo.style.bottom = (overlap > 0) ? `${overlap + margin}px` : `${margin}px`;
  }

  window.addEventListener('scroll', updateLogoPosition, { passive: true });
  window.addEventListener('resize', updateLogoPosition);
  window.addEventListener('load', () => setTimeout(updateLogoPosition, 100));
})();


/* Light/Dark Theme Toggle */
(function() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark');
    }
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark');
        localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
    });
})();

/* NEW / REWRITTEN: Lightbox for Galleries with Navigation */
function initLightbox() {
    const overlay = document.getElementById('lightbox-overlay');
    if (!overlay) return;

    const imgEl = document.getElementById('lightbox-img');
    const captionEl = document.getElementById('lightbox-caption');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    
    let currentGalleryLinks = [];
    let currentIndex = 0;

    // Find all distinct galleries on the page
    const galleries = document.querySelectorAll('.screenshot-gallery, .refworks-gallery');

    galleries.forEach(gallery => {
        const links = Array.from(gallery.querySelectorAll('a'));
        
        links.forEach((link, index) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                currentGalleryLinks = links; // Set the context to the current gallery
                openLightbox(index);
            });
        });
    });

    function openLightbox(index) {
        currentIndex = index;
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        updateImage();
    }

    function updateImage() {
        const link = currentGalleryLinks[currentIndex];
        const imgSrc = link.href;
        const captionText = link.dataset.caption || link.closest('figure')?.querySelector('figcaption')?.textContent || '';
        
        imgEl.src = imgSrc;
        captionEl.textContent = captionText;

        // Update button states
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === currentGalleryLinks.length - 1;
    }

    function showPrev() {
        if (currentIndex > 0) {
            currentIndex--;
            updateImage();
        }
    }

    function showNext() {
        if (currentIndex < currentGalleryLinks.length - 1) {
            currentIndex++;
            updateImage();
        }
    }

    function closeLightbox() {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Event Listeners
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);
    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) { // Click on the background to close
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (overlay.style.display !== 'flex') return;
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'Escape') closeLightbox();
    });
}