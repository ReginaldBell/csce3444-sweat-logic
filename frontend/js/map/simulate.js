import { ZONES } from './data.js';

const STATUS_LEVELS  = ['empty', 'moderate', 'busy'];
const STORAGE_PREFIX = 'sweatlogic-report-';
const EXPIRY_MS      = 4 * 60 * 60 * 1000; // 4 hours

// Seeds every zone with a random status once on page load.
// Values are informational estimates only — not live data.
export function seedStatus() {
  Object.keys(ZONES).forEach(key => {
    ZONES[key].status = STATUS_LEVELS[Math.floor(Math.random() * STATUS_LEVELS.length)];
  });
}

// Reads any user-saved reports from localStorage and applies them over the seed.
// Reports older than 4 hours are silently discarded.
export function loadSavedReports() {
  Object.keys(ZONES).forEach(key => {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return;
    try {
      const { status, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp > EXPIRY_MS) {
        localStorage.removeItem(STORAGE_PREFIX + key); // clean up stale entry
        return;
      }
      if (STATUS_LEVELS.includes(status)) {
        ZONES[key].status = status;
      }
    } catch {
      localStorage.removeItem(STORAGE_PREFIX + key); // clean up malformed entry
    }
  });
}

// Saves a user report for a zone and applies it immediately.
// render must be called by the caller after this (events.js handles that).
export function setZoneReport(key, status) {
  if (!ZONES[key] || !STATUS_LEVELS.includes(status)) return;
  ZONES[key].status = status;
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify({ status, timestamp: Date.now() }));
}

// Returns the saved report entry for a zone key, or null if none / expired.
export function getSavedReport(key) {
  const raw = localStorage.getItem(STORAGE_PREFIX + key);
  if (!raw) return null;
  try {
    const entry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > EXPIRY_MS) return null;
    return entry;
  } catch {
    return null;
  }
}
