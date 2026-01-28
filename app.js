// js/app.js

import { loadBalloons } from "./data.js";
import { getRoute, setRoute } from "./router.js";
import { debounce, paginate } from "./utils.js";
import {
  renderCards,
  renderManufacturers,
  renderPagination,
  renderMeta
} from "./render.js";

const PAGE_SIZE = 24;

const els = {
  search: document.getElementById("searchInput"),
  nav: document.getElementById("manufacturerNav"),
  grid: document.getElementById("cardsGrid"),
  pagination: document.getElementById("pagination"),
  meta: document.getElementById("resultsMeta"),
};

let balloons = [];
let manufacturers = [];

init();

async function init() {
  balloons = await loadBalloons();

  // ✅ Sort by Registration (alphabetical), blanks go last
  balloons.sort((a, b) => {
    const aHas = !!(a.Registration || "").trim();
    const bHas = !!(b.Registration || "").trim();
    if (!aHas && bHas) return 1;
    if (aHas && !bHas) return -1;

    return (a.Registration || "").localeCompare(b.Registration || "", undefined, {
      sensitivity: "base",
      numeric: true
    });
  });

  manufacturers = [...new Set(balloons.map((b) => b.Manufacturer).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b)
  );

  // Manufacturer nav click
  els.nav.onclick = (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    e.preventDefault();
    setRoute({ ...getRoute(), manufacturer: a.dataset.manufacturer, page: 1 });
    render();
  };

  // Pagination click
  els.pagination.onclick = (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    setRoute({ ...getRoute(), page: Number(btn.dataset.page) });
    render();
  };

  // Search input
  els.search.oninput = debounce(() => {
    setRoute({ ...getRoute(), q: els.search.value.trim(), page: 1 });
    render();
  }, 250);

  // Back/forward support
  window.onpopstate = render;

  render();
}

function render() {
  const route = getRoute();

  // Keep the input synced with URL
  if (els.search.value !== route.q) els.search.value = route.q;

  const q = (route.q || "").toLowerCase();

  let filtered = balloons.filter((b) => {
    // Manufacturer filter
    if (route.manufacturer && b.Manufacturer !== route.manufacturer) return false;

    // Search filter
    if (!q) return true;

    const haystack = [
      b.Name,
      b.Registration,
      b.Manufacturer,
      b.Model,
      b.SerialNumber,
      b.YearBuilt,
      b.Size,
      b.PilotOwner,
      b.Location,
      b.Status,
      b.PreviousOwners
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });

  const pageInfo = paginate(filtered, route.page, PAGE_SIZE);

  renderManufacturers(els.nav, manufacturers, route.manufacturer);
  renderMeta(els.meta, balloons.length, filtered.length);
  renderCards(els.grid, pageInfo.slice);
  renderPagination(els.pagination, pageInfo.page, pageInfo.totalPages);

  // If URL page was out of range, correct it
  if (pageInfo.page !== route.page) {
    setRoute({ ...route, page: pageInfo.page });
  }
}
