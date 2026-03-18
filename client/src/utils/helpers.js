import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export function formatDate(date) {
  if (!date) return "—";
  return dayjs(date).format("MMM D, YYYY");
}

export function formatDatetime(date) {
  if (!date) return "—";
  return dayjs(date).format("MMM D, YYYY h:mm A");
}

export function timeAgo(date) {
  if (!date) return "—";
  return dayjs(date).fromNow();
}

export function truncate(str, max = 48) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

export function copyToClipboard(text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback
  const el = document.createElement("textarea");
  el.value = text;
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  return Promise.resolve();
}

export function getDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}
