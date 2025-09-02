// Simple time-based demo code generator (mock of TOTP)
// Produces a 6-digit code derived from a shared key and current 30s time step.
export function getDemoCode(secret: string): string {
  const step = Math.floor(Date.now() / 1000 / 30);
  // Simple hash: mix chars and step; not secure, just a demo
  let hash = 0;
  const input = `${secret}|${step}`;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  const code = (hash % 1_000_000).toString().padStart(6, '0');
  return code;
}
