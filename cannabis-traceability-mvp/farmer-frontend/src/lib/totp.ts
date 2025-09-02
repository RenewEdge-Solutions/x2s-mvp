export function getDemoCodeForStep(secret: string, step: number): string {
  let hash = 0;
  const input = `${secret}|${step}`;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return (hash % 1_000_000).toString().padStart(6, '0');
}

export function getDemoCode(secret: string): string {
  const step = Math.floor(Date.now() / 1000 / 30);
  return getDemoCodeForStep(secret, step);
}
