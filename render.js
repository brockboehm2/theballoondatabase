// js/render.js

export function renderManufacturers(el, list, active) {
  // KEEP: Manufacturer + All buttons
  el.innerHTML = "";
  el.appendChild(makeLink("All", "", active === ""));
  list.forEach((m) => el.appendChild(makeLink(m, m, m === active)));
}

function makeLink(label, value, isActive) {
  const a = document.createElement("a");
  a.href = "#";
  a.textContent = label;
  a.dataset.manufacturer = value;
  if (isActive) a.classList.add("active");
  return a;
}

export function renderCards(el, balloons) {
  el.innerHTML = balloons.map(cardHtml).join("");
}

function cardHtml(b) {
  const name = b.Name ? `<em>${esc(b.Name)}</em>` : "";
  const reg = esc(b.Registration || "");
  const manufacturer = esc(b.Manufacturer || "");
  const model = esc(b.Model || "");
  const size = esc(b.Size || "");
  const owner = esc(b.PilotOwner || "");
  const location = esc(b.Location || "");
  const year = esc(b.YearBuilt || "");
  const sn = esc(b.SerialNumber || "");
  const status = esc(b.Status || "");
  const prev = esc(b.PreviousOwners || "N/A");
  const img = (b.Image || "").trim();

  // Title: italicized Name (Registration)
  const titleLine = reg ? `${name} (${reg})` : name;

  // Subtitle: Manufacturer Model • Size
  const makeModel = [manufacturer, model].filter(Boolean).join(" ");
  const subLine = [makeModel, size].filter(Boolean).join(" • ");

  return `
    <article class="card">
      ${
        img
          ? `<img loading="lazy" src="${escAttr(img)}" alt="${escAttr(
              b.Name || "Balloon"
            )}" />`
          : `<div class="img-placeholder" aria-label="No image"></div>`
      }

      <div class="card-body">
        <div class="card-title">${titleLine}</div>
        <div class="card-subtitle">${subLine}</div>

        <div class="card-details">
          ${row("Pilot/Owner", owner)}
          ${row("Location", location)}
          ${row("Year Built", year)}
          ${row("S/N", sn)}
          ${row("Status", status)}
          ${row("Previous Owner(s)", prev)}
        </div>
      </div>
    </article>
  `;
}

function row(label, value) {
  const v = value && value.trim() ? value : "N/A";
  return `<div><strong>${label}:</strong> ${v}</div>`;
}

export function renderPagination(el, page, total) {
  el.innerHTML = `
    <button data-page="${page - 1}" ${page === 1 ? "disabled" : ""}>Prev</button>
    <span>Page ${page} / ${total}</span>
    <button data-page="${page + 1}" ${page === total ? "disabled" : ""}>Next</button>
  `;
}

export function renderMeta(el, total, shown) {
  el.textContent =
    shown === total ? `${total} balloons` : `${shown} of ${total} balloons`;
}

function esc(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escAttr(str = "") {
  return esc(str);
}
