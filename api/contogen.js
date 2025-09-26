// File: api/contogen.js

export default async function handler(req, res) {
  const { query, type } = req.query;

  if (!query) {
    return res.status(400).json({
      error: "Missing 'query' parameter. Example: /api/contogen?query=apple&type=summary"
    });
  }

  const mode = type?.toLowerCase() || "summary"; // default to summary
  let description = "";
  let source = "";

  try {
    if (mode === "summary") {
      // DuckDuckGo Instant Answer API
      const duckRes = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
      const text = await duckRes.text(); // read raw text
      let duckData = {};
      try {
        duckData = JSON.parse(text);
      } catch (e) {
        // fallback if JSON.parse fails
        duckData = {};
      }

      description = duckData.AbstractText || "No summary found.";
      source = duckData.AbstractURL || "DuckDuckGo";

    } else if (mode === "descriptive") {
      // Wikipedia Summary API
      const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
      const text = await wikiRes.text(); // read raw text
      let wikiData = {};
      try {
        wikiData = JSON.parse(text);
      } catch (e) {
        wikiData = {};
      }

      description = wikiData.extract || "No description found.";
      source = wikiData.content_urls?.desktop?.page || "Wikipedia";

    } else {
      return res.status(400).json({
        error: "Invalid 'type'. Use either 'summary' or 'descriptive'."
      });
    }

    return res.status(200).json({
      query,
      type: mode,
      description,
      source
    });

  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch data from external API.",
      details: error.message
    });
  }
}
