// SPA logic for 4 tasks + Home + reference highlight

const tasks = {
  "home": "",
  "task1": "",
  "task2": "",
  "task3": "",
  "task4": ""
};

// Підтягуємо всі HTML сторінки
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
  if(page==="home") document.getElementById("navHome").classList.add("active");
  if(page==="task1") document.getElementById("nav1").classList.add("active");
  if(page==="task2") document.getElementById("nav2").classList.add("active");
  if(page==="task3") document.getElementById("nav3").classList.add("active");
  if(page==="task4") document.getElementById("nav4").classList.add("active");
  activateReferenceLinks();
}

// SPA: при зміні хешу
window.addEventListener("hashchange", function() {
  const hash = location.hash.replace("#", "");
  if (hash.startsWith('ref')) {
    const ref = document.getElementById(hash);
    if (ref) {
      ref.classList.add("ref-highlight");
      ref.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => ref.classList.remove("ref-highlight"), 150000);
    }
    return;
  }
  renderTask(getPage());
});
// Initial load
renderTask(getPage());
// Home по кліку лого
document.getElementById("home-link").onclick = function() { location.hash = "#home"; };

// Reference highlight
function activateReferenceLinks() {
  document.querySelectorAll('.ref-link').forEach(link => {
    link.addEventListener('mouseenter', highlightReference);
    link.addEventListener('mouseleave', unhighlightReference);
    link.addEventListener('click', function(e) {
      const refId = (this.getAttribute('href') || '').replace('#', '');
      const ref = document.getElementById(refId);
      if (ref) {
        ref.classList.add('ref-highlight');
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => ref.classList.remove('ref-highlight'), 2000);
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
function toggleCard(header) {
  const card = header.parentElement;
  card.classList.toggle("collapsed");
  // міняй текст/іконку кнопки (− ↔ +)
  const btn = header.querySelector('.collapse-btn');
  if(card.classList.contains('collapsed')) btn.textContent = '+';
  else btn.textContent = '−';
}

function showPreview(taskName) {
  // Вставляє «preview» з TaskX.html у Home
  const fragmentId = "preview-" + taskName;
  const fragmentEl = document.getElementById(fragmentId);
  if(!fragmentEl) return;

  // Витягуємо перший абзац/заголовок з tasks[taskName]
  let htmlFrag = '';
  try {
    const temp = document.createElement('div');
    temp.innerHTML = tasks[taskName] || '';
    // Витягнути перший абзац і заголовок (або кастомізуй тут!)
    const h1 = temp.querySelector('h1');
    const p = temp.querySelector('p');
    htmlFrag = '';
    if(h1) htmlFrag += '<b>'+h1.textContent+'</b><br>';
    if(p) htmlFrag += p.textContent;
  } catch(e) {}
  fragmentEl.innerHTML = htmlFrag ? htmlFrag : 'Preview unavailable';

  // SPA: перейди на taskX
  location.hash = '#' + taskName;
}