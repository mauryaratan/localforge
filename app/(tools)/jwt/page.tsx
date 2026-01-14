"use client";

import {
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Delete02Icon,
  InformationCircleIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type JWTAlgorithm,
  type JWTDecoded,
  type JWTHeader,
  type JWTPayload,
  decodeJWT,
  encodeJWT,
  verifyJWT,
  validateJSON,
  formatClaimValue,
  getExpirationInfo,
  STANDARD_CLAIMS,
  EXAMPLE_TOKENS,
  DEFAULT_HEADER,
  DEFAULT_PAYLOAD,
} from "@/lib/jwt";

const STORAGE_KEY = "devtools:jwt:input";
const STORAGE_SECRET_KEY = "devtools:jwt:secret";

type VerificationStatus = "idle" | "valid" | "invalid" | "error";

const JWTPage = () => {
  const [activeTab, setActiveTab] = useState<"decode" | "encode">("decode");
  const [isHydrated, setIsHydrated] = useState(false);

  // Decoder state
  const [token, setToken] = useState("");
  const [decoded, setDecoded] = useState<JWTDecoded | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [secret, setSecret] = useState("");
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("idle");
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  // Encoder state
  const [headerInput, setHeaderInput] = useState(
    JSON.stringify(DEFAULT_HEADER, null, 2)
  );
  const [payloadInput, setPayloadInput] = useState(
    JSON.stringify(DEFAULT_PAYLOAD, null, 2)
  );
  const [encodeSecret, setEncodeSecret] = useState("");
  const [encodedToken, setEncodedToken] = useState("");
  const [encodeError, setEncodeError] = useState<string | null>(null);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [payloadError, setPayloadError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEY);
    const savedSecret = localStorage.getItem(STORAGE_SECRET_KEY);

    if (savedToken) {
      setToken(savedToken);
      const result = decodeJWT(savedToken);
      if (result.success) {
        setDecoded(result.data);
        setDecodeError(null);
      } else {
        setDecodeError(result.error || "Invalid token");
      }
    }

    if (savedSecret) {
      setSecret(savedSecret);
    }

    setIsHydrated(true);
  }, []);

  // Save token to localStorage
  useEffect(() => {
    if (!isHydrated) return;

    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [token, isHydrated]);

  // Save secret to localStorage
  useEffect(() => {
    if (!isHydrated) return;

    if (secret) {
      localStorage.setItem(STORAGE_SECRET_KEY, secret);
    } else {
      localStorage.removeItem(STORAGE_SECRET_KEY);
    }
  }, [secret, isHydrated]);

  // Handle token decode
  const handleTokenChange = useCallback((value: string) => {
    setToken(value);
    setVerificationStatus("idle");
    setVerificationError(null);

    if (!value.trim()) {
      setDecoded(null);
      setDecodeError(null);
      return;
    }

    const result = decodeJWT(value);
    if (result.success) {
      setDecoded(result.data);
      setDecodeError(null);
    } else {
      setDecoded(null);
      setDecodeError(result.error || "Invalid token");
    }
  }, []);

  // Handle signature verification
  const handleVerify = useCallback(async () => {
    if (!token || !secret) {
      setVerificationStatus("error");
      setVerificationError("Token and secret are required");
      return;
    }

    const result = await verifyJWT(token, secret);

    if (result.success) {
      setVerificationStatus(result.data ? "valid" : "invalid");
      setVerificationError(null);
    } else {
      setVerificationStatus("error");
      setVerificationError(result.error || "Verification failed");
    }
  }, [token, secret]);

  // Auto-verify when secret changes and token exists
  useEffect(() => {
    if (isHydrated && token && secret) {
      handleVerify();
    }
  }, [secret, isHydrated, token, handleVerify]);

  // Handle JWT encoding
  const handleEncode = useCallback(async () => {
    const headerResult = validateJSON(headerInput);
    if (!headerResult.success) {
      setHeaderError(headerResult.error || "Invalid header JSON");
      setEncodedToken("");
      return;
    }
    setHeaderError(null);

    const payloadResult = validateJSON(payloadInput);
    if (!payloadResult.success) {
      setPayloadError(payloadResult.error || "Invalid payload JSON");
      setEncodedToken("");
      return;
    }
    setPayloadError(null);

    if (!encodeSecret) {
      setEncodeError("Secret is required");
      setEncodedToken("");
      return;
    }
    setEncodeError(null);

    const result = await encodeJWT(
      headerResult.data as JWTHeader,
      payloadResult.data as JWTPayload,
      encodeSecret
    );

    if (result.success) {
      setEncodedToken(result.data);
      setEncodeError(null);
    } else {
      setEncodedToken("");
      setEncodeError(result.error || "Encoding failed");
    }
  }, [headerInput, payloadInput, encodeSecret]);

  // Auto-encode when inputs change
  useEffect(() => {
    if (isHydrated && encodeSecret) {
      handleEncode();
    }
  }, [headerInput, payloadInput, encodeSecret, isHydrated, handleEncode]);

  const handleCopy = async (text: string, label: string) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleClear = () => {
    setToken("");
    setDecoded(null);
    setDecodeError(null);
    setVerificationStatus("idle");
    setVerificationError(null);
  };

  const handleExampleClick = (example: (typeof EXAMPLE_TOKENS)[0]) => {
    setToken(example.token);
    setSecret(example.secret);
    handleTokenChange(example.token);
  };

  const handleAlgorithmChange = (alg: JWTAlgorithm) => {
    try {
      const header = JSON.parse(headerInput);
      header.alg = alg;
      setHeaderInput(JSON.stringify(header, null, 2));
    } catch {
      // If header is invalid, create new one
      setHeaderInput(JSON.stringify({ alg, typ: "JWT" }, null, 2));
    }
  };

  const expirationInfo = decoded?.payload
    ? getExpirationInfo(decoded.payload)
    : null;

  return (
    <div className="flex max-w-7xl flex-col gap-6 xl:flex-row xl:items-start">
      {/* Main Section */}
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">JWT Encoder / Decoder</h1>
          <p className="text-muted-foreground text-xs">
            Decode, verify, and generate JSON Web Tokens
          </p>
        </div>

        <Tabs
          defaultValue="decode"
          onValueChange={(v) => setActiveTab(v as "decode" | "encode")}
          value={activeTab}
        >
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger className="cursor-pointer" value="decode">
              Decoder
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="encode">
              Encoder
            </TabsTrigger>
          </TabsList>

          {/* Decoder Tab */}
          <TabsContent className="mt-4 space-y-4" value="decode">
            {/* Token Input */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Encoded Token</CardTitle>
                  <div className="flex items-center gap-2">
                    {decodeError && (
                      <span className="text-destructive text-xs">
                        {decodeError}
                      </span>
                    )}
                    {token && (
                      <Button
                        aria-label="Clear all"
                        className="cursor-pointer"
                        onClick={handleClear}
                        size="xs"
                        tabIndex={0}
                        variant="ghost"
                      >
                        <HugeiconsIcon
                          data-icon="inline-start"
                          icon={Delete02Icon}
                          size={14}
                        />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label
                      className="text-muted-foreground text-xs uppercase tracking-wider"
                      htmlFor="token-input"
                    >
                      Paste JWT Token
                    </Label>
                    <Button
                      aria-label="Copy token"
                      className="cursor-pointer"
                      disabled={!token}
                      onClick={() => handleCopy(token, "Token")}
                      size="icon-xs"
                      tabIndex={0}
                      variant="ghost"
                    >
                      <HugeiconsIcon icon={Copy01Icon} size={14} />
                    </Button>
                  </div>
                  <Textarea
                    aria-label="JWT token input"
                    className={`min-h-[120px] resize-none font-mono text-xs break-all ${
                      decodeError
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                    id="token-input"
                    onChange={(e) => handleTokenChange(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={token}
                  />
                  {decoded && (
                    <div className="flex flex-wrap items-center gap-2 text-[10px]">
                      <span className="font-mono text-red-500">
                        {decoded.rawParts.header}
                      </span>
                      <span className="text-muted-foreground">.</span>
                      <span className="font-mono text-purple-500">
                        {decoded.rawParts.payload.slice(0, 30)}...
                      </span>
                      <span className="text-muted-foreground">.</span>
                      <span className="font-mono text-cyan-500">
                        {decoded.rawParts.signature.slice(0, 20)}...
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Decoded Output */}
            {decoded && (
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Header */}
                <Card>
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                        Header
                      </CardTitle>
                      <Button
                        aria-label="Copy header"
                        className="cursor-pointer"
                        onClick={() =>
                          handleCopy(
                            JSON.stringify(decoded.header, null, 2),
                            "Header"
                          )
                        }
                        size="icon-xs"
                        tabIndex={0}
                        variant="ghost"
                      >
                        <HugeiconsIcon icon={Copy01Icon} size={14} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <pre className="overflow-x-auto rounded bg-muted/50 p-3 font-mono text-xs">
                      {JSON.stringify(decoded.header, null, 2)}
                    </pre>
                    <div className="mt-3 space-y-1">
                      {Object.entries(decoded.header).map(([key, value]) => (
                        <div
                          className="flex items-center justify-between text-xs"
                          key={key}
                        >
                          <span className="font-medium text-muted-foreground">
                            {key}
                          </span>
                          <span className="font-mono">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Payload */}
                <Card>
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-purple-500" />
                        Payload
                      </CardTitle>
                      <Button
                        aria-label="Copy payload"
                        className="cursor-pointer"
                        onClick={() =>
                          handleCopy(
                            JSON.stringify(decoded.payload, null, 2),
                            "Payload"
                          )
                        }
                        size="icon-xs"
                        tabIndex={0}
                        variant="ghost"
                      >
                        <HugeiconsIcon icon={Copy01Icon} size={14} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <pre className="overflow-x-auto rounded bg-muted/50 p-3 font-mono text-xs">
                      {JSON.stringify(decoded.payload, null, 2)}
                    </pre>
                    <div className="mt-3 space-y-2">
                      {Object.entries(decoded.payload).map(([key, value]) => {
                        const { formatted, isTimestamp } = formatClaimValue(
                          key,
                          value
                        );
                        const claimDescription =
                          STANDARD_CLAIMS[key] || "Custom claim";
                        return (
                          <div
                            className="flex items-start justify-between gap-2 text-xs"
                            key={key}
                          >
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-muted-foreground">
                                {key}
                              </span>
                              <Tooltip>
                                <TooltipTrigger
                                  aria-label={`Info about ${key}`}
                                  className="cursor-help"
                                >
                                  <HugeiconsIcon
                                    className="text-muted-foreground/50"
                                    icon={InformationCircleIcon}
                                    size={12}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{claimDescription}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <span
                              className={`text-right font-mono ${isTimestamp ? "text-amber-600 dark:text-amber-400" : ""}`}
                            >
                              {formatted}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {expirationInfo && expirationInfo.expiresAt && (
                      <div
                        className={`mt-3 flex items-center gap-2 rounded border p-2 text-xs ${
                          expirationInfo.expired
                            ? "border-destructive/50 bg-destructive/10 text-destructive"
                            : "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400"
                        }`}
                      >
                        <HugeiconsIcon
                          icon={
                            expirationInfo.expired
                              ? AlertCircleIcon
                              : CheckmarkCircle02Icon
                          }
                          size={14}
                        />
                        <span>{expirationInfo.timeRemaining}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Signature Verification */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-cyan-500" />
                  Signature Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label
                      className="text-muted-foreground text-xs uppercase tracking-wider"
                      htmlFor="secret-input"
                    >
                      Secret Key
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        aria-label="Secret key for verification"
                        className="flex-1 font-mono text-xs"
                        id="secret-input"
                        onChange={(e) => {
                          setSecret(e.target.value);
                          setVerificationStatus("idle");
                        }}
                        placeholder="Enter secret to verify signature..."
                        type="text"
                        value={secret}
                      />
                      <Button
                        aria-label="Verify signature"
                        className="cursor-pointer"
                        disabled={!token || !secret}
                        onClick={handleVerify}
                        size="sm"
                        tabIndex={0}
                        variant="secondary"
                      >
                        Verify
                      </Button>
                    </div>
                  </div>

                  {verificationStatus !== "idle" && (
                    <div
                      className={`flex items-center gap-2 rounded border p-3 text-sm ${
                        verificationStatus === "valid"
                          ? "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400"
                          : verificationStatus === "invalid"
                            ? "border-destructive/50 bg-destructive/10 text-destructive"
                            : "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      <HugeiconsIcon
                        icon={
                          verificationStatus === "valid"
                            ? Tick02Icon
                            : AlertCircleIcon
                        }
                        size={16}
                      />
                      <span>
                        {verificationStatus === "valid"
                          ? "Signature Verified"
                          : verificationStatus === "invalid"
                            ? "Invalid Signature"
                            : verificationError || "Verification Error"}
                      </span>
                    </div>
                  )}

                  <p className="text-[10px] text-muted-foreground">
                    Enter the secret key used to sign this JWT to verify the
                    signature. Supports HS256, HS384, and HS512 algorithms.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Encoder Tab */}
          <TabsContent className="mt-4 space-y-4" value="encode">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Header Input */}
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                      Header
                    </CardTitle>
                    <Select
                      onValueChange={(v) =>
                        handleAlgorithmChange(v as JWTAlgorithm)
                      }
                      value={
                        (() => {
                          try {
                            return JSON.parse(headerInput).alg || "HS256";
                          } catch {
                            return "HS256";
                          }
                        })()
                      }
                    >
                      <SelectTrigger
                        aria-label="Select algorithm"
                        className="w-24 cursor-pointer"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem className="cursor-pointer" value="HS256">
                          HS256
                        </SelectItem>
                        <SelectItem className="cursor-pointer" value="HS384">
                          HS384
                        </SelectItem>
                        <SelectItem className="cursor-pointer" value="HS512">
                          HS512
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <Textarea
                    aria-label="JWT header JSON"
                    className={`min-h-[120px] resize-none font-mono text-xs ${
                      headerError
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                    onChange={(e) => setHeaderInput(e.target.value)}
                    placeholder='{"alg": "HS256", "typ": "JWT"}'
                    value={headerInput}
                  />
                  {headerError && (
                    <p className="mt-2 text-destructive text-xs">
                      {headerError}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Payload Input */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-purple-500" />
                    Payload
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <Textarea
                    aria-label="JWT payload JSON"
                    className={`min-h-[120px] resize-none font-mono text-xs ${
                      payloadError
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                    onChange={(e) => setPayloadInput(e.target.value)}
                    placeholder='{"sub": "1234567890", "name": "John Doe"}'
                    value={payloadInput}
                  />
                  {payloadError && (
                    <p className="mt-2 text-destructive text-xs">
                      {payloadError}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Secret Input */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-cyan-500" />
                  Secret
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col gap-2">
                  <Label
                    className="text-muted-foreground text-xs uppercase tracking-wider"
                    htmlFor="encode-secret"
                  >
                    Secret Key
                  </Label>
                  <Input
                    aria-label="Secret key for signing"
                    className="font-mono text-xs"
                    id="encode-secret"
                    onChange={(e) => setEncodeSecret(e.target.value)}
                    placeholder="Enter secret key to sign the JWT..."
                    type="text"
                    value={encodeSecret}
                  />
                  {encodeError && (
                    <p className="text-destructive text-xs">{encodeError}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Encoded Output */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Encoded Token</CardTitle>
                  <Button
                    aria-label="Copy encoded token"
                    className="cursor-pointer"
                    disabled={!encodedToken}
                    onClick={() => handleCopy(encodedToken, "Encoded token")}
                    size="xs"
                    tabIndex={0}
                    variant="ghost"
                  >
                    <HugeiconsIcon
                      data-icon="inline-start"
                      icon={Copy01Icon}
                      size={14}
                    />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div
                  className={`min-h-[80px] rounded border bg-muted/30 p-3 font-mono text-xs break-all ${
                    encodedToken
                      ? ""
                      : "flex items-center justify-center text-muted-foreground"
                  }`}
                >
                  {encodedToken || "Enter header, payload, and secret to generate JWT"}
                </div>
                {encodedToken && (
                  <Button
                    aria-label="Use in decoder"
                    className="mt-3 cursor-pointer"
                    onClick={() => {
                      setToken(encodedToken);
                      handleTokenChange(encodedToken);
                      setActiveTab("decode");
                    }}
                    size="sm"
                    tabIndex={0}
                    variant="outline"
                  >
                    Use in Decoder
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Reference */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Standard Claims</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(STANDARD_CLAIMS).map(([key, description]) => (
                <div className="flex items-center gap-2" key={key}>
                  <code className="rounded bg-muted/50 px-2 py-0.5 font-mono text-[10px]">
                    {key}
                  </code>
                  <span className="text-muted-foreground">{description}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-muted-foreground">
              JWT tokens consist of three parts: Header (algorithm & token
              type), Payload (claims), and Signature. All processing happens
              locally in your browser.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Examples */}
      <div className="w-full shrink-0 xl:sticky xl:top-4 xl:w-64">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Examples</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-4">
            {EXAMPLE_TOKENS.map((example) => (
              <button
                aria-label={`Use example: ${example.label}`}
                className="cursor-pointer rounded-md border bg-muted/30 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50"
                key={example.label}
                onClick={() => handleExampleClick(example)}
                tabIndex={0}
                type="button"
              >
                <span className="font-medium">{example.label}</span>
                <span className="mt-1 block text-muted-foreground">
                  {example.description}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-4">
          <CardHeader className="border-b">
            <CardTitle>About JWT</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                JSON Web Tokens are an open, industry standard{" "}
                <a
                  className="text-primary underline-offset-2 hover:underline"
                  href="https://tools.ietf.org/html/rfc7519"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  RFC 7519
                </a>{" "}
                method for representing claims securely between two parties.
              </p>
              <p className="font-medium text-amber-600 dark:text-amber-400">
                Be careful where you paste JWTs as they may contain sensitive
                credentials.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JWTPage;
