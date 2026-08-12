/** Every action on this site ultimately hands the visitor over to the case file. */
export function resolveCtfUrl(url?: string | null) {
  const trimmed = (url ?? "").trim();
  return trimmed || "/ctf";
}

export function isExternal(url: string) {
  return /^https?:\/\//i.test(url);
}
