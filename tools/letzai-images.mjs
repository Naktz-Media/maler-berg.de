// Generates the site's images with LetzAI, billed to the organisation in .env.
// Usage: node tools/letzai-images.mjs tools/images.json [name ...]
// Reads LETZAI_API_KEY, LETZAI_BASE_URL, LETZAI_ORGANIZATION_ID from .env.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
);
const base = env.LETZAI_BASE_URL || 'https://api.letz.ai';
const headers = { Authorization: `Bearer ${env.LETZAI_API_KEY}`, 'Content-Type': 'application/json' };

const [, , listFile, ...only] = process.argv;
const spec = JSON.parse(readFileSync(listFile, 'utf8'));
const outDir = join(dirname(listFile), '..', spec.outDir || 'assets/img');
mkdirSync(outDir, { recursive: true });

const jobs = spec.images.filter((i) => (only.length ? only.includes(i.name) : !existsSync(join(outDir, `${i.name}.jpg`))));
if (!jobs.length) { console.log('Nothing to generate.'); process.exit(0); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run(img) {
  const body = {
    prompt: `${img.prompt}. ${spec.style}`,
    width: img.width, height: img.height,
    baseModel: spec.baseModel, mode: spec.mode,
    hasWatermark: false, hideFromUserProfile: true,
    organizationId: env.LETZAI_ORGANIZATION_ID,
  };
  const res = await fetch(`${base}/images`, { method: 'POST', headers, body: JSON.stringify(body) });
  const job = await res.json();
  if (!res.ok) throw new Error(`${img.name}: ${res.status} ${JSON.stringify(job)}`);
  for (let i = 0; i < 200; i++) {
    await sleep(4000);
    const s = await (await fetch(`${base}/images/${job.id}`, { headers })).json();
    if (s.status === 'ready') {
      const url = s.imageVersions?.original || Object.values(s.imageVersions || {})[0];
      const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
      const ext = url.split('?')[0].split('.').pop().toLowerCase();
      writeFileSync(join(outDir, `${img.name}.${ext === 'png' ? 'png' : ext === 'webp' ? 'webp' : 'jpg'}`), buf);
      return `${img.name}: ok (${job.id})`;
    }
    if (['failed', 'interrupted', 'not_allowed'].includes(s.status)) throw new Error(`${img.name}: ${s.status} ${s.statusDetail || ''}`);
  }
  throw new Error(`${img.name}: timed out (${job.id})`);
}

// LetzAI rate-limits bursts, so run at most three jobs at a time.
const results = [];
for (let i = 0; i < jobs.length; i += 3) {
  results.push(...(await Promise.allSettled(jobs.slice(i, i + 3).map(run))));
}
for (const r of results) console.log(r.status === 'fulfilled' ? r.value : `FAILED ${r.reason.message}`);
