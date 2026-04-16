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

function toCssAssetUrl(path){
  if (!path) return "";
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
  if (path.startsWith("../")) return path;
  return `../${path.replace(/^\.\//, "")}`;
}


function createProjectCard(p){
  const a = document.createElement("a");
  a.className = "card card-link flip-card";
  a.href = `projects/${slugToPage(p.slug)}`;
  a.setAttribute("aria-label", `Open ${p.name || p.slug} case study`);

  const inner = document.createElement("div");
  inner.className = "flip-card-inner";

  const front = document.createElement("div");
  front.className = "flip-face flip-front";
  if (p.thumbnail) {
    front.style.setProperty("--card-front-image", `url("${toCssAssetUrl(p.thumbnail)}")`);
  }

  const frontShade = document.createElement("div");
  frontShade.className = "flip-front-shade";

  const frontLabel = document.createElement("div");
  frontLabel.className = "flip-front-label";

  const frontTitle = document.createElement("h3");
  frontTitle.textContent = p.name || p.slug;

  const frontTag = document.createElement("span");
  frontTag.className = "tag";
  frontTag.textContent = p.tag || "";

  frontLabel.appendChild(frontTitle);
  if (frontTag.textContent) frontLabel.appendChild(frontTag);
  front.appendChild(frontShade);
  front.appendChild(frontLabel);

  const back = document.createElement("div");
  back.className = "flip-face flip-back";
  if (p.cardBackground) {
    back.style.setProperty("--card-back-image", `url("${toCssAssetUrl(p.cardBackground)}")`);
  }

  const backOverlay = document.createElement("div");
  backOverlay.className = "flip-back-overlay";

  const backContent = document.createElement("div");
  backContent.className = "flip-back-content";

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
  desc.textContent = (p.cardDescription || p.overview || "").trim();

  const links = document.createElement("div");
  links.className = "links";

  const hint = document.createElement("span");
  hint.className = "fake-link";
  hint.textContent = "Open case study →";
  links.appendChild(hint);

  backContent.appendChild(top);
  if (desc.textContent) backContent.appendChild(desc);
  backContent.appendChild(links);

  back.appendChild(backOverlay);
  back.appendChild(backContent);

  inner.appendChild(front);
  inner.appendChild(back);
  a.appendChild(inner);

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
