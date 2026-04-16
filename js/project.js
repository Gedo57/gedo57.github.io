// ===== Project page renderer + upgraded gallery (carousel + lightbox) =====

async function loadProjects(){
  const res = await fetch("../data/projects.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load projects.json");
  const data = await res.json();
  return data.projects || [];
}

function el(sel){ return document.querySelector(sel); }
function els(sel){ return Array.from(document.querySelectorAll(sel)); }

function setText(selector, value){
  const node = el(selector);
  if (!node) return;
  node.textContent = value ?? "";
}

function clear(node){
  if (node) node.innerHTML = "";
}

function addPill(container, text){
  const span = document.createElement("span");
  span.className = "pill";
  span.textContent = text;
  container.appendChild(span);
}

function renderLinks(container, links){
  clear(container);
  if (!Array.isArray(links) || links.length === 0){
    container.style.display = "none";
    return;
  }
  container.style.display = "flex";
  container.style.gap = "10px";
  container.style.flexWrap = "wrap";

  links.forEach((l, i) => {
    const a = document.createElement("a");
    a.className = i === 0 ? "btn primary" : "btn outline";
    a.href = l.url || "#";
    if ((l.url || "").startsWith("http")) {
      a.target = "_blank";
      a.rel = "noreferrer";
    }
    a.textContent = l.label || "Link";
    container.appendChild(a);
  });
}

function renderList(container, items, kind){
  clear(container);
  if (!Array.isArray(items) || items.length === 0){
    container.closest("[data-sec]")?.style.setProperty("display","none");
    return;
  }
  container.closest("[data-sec]")?.style.removeProperty("display");

  items.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    container.appendChild(li);
  });

  if (kind === "chips"){
    // container already .chips; li will inherit chip styles
  }
}

function renderTimeline(container, timeline){
  clear(container);
  if (!Array.isArray(timeline) || timeline.length === 0){
    container.closest("[data-sec]")?.style.setProperty("display","none");
    return;
  }
  container.closest("[data-sec]")?.style.removeProperty("display");

  timeline.forEach(item => {
    const wrap = document.createElement("div");
    wrap.className = "titem";

    const label = document.createElement("p");
    label.className = "tlabel";
    label.textContent = item.label || "Milestone";

    const detail = document.createElement("p");
    detail.className = "tdetail";
    detail.textContent = item.detail || "";

    wrap.appendChild(label);
    wrap.appendChild(detail);
    container.appendChild(wrap);
  });
}

// ===== Gallery (carousel + thumbs) + Lightbox =====
function initGallery(images){
  const gallery = el("[data-gallery]");
  if (!gallery) return;

  const sec = gallery.closest("[data-sec='gallery']");
  const hint = el("[data-p-gallery-hint]");

  if (!Array.isArray(images) || images.length === 0){
    if (hint) hint.textContent = "Add images for this project in its assets folder, then list them in data/projects.json.";
    sec && (sec.style.display = "");
    gallery.style.display = "none";
    return;
  }

  if (hint) hint.textContent = "Click the main image to zoom. Use arrows to navigate.";
  gallery.style.display = "";

  const mainImg = el("[data-g-main]");
  const thumbs = el("[data-g-thumbs]");
  const prevBtn = el("[data-g-prev]");
  const nextBtn = el("[data-g-next]");

  let idx = 0;

  function setActive(i){
    idx = (i + images.length) % images.length;
    const img = images[idx];
    if (mainImg){
      mainImg.src = "../" + img.src;
      mainImg.alt = img.alt || "Project screenshot";
    }
    els(".thumb").forEach((t, j) => t.classList.toggle("active", j === idx));
  }

  // build thumbs
  clear(thumbs);
  images.forEach((img, i) => {
    const t = document.createElement("img");
    t.className = "thumb" + (i === 0 ? " active" : "");
    t.src = "../" + img.src;
    t.alt = img.alt || `Thumbnail ${i+1}`;
    t.loading = "lazy";
    t.addEventListener("click", () => setActive(i));
    thumbs.appendChild(t);
  });

  prevBtn?.addEventListener("click", () => setActive(idx - 1));
  nextBtn?.addEventListener("click", () => setActive(idx + 1));

  // lightbox
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbClose = document.getElementById("lbClose");

  function openLB(){
    if (!lb || !lbImg || !mainImg) return;
    lbImg.src = mainImg.src;
    lbImg.alt = mainImg.alt || "Preview";
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
  }

  function closeLB(){
    if (!lb || !lbImg) return;
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    lbImg.src = "";
  }

  mainImg?.addEventListener("click", openLB);
  lbClose?.addEventListener("click", closeLB);
  lb?.addEventListener("click", (e) => { if (e.target === lb) closeLB(); });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowLeft") setActive(idx - 1);
    if (e.key === "ArrowRight") setActive(idx + 1);
  });

  setActive(0);
}

// ===== Boot =====
(async function init(){
  let slug = window.__PROJECT_SLUG__ || document.body?.dataset?.project;
  if (!slug){
    const sp = new URLSearchParams(window.location.search);
    slug = sp.get("slug") || "";
  }
  slug = (slug || "").trim();
  if (!slug) return;

  // apply per-project theming via body class
  if (document.body){
    document.body.dataset.project = slug;
    document.body.classList.add(`project-${slug}`);
  }

  try{
    const projects = await loadProjects();
    const p = projects.find(x => x.slug === slug);
    if (!p) throw new Error("Project not found: " + slug);

    setText("[data-p-name]", p.name);
    setText("[data-p-subtitle]", p.subtitle);
    // document meta
    if (p.name) document.title = `${p.name} | Case Study`;
    const metaDesc = document.querySelector("meta[name='description']");
    if (metaDesc) metaDesc.setAttribute("content", `${p.name} case study — ${p.subtitle || ""}`.trim());

    // meta pills
    const meta = el("[data-p-meta]");
    clear(meta);
    if (meta){
      if (p.status) addPill(meta, `Status: ${p.status}`);
      if (p.role) addPill(meta, `Role: ${p.role}`);
      if (p.team) addPill(meta, "Team Project");
    }

    // role box
    setText("[data-p-role]", p.role || "");

    const teamRow = el("[data-p-team]");
    clear(teamRow);
    if (teamRow && p.team){
      addPill(teamRow, "Team Project");
    }

    // overview
    const overviewEl = el("[data-p-overview]");
    if (overviewEl){
      overviewEl.textContent = p.overview || "";
      if (!p.overview) overviewEl.closest("[data-sec='overview']")?.style.setProperty("display","none");
    }

    // lists
    renderList(el("[data-p-resp]"), p.responsibilities, "bullets");
    renderList(el("[data-p-tools]"), (p.tools || []).map(t=>t), "chips");
    renderList(el("[data-p-challenges]"), p.challenges, "bullets");
    renderList(el("[data-p-solutions]"), p.solutions, "bullets");
    renderList(el("[data-p-results]"), p.results, "bullets");

    renderTimeline(el("[data-p-timeline]"), p.timeline);

    // links
    renderLinks(el("[data-p-links]"), p.links);

    // gallery
    initGallery(p.gallery?.images || []);
  }catch(err){
    console.error(err);
  }
})();
