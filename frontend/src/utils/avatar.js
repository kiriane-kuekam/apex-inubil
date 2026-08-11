const PALETTE = [
  { bg: "#dce9ff", text: "#00387e" },
  { bg: "#ffdbd0", text: "#ab3500" },
  { bg: "#e7f5f0", text: "#1b8a6b" },
  { bg: "#fbe7c6", text: "#8a5a00" },
  { bg: "#e6def7", text: "#5b3aa8" },
];

export function getInitials(fullName) {
  if (!fullName) return "";
  const words = fullName
    .replace(/^(Mme?|M\.?|Dr\.?)\s+/i, "")
    .trim()
    .split(/\s+/);
  return words.slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
}

export function getAvatarColor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
