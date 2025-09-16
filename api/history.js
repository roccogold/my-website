export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    // Try the dayinhistory.dev API first
    let response = await fetch('https://dayinhistory.dev/api/v1/today');
    
    if (!response.ok) {
      // Fallback to another history API if needed
      response = await fetch(`https://history.muffinlabs.com/date/${month}/${day}`);
      const data = await response.json();
      
      // Transform the data format to match what your frontend expects
      const transformedData = {
        events: data.data.Events.slice(0, 5).map(event => ({
          year: event.year,
          description: event.text
        }))
      };
      
      return res.status(200).json(transformedData);
    }
    
    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    console.error('History API error:', error);
    res.status(500).json({ error: 'Failed to fetch history data' });
  }
}
