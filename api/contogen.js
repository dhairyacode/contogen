// File: api/contogen.js

export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({
      error: "Missing 'query' parameter. Example: /api/contogen?query=apple"
    });
  }

  try {
    // Step 1: Get summary from Wikipedia
    const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    const text = await wikiRes.text();
    let wikiData = {};
    try {
      wikiData = JSON.parse(text);
    } catch {
      wikiData = {};
    }

    let description = wikiData.extract || "No description found.";

    // Step 2: If less than ~400 words, attempt to fetch full content
    const wordCount = description.split(/\s+/).length;
    if (wordCount < 400 && wikiData.title) {
      try {
        // Wikipedia action API to fetch plain content
        const fullRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&format=json&titles=${encodeURIComponent(wikiData.title)}&origin=*`);
        const fullData = await fullRes.json();
        const pages = fullData.query?.pages || {};
        const page = Object.values(pages)[0];
        if (page?.extract) {
          description = page.extract;
        }
      } catch (e) {
        // fallback to summary if full content fails
      }
    }

    // Limit to ~400 words
    const words = description.split(/\s+/).slice(0, 400);
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
