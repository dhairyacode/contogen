// File: api/contogen.js

export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({
      error: "Missing 'query' parameter. Example: /api/contogen?query=apple"
    });
  }

  try {
    // Wikipedia Summary API
    const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    const text = await wikiRes.text();
    let wikiData = {};
    try {
      wikiData = JSON.parse(text);
    } catch (e) {
      wikiData = {};
    }

    let description = wikiData.extract || "No description found.";

    // Limit description to ~100-200 words
    const words = description.split(/\s+/).slice(0, 200);
    description = words.join(' ');

    return res.status(200).json({
      description
    });

  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch data from Wikipedia API.",
      details: error.message
    });
  }
}
