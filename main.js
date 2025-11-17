const tasks = {
  "home": "",
  "task1": "",
  "task2": "",
  "task3": "",
  "task4": "",
  "404": `
    <div class="task-card" style="text-align: center;">
      <h1>404: Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <a href="#home" class="pdf-button" style="background-color: var(--link-color);">Return to Home</a>
    </div>
  `
};

// Load all pages
Promise.all([
  fetch("Home.html").then(r => r.text()).then(html => { tasks.home = html; }),
  fetch("Task1.html").then(r => r.text()).then(html => { tasks.task1 = html; }),
  fetch("Task2.html").then(r => r.text()).then(html => { tasks.task2 = html; }),
  fetch("Task3.html").then(r => r.text()).then(html => { tasks.task3 = html; }),
  fetch("Task4.html").then(r => r.text()).then(html => { tasks.task4 = html; })
]).then(() => {
  renderTask(getPage()); // Initial render after all content is fetched
});


function getPage() {
  const hash = location.hash.replace("#", "");
  return (!hash || hash === "home") ? "home" : hash;
}

function renderTask(page) {
    const app = document.getElementById("app");
    const loader = document.getElementById("loader");

    // Show loader, hide content
    if(loader) loader.style.display = "block";
    if(app) app.style.display = "none";
    
    // Simulate a short delay for smooth transition, then render content
    setTimeout(() => {
        // Use the 404 page if the requested page doesn't exist in our tasks object
        const pageContent = tasks.hasOwnProperty(page) ? tasks[page] : tasks["404"];
        app.innerHTML = pageContent;

        // Hide loader, show content
        if(loader) loader.style.display = "none";
        if(app) app.style.display = "block";

        // Update nav active state
        ["navHome","nav1","nav2","nav3","nav4"].forEach(id => {
            const el = document.getElementById(id); if(el) el.classList.remove("active");
        });

        const activeNavId = tasks.hasOwnProperty(page) ? `nav${page.replace('task', '')}` : '';
        if (page === 'home') document.getElementById("navHome")?.classList.add("active");
        if (activeNavId && document.getElementById(activeNavId)) {
            document.getElementById(activeNavId).classList.add("active");
        }

        // Re-initialize dynamic components
        activateReferenceLinks();
        initLightbox();
        window.scrollTo(0, 0); // Scroll to top on page change
    }, 150); // 150ms delay
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

/* Lightbox for Galleries with Navigation */
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

    const galleries = document.querySelectorAll('.screenshot-gallery, .refworks-gallery');

    galleries.forEach(gallery => {
        const links = Array.from(gallery.querySelectorAll('a'));
        
        links.forEach((link, index) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                currentGalleryLinks = links;
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

    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);
    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
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

/* Scroll to Top Button Logic */
(function() {
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (!scrollToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    }, { passive: true });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
})();