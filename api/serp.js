export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.REACT_APP_SERPAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'SerpApi key not configured' });
  }

  // Forward all query params to SerpApi, injecting the API key server-side
  const params = new URLSearchParams({ ...req.query, api_key: apiKey });
  const url = `https://serpapi.com/search.json?${params}`;

  try {
    const upstream = await fetch(url);
    const data = await upstream.json();
    // Surface SerpApi errors so the client can see them
    if (data.error) {
      return res.status(200).json({ _serpError: data.error, ...data });
    }
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach SerpApi' });
  }
}
