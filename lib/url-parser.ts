export type ParsedURL = {
  isValid: boolean;
  error?: string;
  href: string;
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  host: string;
  username: string;
  password: string;
  searchParams: Array<{ key: string; value: string }>;
};

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
  if (!parsed.isValid) return "";

  try {
    const url = new URL(parsed.origin);
    url.pathname = parsed.pathname;
    url.hash = parsed.hash;

    parsed.searchParams.forEach(({ key, value }) => {
      if (key) {
        url.searchParams.append(key, value);
      }
    });

    if (parsed.username) {
      url.username = parsed.username;
    }
    if (parsed.password) {
      url.password = parsed.password;
    }

    return url.href;
  } catch {
    return "";
  }
};
