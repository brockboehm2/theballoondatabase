export function debounce(fn, ms = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function paginate(items, page, size) {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const safePage = Math.min(totalPages, Math.max(1, page));
  const start = (safePage - 1) * size;

  return {
    page: safePage,
    totalPages,
    slice: items.slice(start, start + size),
  };
}
