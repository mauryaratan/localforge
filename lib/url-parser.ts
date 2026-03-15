export interface ParsedURL {
  error?: string;
  hash: string;
  host: string;
  hostname: string;
  href: string;
  isValid: boolean;
  origin: string;
  password: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
  searchParams: Array<{ key: string; value: string }>;
  username: string;
}

export const parseURL = (urlString: string): ParsedURL => {
  const emptyResult: ParsedURL = {
    isValid: false,
    error: "",
    href: "",
    protocol: "",
    hostname: "",
    port: "",
    pathname: "",
    search: "",
    hash: "",
    origin: "",
    host: "",
    username: "",
    password: "",
    searchParams: [],
  };

  if (!urlString.trim()) {
    return { ...emptyResult, error: "Please enter a URL" };
  }

  try {
    const url = new URL(urlString);
    const searchParams: Array<{ key: string; value: string }> = [];

    url.searchParams.forEach((value, key) => {
      searchParams.push({ key, value });
    });

    return {
      isValid: true,
      href: url.href,
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      origin: url.origin,
      host: url.host,
      username: url.username,
      password: url.password,
      searchParams,
    };
  } catch {
    return { ...emptyResult, error: "Invalid URL format" };
  }
};

export const encodeURLComponent = (value: string): string => {
  try {
    return encodeURIComponent(value);
  } catch {
    return value;
  }
};

export const decodeURLComponent = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const buildURL = (parsed: ParsedURL): string => {
  if (!parsed.isValid) {
    return "";
  }

  try {
    // `origin` is "null" for valid URLs like file:, data:, mailto:, etc.
    // Seed from href first so those protocols can still round-trip.
    const seed = parsed.href || parsed.origin;
    const url = new URL(seed);
    url.pathname = parsed.pathname;
    url.hash = parsed.hash;
    url.search = "";

    for (const { key, value } of parsed.searchParams) {
      if (key) {
        url.searchParams.append(key, value);
      }
    }

    // Always set to support clearing previously parsed credentials.
    url.username = parsed.username;
    url.password = parsed.password;

    return url.href;
  } catch {
    return "";
  }
};
