/* ============================================================
   REZ Risk Radar — renderer
   index.html  -> shows latest digest + archive rail
   digest.html -> shows ?date=YYYY-MM-DD + archive rail
   Data is JSON only; this file owns all presentation.
   ============================================================ */

const SEV_ORDER = { act: 0, watch: 1, inform: 2 };
const SEV_LABEL = { act: "Act", watch: "Watch", inform: "Inform" };

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const fmtDate = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
};

async function getJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

function renderArchive(manifest, currentDate) {
  const el = document.getElementById("archive");
  if (!el) return;
  el.innerHTML = manifest.digests.map((d) => {
    const c = d.counts || {};
    const dots = ["act", "watch", "inform"]
      .filter((k) => c[k] > 0)
      .map((k) => `<span class="dot ${k}" title="${c[k]} ${k}"></span>`).join("");
    const cur = d.date === currentDate ? " current" : "";
    return `<li><a class="${cur.trim()}" href="digest.html?date=${esc(d.date)}">
      <span class="date">${esc(d.date)}</span><span class="dots">${dots}</span></a></li>`;
  }).join("");
}

function renderItem(it) {
  const sev = SEV_ORDER[it.severity] === undefined ? "inform" : it.severity;
  const rez = (it.rez_tags || []).map((t) => `<span class="rez-tag">${esc(t)}</span>`).join("");
  const pay = it.paywall ? `<span class="paywall" title="Read in full via your subscription">subscriber</span>` : "";
  const sowhat = it.so_what
    ? `<div class="sowhat"><b>So what</b>${esc(it.so_what)}</div>` : "";
  const link = it.url
    ? `<a href="${esc(it.url)}" target="_blank" rel="noopener">${esc(it.source || "Source")} ↗</a>`
    : `<span class="src">${esc(it.source || "Source")}</span>`;
  return `<article class="item ${sev}">
    <div class="item-top">
      <span class="sev ${sev}">${SEV_LABEL[sev]}</span>${rez}
    </div>
    <h3>${esc(it.headline)}</h3>
    ${it.summary ? `<p>${esc(it.summary)}</p>` : ""}
    ${sowhat}
    <div class="item-meta">${link}${pay}
      ${it.published ? `<span>· ${esc(it.published)}</span>` : ""}</div>
  </article>`;
}

function renderDigest(digest) {
  // header
  document.getElementById("digest-date").textContent = fmtDate(digest.date);
  document.getElementById("posture").textContent = digest.posture || digest.summary || "";
  const c = digest.counts || {};
  document.getElementById("counts").innerHTML = ["act", "watch", "inform"]
    .map((k) => `<span class="count ${k}"><b>${c[k] ?? 0}</b> ${k}</span>`).join("");

  // body — group already in JSON sections; sort items by severity within each
  const body = document.getElementById("body");
  const sections = (digest.sections || []).filter((s) => (s.items || []).length);
  if (!sections.length) {
    body.innerHTML = `<div class="empty">No relevant signals in the last 24 hours. Coverage ran clean.</div>`;
    return;
  }
  body.innerHTML = sections.map((s) => {
    const items = [...s.items].sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]);
    return `<section class="section">
      <h2>${esc(s.category)} <span class="tally">${items.length}</span></h2>
      ${items.map(renderItem).join("")}
    </section>`;
  }).join("");
}

async function init() {
  const params = new URLSearchParams(location.search);
  try {
    const manifest = await getJSON("data/manifest.json");
    if (!manifest.digests || !manifest.digests.length) {
      document.getElementById("body").innerHTML = `<div class="empty">No digests published yet.</div>`;
      return;
    }
    // brand text from manifest
    if (manifest.site) {
      if (manifest.site.title)   document.getElementById("brand-title").textContent = manifest.site.title;
      if (manifest.site.tagline) document.getElementById("tagline").textContent = manifest.site.tagline;
    }
    const date = params.get("date") || manifest.digests[0].date;
    const entry = manifest.digests.find((d) => d.date === date) || manifest.digests[0];
    const digest = await getJSON(entry.file);
    renderArchive(manifest, digest.date);
    renderDigest(digest);
  } catch (err) {
    document.getElementById("body").innerHTML =
      `<div class="error">Couldn't load the digest (${esc(err.message)}). If you're previewing locally, serve the folder over http (e.g. <code>python3 -m http.server</code>) — file:// blocks fetch.</div>`;
  }
}

document.addEventListener("DOMContentLoaded", init);
