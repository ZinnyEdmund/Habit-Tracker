export function generateUUID(): string {
  // Prefer crypto.randomUUID when available
  if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
    return (crypto as any).randomUUID();
  }

  // Fallback to RFC4122 version 4 UUID using crypto.getRandomValues when available
  if (typeof crypto !== 'undefined' && typeof (crypto as any).getRandomValues === 'function') {
    const buf = new Uint8Array(16);
    (crypto as any).getRandomValues(buf);

    // Adapted from https://stackoverflow.com/a/2117523/315168
    buf[6] = (buf[6] & 0x0f) | 0x40; // version 4
    buf[8] = (buf[8] & 0x3f) | 0x80; // variant

    const hex: string[] = [];
    for (let i = 0; i < buf.length; ++i) {
      hex.push((buf[i] + 0x100).toString(16).substr(1));
    }

    return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
  }

  // Last-resort fallback using Math.random (not cryptographically strong)
  function rnd() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return `${rnd()}${rnd()}-${rnd()}-${rnd()}-${rnd()}-${rnd()}${rnd()}${rnd()}`;
}
