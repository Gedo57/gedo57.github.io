// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Projects (index) - data-driven from /data/projects.json =====
async function loadProjects(){
  const res = await fetch("data/projects.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load projects.json");
  const data = await res.json();
  return data.projects || [];
}

function slugToPage(slug){
  return `project.html?slug=${encodeURIComponent(slug)}`;
}

function createProjectCard(p){
  const a = document.createElement("a");
  a.className = "card card-link";
  a.href = `projects/${slugToPage(p.slug)}`;

  const top = document.createElement("div");
  top.className = "card-top";

  const h3 = document.createElement("h3");
  h3.textContent = p.name || p.slug;

  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = p.tag || "";

  top.appendChild(h3);
  if (tag.textContent) top.appendChild(tag);

  const desc = document.createElement("p");
  // prefer a shorter line for the card (fallback to overview)
  desc.textContent = (p.cardDescription || p.overview || "").trim();

  const links = document.createElement("div");
  links.className = "links";
  const hint = document.createElement("span");
  hint.className = "fake-link";
  hint.textContent = "Open case study →";
  links.appendChild(hint);

  a.appendChild(top);
  if (desc.textContent) a.appendChild(desc);
  a.appendChild(links);

  // small badge for team projects
  if (p.team){
    a.setAttribute("data-team", "true");
  }

  return a;
}

async function renderProjectsGrid(){
  const grid = document.querySelector("[data-projects-grid]");
  if (!grid) return;

  try{
    const projects = await loadProjects();
    grid.innerHTML = "";
    projects.forEach(p => grid.appendChild(createProjectCard(p)));
  }catch(err){
    console.error(err);
    grid.innerHTML = "<p class='section-hint'>Could not load projects data.</p>";
  }
}

renderProjectsGrid();
