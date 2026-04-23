"use client";

import {
  Certificate01Icon,
  Copy01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ExampleButton } from "@/components/example-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type CertificateNamePart,
  type CertificateParseResult,
  certificateExample,
  parseCertificates,
} from "@/lib/certificate-parser";
import { getStorageValue, scheduleStorageValue } from "@/lib/utils";

const STORAGE_KEY_CERT = "devtools:certificate-parser:input";

const EMPTY_RESULT: CertificateParseResult = {
  certificates: [],
  success: false,
};

const formatName = (parts: CertificateNamePart[]) =>
  parts.map((part) => `${part.key}=${part.value}`).join(", ");

const CertificateParserPage = () => {
  const [input, setInput] = useState(() => getStorageValue(STORAGE_KEY_CERT));
  const [result, setResult] = useState<CertificateParseResult>(EMPTY_RESULT);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    scheduleStorageValue(STORAGE_KEY_CERT, input);
  }, [input, isHydrated]);

  useEffect(() => {
    let cancelled = false;

    parseCertificates(input).then((nextResult) => {
      if (!cancelled) {
        setResult(nextResult);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [input]);

  const firstCertificate = result.certificates[0];
  const resultJson = useMemo(
    () => JSON.stringify(result.certificates, null, 2),
    [result.certificates]
  );

  const handleLoadExample = useCallback(() => {
    setInput(certificateExample);
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
    setResult(EMPTY_RESULT);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(resultJson);
      toast.success("Certificate details copied");
    } catch {
      toast.error("Failed to copy details");
    }
  }, [resultJson]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex max-w-4xl flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">Certificate Parser</h1>
          <p className="text-muted-foreground text-xs">
            Inspect PEM X.509 certificates locally
          </p>
        </div>

        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Certificate</CardTitle>
              <div className="flex items-center gap-2">
                <ExampleButton label="TLS cert" onClick={handleLoadExample} />
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label="Clear certificate"
                        className="cursor-pointer"
                        onClick={handleClear}
                        size="icon-xs"
                        tabIndex={0}
                        variant="ghost"
                      />
                    }
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={14} />
                  </TooltipTrigger>
                  <TooltipContent>Clear</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Field className="gap-0">
              <FieldLabel className="sr-only" htmlFor="certificate-input">
                PEM certificate
              </FieldLabel>
              <Textarea
                aria-label="PEM certificate"
                className="field-sizing-fixed! min-h-[460px] resize-y rounded-none border-0 font-mono text-xs leading-relaxed focus-visible:ring-0"
                id="certificate-input"
                onChange={(event) => setInput(event.target.value)}
                placeholder="-----BEGIN CERTIFICATE-----"
                spellCheck={false}
                value={input}
              />
            </Field>
          </CardContent>
        </Card>
      </div>

      <aside className="flex w-full flex-col gap-4 lg:w-96">
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Details</CardTitle>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      aria-label="Copy certificate details"
                      className="cursor-pointer"
                      disabled={result.certificates.length === 0}
                      onClick={handleCopy}
                      size="icon-xs"
                      tabIndex={0}
                      variant="ghost"
                    />
                  }
                >
                  <HugeiconsIcon icon={Copy01Icon} size={14} />
                </TooltipTrigger>
                <TooltipContent>Copy details</TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.success ? "Parsed" : "Waiting"}
              </Badge>
              {firstCertificate && (
                <Badge
                  variant={
                    firstCertificate.isExpired || firstCertificate.isNotYetValid
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {firstCertificate.daysRemaining} days
                </Badge>
              )}
            </div>
            {result.error && (
              <p className="text-muted-foreground text-xs">{result.error}</p>
            )}
            {firstCertificate && (
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Certificate01Icon} size={16} />
                  <span className="font-medium">
                    {formatName(firstCertificate.subject)}
                  </span>
                </div>
                <Detail
                  label="Issuer"
                  value={formatName(firstCertificate.issuer)}
                />
                <Detail label="Serial" value={firstCertificate.serialNumber} />
                <Detail label="Not before" value={firstCertificate.notBefore} />
                <Detail label="Not after" value={firstCertificate.notAfter} />
                <Detail
                  label="Signature"
                  value={firstCertificate.signatureAlgorithm}
                />
                <Detail
                  label="Public key"
                  value={firstCertificate.keyAlgorithm}
                />
                {firstCertificate.san.length > 0 && (
                  <Detail
                    label="SANs"
                    value={firstCertificate.san.join(", ")}
                  />
                )}
                {firstCertificate.keyUsage.length > 0 && (
                  <Detail
                    label="Key usage"
                    value={firstCertificate.keyUsage.join(", ")}
                  />
                )}
                {firstCertificate.extendedKeyUsage.length > 0 && (
                  <Detail
                    label="Extended usage"
                    value={firstCertificate.extendedKeyUsage.join(", ")}
                  />
                )}
                <Detail
                  label="SHA-256"
                  value={firstCertificate.fingerprints.sha256}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1 border-b pb-2 last:border-b-0 last:pb-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="break-all font-mono">{value}</span>
  </div>
);

export default CertificateParserPage;
