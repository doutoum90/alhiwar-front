import type { Paged } from "../types";

export const buildPageItems = (page: number, pages: number) => {
  const items: Array<number | "..."> = [];
  if (pages <= 9) {
    for (let p = 1; p <= pages; p += 1) items.push(p);
    return items;
  }
  const add = (p: number | "...") => {
    if (items.length === 0 || items[items.length - 1] !== p) items.push(p);
  };

  add(1);
  const left = Math.max(2, page - 2);
  const right = Math.min(pages - 1, page + 2);

  if (left > 2) add("...");
  for (let p = left; p <= right; p += 1) add(p);
  if (right < pages - 1) add("...");
  add(pages);

  return items;
};

export const normalizePaged = <T,>(res: any, page: number, limit: number): Paged<T> => {
  if (Array.isArray(res)) {
    const total = res.length;
    return { items: res as T[], total, page: 1, limit: total || limit, pages: 1 };
  }
  const items = Array.isArray(res?.items) ? (res.items as T[]) : [];
  const total = Number(res?.total ?? items.length ?? 0);
  const p = Number(res?.page ?? page);
  const l = Number(res?.limit ?? limit);
  const pages = Number(res?.pages ?? Math.max(1, Math.ceil(total / l || 1)));
  return { items, total, page: p, limit: l, pages };
};
