import axios from "axios";

const TRUSTED_DOMAINS = [
  "reuters.com",
  "apnews.com",
  "bbc.com",
  "who.int",
  "cdc.gov",
  "nih.gov",
  "gov.in",
  "pib.gov.in",
  "isro.gov.in",
  "nasa.gov",
  "un.org",
  "wikipedia.org",
  "britannica.com",
  "espncricinfo.com",
  "icc-cricket.com",
];

const isTrustedSource = (link = "") => {
  return TRUSTED_DOMAINS.some((domain) => link.includes(domain));
};

const getDomain = (url) => {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
};

export const searchWebForClaim = async (claim) => {
  try {
    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        q: `${claim} fact check trusted source`,
        api_key: process.env.SERP_API_KEY,
        engine: "google",
        num: 10,
      },
    });

    const results = response.data.organic_results || [];

    const cleanedResults = results
      .filter((item) => item.title && item.link && item.snippet)
      .map((item) => ({
        title: item.title,
        snippet: item.snippet,
        link: item.link,
        domain: getDomain(item.link),
        trusted: isTrustedSource(item.link),
      }));

    const trustedResults = cleanedResults.filter((item) => item.trusted);

    const finalResults =
      trustedResults.length >= 2 ? trustedResults : cleanedResults;

    const uniqueResults = [];
    const seenDomains = new Set();

    for (const item of finalResults) {
      if (!seenDomains.has(item.domain)) {
        seenDomains.add(item.domain);
        uniqueResults.push(item);
      }

      if (uniqueResults.length === 4) break;
    }

    return uniqueResults;
  } catch (error) {
    console.error("Search error:", error.message);
    return [];
  }
};