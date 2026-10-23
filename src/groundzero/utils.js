export function safeText(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return `[${v.map(safeText).join(', ')}]`;
  if (typeof v === 'object') {
    return Object.entries(v)
      .map(([k, val]) => `${k}: ${safeText(val)}`)
      .join(' | ');
  }
  return String(v);
}

export function toSlug(name = '') {
  return String(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function resolveClub(clubs = [], querySlugOrName = '') {
  if (!querySlugOrName) return clubs[0] || null;
  const q = toSlug(querySlugOrName);
  let hit = clubs.find(
    c => c.slug === q || (Array.isArray(c.aliases) && c.aliases.includes(q)) || toSlug(c.name) === q
  );
  if (hit) return hit;
  hit = clubs.find(c => toSlug(c.name).includes(q) || q.includes(c.slug));
  return hit || clubs[0] || null;
}

export function poissonOverProb(line, lambda) {
  if (lambda <= 0) return 0;
  const threshold = Math.floor(line) + 1;
  let cdf = 0;
  for (let k = 0; k < threshold; k++) {
    let logP = k * Math.log(lambda) - lambda;
    for (let i = 2; i <= k; i++) logP -= Math.log(i);
    cdf += Math.exp(logP);
  }
  return Math.max(0, Math.min(1, 1 - cdf));
}
