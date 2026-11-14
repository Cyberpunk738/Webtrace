export interface URLValidationResult {
  valid: boolean;
  normalizedUrl?: string;
  domain?: string;
  error?: string;
}

const BLOCKED_HOSTNAMES = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
  "localhost.localdomain",
];

export function validateAndNormalizeUrl(inputUrl: string): URLValidationResult {
  if (!inputUrl || typeof inputUrl !== "string") {
    return { valid: false, error: "URL is required." };
  }

  let formatted = inputUrl.trim();
  if (
    !/^[a-z][a-z0-9+.-]*:/i.test(formatted) ||
    /^[^/?#]+:\d+(?:[/?#]|$)/.test(formatted)
  ) {
    formatted = `https://${formatted}`;
  }

  try {
    const parsed = new URL(formatted);

    // Only allow http and https
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        valid: false,
        error: "Only HTTP and HTTPS protocols are supported.",
      };
    }

    if (parsed.username || parsed.password)
      return {
        valid: false,
        error: "URLs containing credentials are not supported.",
      };
    const hostname = parsed.hostname.toLowerCase();

    // Check explicit blocked hostnames
    if (BLOCKED_HOSTNAMES.includes(hostname)) {
      return {
        valid: false,
        error: "Access to localhost and internal loopbacks is restricted.",
      };
    }

    // Check IP range restrictions (SSRF Protection)
    if (isPrivateOrLocalIP(hostname)) {
      return {
        valid: false,
        error: "Access to private and internal IP ranges is restricted.",
      };
    }

    // Check TLD / hostname sanity
    if (!hostname.includes(".") && !hostname.includes(":")) {
      return {
        valid: false,
        error: "Enter a valid domain name (e.g. example.com).",
      };
    }

    return {
      valid: true,
      normalizedUrl: parsed.href,
      domain: hostname.replace(/^www\./, ""),
    };
  } catch {
    return {
      valid: false,
      error: "Invalid URL format. Please provide a valid web address.",
    };
  }
}

export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

export function isThirdPartyDomain(
  requestDomain: string,
  targetDomain: string,
): boolean {
  if (!requestDomain || !targetDomain) return false;
  const cleanReq = requestDomain.toLowerCase().replace(/^www\./, "");
  const cleanTarget = targetDomain.toLowerCase().replace(/^www\./, "");

  if (cleanReq === cleanTarget) return false;

  // Root domain check e.g., cdn.example.com vs example.com
  if (cleanReq.endsWith(`.${cleanTarget}`)) return false;

  return true;
}

export function isPrivateOrLocalIP(hostname: string): boolean {
  hostname = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (hostname.includes(":"))
    return (
      !/^[23][0-9a-f]{3}:/.test(hostname) || hostname.startsWith("2001:db8:")
    );
  // IPv4 regex
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Regex);
  if (!match) return false;

  const [, p1, p2] = match.map(Number);

  // 127.0.0.0/8 (Loopback)
  if (p1 === 127) return true;
  // 10.0.0.0/8 (Private)
  if (p1 === 10) return true;
  // 172.16.0.0/12 (Private)
  if (p1 === 172 && p2 >= 16 && p2 <= 31) return true;
  // 192.168.0.0/16 (Private)
  if (p1 === 192 && p2 === 168) return true;
  // 169.254.0.0/16 (Link-local APIPA)
  if (p1 === 169 && p2 === 254) return true;
  // 0.0.0.0/8
  if (p1 === 0 || p1 >= 224) return true;
  if (p1 === 100 && p2 >= 64 && p2 <= 127) return true;
  if (p1 === 198 && (p2 === 18 || p2 === 19)) return true;

  return false;
}
