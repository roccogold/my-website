export default async function handler(req, res) {
  // Enable CORS for your domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}`);
    
    if (!response.ok) {
      throw new Error('NASA API request failed');
    }
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('NASA API error:', error);
    res.status(500).json({ error: 'Failed to fetch NASA data' });
  }
}
