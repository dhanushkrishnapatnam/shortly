/**
 * Manages the list of { shortCode, manageToken } pairs in localStorage.
 * This is the only "auth" the app needs — no accounts, no passwords.
 */

const KEY = "shortly_links";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function save(links) {
  localStorage.setItem(KEY, JSON.stringify(links));
}

/** Add a new link after shortening */
export function addLink(shortCode, manageToken) {
  const links = load();
  // Avoid duplicates
  if (!links.find((l) => l.shortCode === shortCode)) {
    links.unshift({ shortCode, manageToken });
    save(links);
  }
}

/** Get all stored { shortCode, manageToken } pairs */
export function getAllLinks() {
  return load();
}

/** Get the manageToken for a specific shortCode */
export function getToken(shortCode) {
  const link = load().find((l) => l.shortCode === shortCode);
  return link?.manageToken || null;
}

/** Remove a link from local storage (after delete) */
export function removeLink(shortCode) {
  const links = load().filter((l) => l.shortCode !== shortCode);
  save(links);
}

/** How many links does this browser own? */
export function getLinkCount() {
  return load().length;
}
