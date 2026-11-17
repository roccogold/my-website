// Latest Instagram post for @roccogold_, via the official Instagram API.
// Needs a long-lived access token in the Vercel env var INSTAGRAM_ACCESS_TOKEN
// (Instagram API with Instagram Login; professional/creator account). Without
// it, this returns 503 and the site shows a "follow" card instead.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return res.status(503).json({ error: 'Instagram is not configured' });

  try {
    const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count';
    const url = `https://graph.instagram.com/me/media?fields=${fields}&limit=1&access_token=${encodeURIComponent(token)}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Instagram responded ${r.status}`);
    const json = await r.json();
    const p = json.data && json.data[0];
    if (!p) throw new Error('No posts');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({
      permalink: p.permalink,
      image: p.media_type === 'VIDEO' ? p.thumbnail_url : p.media_url,
      caption: p.caption || '',
      timestamp: p.timestamp,
      likes: typeof p.like_count === 'number' ? p.like_count : null,
      comments: typeof p.comments_count === 'number' ? p.comments_count : null,
    });
  } catch (error) {
    console.error('Instagram error:', error);
    return res.status(502).json({ error: 'Failed to load Instagram' });
  }
}
