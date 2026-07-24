const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") ?? "";

export function withBasePath(path: string) {
  if (!path || path.startsWith("http") || path.startsWith("data:")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${configuredBasePath}${normalizedPath}`;
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://seu-usuario.github.io/cha-de-bebe-manoel";
}
