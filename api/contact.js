export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // For now, we'll just simulate success
    // You can implement actual email sending here using EmailJS server-side SDK
    // or a service like SendGrid, Nodemailer, etc.
    
    console.log('Contact form submission:', { name, email, message });
    
    res.status(200).json({ 
      success: true, 
      message: 'Message received successfully!' 
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}
