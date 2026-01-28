export function getRoute() {
  const p = new URLSearchParams(location.search);
  return {
    manufacturer: p.get("manufacturer") || "",
    q: p.get("q") || "",
    page: Number(p.get("page") || 1),
  };
}

export function setRoute(state) {
  const p = new URLSearchParams();
  if (state.manufacturer) p.set("manufacturer", state.manufacturer);
  if (state.q) p.set("q", state.q);
  p.set("page", state.page);
  history.pushState({}, "", "?" + p.toString());
}
