/** Deterministic organic island outline from a string seed. */
function rng(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function blobPath(seed: string, radius: number, points = 11, wobble = 0.22) {
  const rand = rng(seed);
  const pts = Array.from({ length: points }, (_, i) => {
    const a = (i / points) * Math.PI * 2;
    const r = radius * (1 - wobble / 2 + rand() * wobble);
    return [Math.cos(a) * r, Math.sin(a) * r * 0.82] as const;
  });
  const mid = (a: readonly number[], b: readonly number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = '';
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const n = pts[(i + 1) % pts.length];
    const m = mid(p, n);
    if (i === 0) {
      const start = mid(pts[pts.length - 1], p);
      d += `M${start[0].toFixed(1)},${start[1].toFixed(1)}`;
    }
    d += ` Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)}`;
  }
  return d + 'Z';
}
