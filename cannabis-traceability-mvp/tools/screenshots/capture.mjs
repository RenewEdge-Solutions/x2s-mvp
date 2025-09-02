import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:9001'; // default regulator
const OUTDIR = path.resolve(process.cwd(), '../../screenshots');

const pages = [
  { name: 'welcome', url: 'http://localhost:9000' },
  { name: 'regulator-dashboard', url: 'http://localhost:9001' },
  { name: 'regulator-calendar', url: 'http://localhost:9001/calendar' },
  { name: 'auditor-dashboard', url: 'http://localhost:9002' },
  { name: 'farmer-production', url: 'http://localhost:9003' },
  { name: 'retail-pos', url: 'http://localhost:9004' },
  { name: 'laboratory-dashboard', url: 'http://localhost:9005' },
  { name: 'laboratory-testing', url: 'http://localhost:9005/testing' },
  { name: 'laboratory-calendar', url: 'http://localhost:9005/calendar' },
  { name: 'laboratory-reports', url: 'http://localhost:9005/reports' },
];

async function ensureDir(p) {
  try { await fs.mkdir(p, { recursive: true }); } catch {}
}

async function run() {
  await ensureDir(OUTDIR);
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Seed localStorage to bypass login/2FA per app
  async function seedAuthFor(url) {
    const roleByPort = {
      9001: { role: 'Regulator', username: 'Regulator' },
      9002: { role: 'Auditor', username: 'Auditor' },
      9003: { role: 'Grower', username: 'Farmer' },
      9004: { role: 'Shop', username: 'Retail' },
      9005: { role: 'Lab', username: 'Laboratory' },
    };
    const m = url.match(/:(\d{4,5})/);
    const port = m ? Number(m[1]) : null;
    if (!port || !roleByPort[port]) return;
    const profile = roleByPort[port];
    await page.addInitScript((user) => {
      try {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('activeModule', 'cannabis');
      } catch {}
    }, {
      id: 'demo-user',
      username: profile.username,
      role: profile.role,
      firstName: profile.role,
      lastName: 'User',
      phone: '+1 (555) 010-0001',
      email: `${profile.username.toLowerCase()}@demo.local`,
      address: '123 Demo Street, Castries',
      modules: ['cannabis'],
    });
  }

  for (const p of pages) {
    await seedAuthFor(p.url);
    await page.goto(p.url, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(OUTDIR, `${p.name}.png`) });
    console.log('Captured', p.name);
  }

  await browser.close();
}

run().catch((e) => { console.error(e); process.exit(1); });
