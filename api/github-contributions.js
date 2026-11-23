// Public GitHub contribution calendar for the site's owner, parsed from the
// profile's contributions page (no token needed). Cached at the edge.
const USER = 'roccogold';

export function parseContributions(html) {
  const days = [];
  const counts = {};
  // tooltips carry the count: <tool-tip for="contribution-day-component-0-0">3 contributions on …</tool-tip>
  for (const m of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = /^(\d+)\s+contribution/.exec(m[2].trim());
    counts[m[1]] = n ? Number(n[1]) : 0;
  }
  for (const m of html.matchAll(/<td\b([^>]*\bdata-date="(\d{4}-\d{2}-\d{2})"[^>]*)>/g)) {
    const attrs = m[1];
    const id = /\bid="([^"]+)"/.exec(attrs)?.[1];
    const level = Number(/\bdata-level="(\d)"/.exec(attrs)?.[1] || 0);
    days.push({ date: m[2], level, count: id && id in counts ? counts[id] : null });
  }
  days.sort((a, b) => a.date.localeCompare(b.date));
  const totalMatch = /([\d,]+)\s+contributions?\s+in the last year/.exec(html);
  const total = totalMatch
    ? Number(totalMatch[1].replace(/,/g, ''))
    : days.reduce((sum, d) => sum + (d.count || 0), 0);
  return { user: USER, total, days };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const r = await fetch(`https://github.com/users/${USER}/contributions`, {
      headers: { 'User-Agent': 'portfolio-site', Accept: 'text/html' },
    });
    if (!r.ok) throw new Error(`GitHub responded ${r.status}`);
    const data = parseContributions(await r.text());
    if (!data.days.length) throw new Error('No contribution days found');
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).json(data);
  } catch (error) {
    console.error('GitHub contributions error:', error);
    return res.status(502).json({ error: 'Failed to load contributions' });
  }
}
