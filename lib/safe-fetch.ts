import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { validateAndNormalizeUrl, isPrivateOrLocalIP } from "./url";

export async function assertPublicUrl(input: string): Promise<void> {
  const checked = validateAndNormalizeUrl(input);
  if (!checked.valid) throw new Error(checked.error);
  const host = new URL(input).hostname.replace(/^\[|\]$/g, "");
  const addresses = isIP(host)
    ? [{ address: host }]
    : await lookup(host, { all: true });
  if (
    !addresses.length ||
    addresses.some(({ address }) => isPrivateOrLocalIP(address))
  ) {
    throw new Error("Access to private and internal addresses is restricted.");
  }
}

export async function safeFetch(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  for (let redirects = 0; redirects <= 5; redirects++) {
    await assertPublicUrl(url);
    const response = await fetch(url, { ...init, redirect: "manual" });
    const location = response.headers.get("location");
    if (![301, 302, 303, 307, 308].includes(response.status) || !location)
      return response;
    await response.body?.cancel();
    url = new URL(location, url).href;
  }
  throw new Error("Too many redirects");
}
