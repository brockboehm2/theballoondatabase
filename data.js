// js/data.js

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRqTD-RzybUzgZOJ4HM4gJYVBDoqCUk78pepoOZPgcwSUTzfm-ZmEmINgk-od3aFv5hlZMeNQVSJZVI/pub?output=tsv";

// Canonical fields used by the site
const FIELDS = [
  "Name",
  "Registration",
  "Manufacturer",
  "Model",
  "SerialNumber",
  "YearBuilt",
  "Size",
  "PilotOwner",
  "Location",
  "Status",
  "PreviousOwners",
  "Image",
];

export async function loadBalloons() {
  const res = await fetch(SHEET_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load sheet (${res.status})`);
  }

  const text = await res.text();

  // Guard: Google accidentally returned HTML
  if (looksLikeHtml(text)) {
    throw new Error(
      "Google returned HTML instead of TSV. Make sure the sheet is published as TSV."
    );
  }

  const rows = parseTSV(text);
  if (rows.length < 2) return [];

  const headers = rows.shift().map(h => h.trim());

  return rows
    .filter(row => row.some(cell => String(cell || "").trim() !== ""))
    .map(row => rowToBalloon(headers, row));
}

// ---------- helpers ----------

function looksLikeHtml(text) {
  const t = text.trim().toLowerCase();
  return t.startsWith("<!doctype") || t.startsWith("<html");
}

function parseTSV(text) {
  return text
    .replace(/\r/g, "")
    .trim()
    .split("\n")
    .map(line => line.split("\t"));
}

function rowToBalloon(headers, row) {
  const raw = {};
  headers.forEach((h, i) => (raw[h] = row[i] ?? ""));

  const out = {};
  for (const f of FIELDS) {
    if (f === "Image") {
      out.Image = normalizeImage(raw.Image);
    } else {
      out[f] = String(raw[f] ?? "").trim();
    }
  }
  return out;
}

/**
 * Accepts:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/uc?export=view&id=FILE_ID
 * - already-direct image URLs
 *
 * Always returns an embeddable image URL.
 */
function normalizeImage(url = "") {
  const u = String(url).trim();
  if (!u) return "";

  // /file/d/FILE_ID/view
  const fileMatch = u.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (fileMatch && fileMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w2000`;
  }

  // uc?export=view&id=FILE_ID
  if (u.includes("drive.google.com/uc")) {
    const idMatch = u.match(/[?&]id=([^&]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w2000`;
    }
  }

  // Already a direct image URL (jpg/png/webp/etc)
  return u;
}
