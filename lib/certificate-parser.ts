import "reflect-metadata";
import {
  BasicConstraintsExtension,
  ExtendedKeyUsage,
  ExtendedKeyUsageExtension,
  KeyUsageFlags,
  KeyUsagesExtension,
  SubjectAlternativeNameExtension,
  X509Certificate,
} from "@peculiar/x509";

export interface CertificateNamePart {
  key: string;
  value: string;
}

export interface ParsedCertificate {
  basicConstraints: {
    ca: boolean;
    pathLength?: number;
  } | null;
  daysRemaining: number;
  extendedKeyUsage: string[];
  fingerprints: {
    sha1: string;
    sha256: string;
  };
  isExpired: boolean;
  isNotYetValid: boolean;
  issuer: CertificateNamePart[];
  keyAlgorithm: string;
  keyUsage: string[];
  notAfter: string;
  notBefore: string;
  publicKeyAlgorithm: string;
  san: string[];
  serialNumber: string;
  signatureAlgorithm: string;
  subject: CertificateNamePart[];
}

export interface CertificateParseResult {
  certificates: ParsedCertificate[];
  error?: string;
  success: boolean;
}

const PEM_CERT_REGEX =
  /-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g;

const KEY_USAGE_LABELS: [KeyUsageFlags, string][] = [
  [KeyUsageFlags.digitalSignature, "Digital signature"],
  [KeyUsageFlags.nonRepudiation, "Non-repudiation"],
  [KeyUsageFlags.keyEncipherment, "Key encipherment"],
  [KeyUsageFlags.dataEncipherment, "Data encipherment"],
  [KeyUsageFlags.keyAgreement, "Key agreement"],
  [KeyUsageFlags.keyCertSign, "Certificate signing"],
  [KeyUsageFlags.cRLSign, "CRL signing"],
  [KeyUsageFlags.encipherOnly, "Encipher only"],
  [KeyUsageFlags.decipherOnly, "Decipher only"],
];

const EXTENDED_KEY_USAGE_LABELS: Record<string, string> = {
  [ExtendedKeyUsage.serverAuth]: "TLS web server authentication",
  [ExtendedKeyUsage.clientAuth]: "TLS web client authentication",
  [ExtendedKeyUsage.codeSigning]: "Code signing",
  [ExtendedKeyUsage.emailProtection]: "Email protection",
  [ExtendedKeyUsage.timeStamping]: "Time stamping",
  [ExtendedKeyUsage.ocspSigning]: "OCSP signing",
};

export const certificateExample = `-----BEGIN CERTIFICATE-----
MIIDvjCCAqagAwIBAgIUFng6k8wVULuBJgz+FT2lSw6rbeQwDQYJKoZIhvcNAQEL
BQAwPDEYMBYGA1UEAwwPbG9jYWxmb3JnZS50ZXN0MRMwEQYDVQQKDApMb2NhbEZv
cmdlMQswCQYDVQQGEwJVUzAeFw0yNjA0MjMyMDAwMDhaFw0yNjA1MjMyMDAwMDha
MDwxGDAWBgNVBAMMD2xvY2FsZm9yZ2UudGVzdDETMBEGA1UECgwKTG9jYWxGb3Jn
ZTELMAkGA1UEBhMCVVMwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDS
wpFdAuqKhGwWhKEvTa//2r5ZpZVtTYHmJox/JUURwzZ1KDPaaVepnr7P4lu6WXhD
yM/n4W5B2MYoGHUOR+MBbDey9Q8z0CTQt8LXQZipUDWJz7xxCH40SYP9t5zTKGwq
T8wXztG9VFEkbLoBVeqq2CnMkcFaHBKuZshJAdt5j6cQmnR3/fnmLUqJ/pqc0xCy
ut/12clX2SdM1x4krbSsNcuueHb6wyWiNwH5MEPoZ0zKYHQfuU6i+UwXfU6Hv9DG
sllB1QqIpG4cVF/bTfDa3NMxm9jpnjd0Qx1rtJIPxnGWCZgSXW783W68F1zwcpI7
AvIz5u01MJHPyji00PenAgMBAAGjgbcwgbQwHQYDVR0OBBYEFBuHeTqMv/9+Bz3C
z9pEKLGkOcHaMB8GA1UdIwQYMBaAFBuHeTqMv/9+Bz3Cz9pEKLGkOcHaMA8GA1Ud
EwEB/wQFMAMBAf8wNQYDVR0RBC4wLIIPbG9jYWxmb3JnZS50ZXN0ghN3d3cubG9j
YWxmb3JnZS50ZXN0hwR/AAABMAsGA1UdDwQEAwIFoDAdBgNVHSUEFjAUBggrBgEF
BQcDAQYIKwYBBQUHAwIwDQYJKoZIhvcNAQELBQADggEBAKQeZoIpgSSsQdhDZ/XW
LdnnxVDIrhowL4qjaK8TnnrvC8Z3CsM8vrvj2VaDWDCNQ28C/ZY+oUI9XAQfz/8H
J2Eh0ET6Vn3e7oX/FOw6Ji/odvKXLgwWiHHqwIIiadPyVCtXq4o1uytrnD2DWnqT
t7YfXdCMxKmq8qvIQbrZFtkETYUpMDldplgROdKSAwMpzcRUJGZxYUs8ADmhbIgn
cIC3GpdlU378LAk50OcGAYV0W5VPV8El/vplVIYKa+hYzL/XfEpljCKQB0QRBP8F
OkZYTlL0mRBhmzF/k0nnvELapfwhheTHoYc2Ra35OgcMvHMuShl3xT1zxvozAKqo
cIA=
-----END CERTIFICATE-----`;

const bufferToHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer), (byte) =>
    byte.toString(16).padStart(2, "0")
  )
    .join(":")
    .toUpperCase();

const splitPemCertificates = (input: string): string[] => {
  const matches = input.match(PEM_CERT_REGEX);
  return matches && matches.length > 0 ? matches : [input.trim()];
};

const parseDistinguishedName = (value: string): CertificateNamePart[] =>
  value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separatorIndex = part.indexOf("=");
      if (separatorIndex === -1) {
        return { key: "Name", value: part };
      }
      return {
        key: part.slice(0, separatorIndex).trim(),
        value: part.slice(separatorIndex + 1).trim(),
      };
    });

const getSubjectAlternativeNames = (cert: X509Certificate): string[] => {
  const extension = cert.getExtension(SubjectAlternativeNameExtension);
  return (
    extension?.names.items.map((name) => `${name.type}:${name.value}`) ?? []
  );
};

const getKeyUsage = (cert: X509Certificate): string[] => {
  const extension = cert.getExtension(KeyUsagesExtension);
  if (!extension) {
    return [];
  }

  const hasFlag = (flag: KeyUsageFlags) =>
    Math.trunc(extension.usages / flag) % 2 === 1;

  return KEY_USAGE_LABELS.filter(([flag]) => hasFlag(flag)).map(
    ([, label]) => label
  );
};

const getExtendedKeyUsage = (cert: X509Certificate): string[] => {
  const extension = cert.getExtension(ExtendedKeyUsageExtension);
  return (
    extension?.usages.map(
      (usage) => EXTENDED_KEY_USAGE_LABELS[String(usage)] ?? String(usage)
    ) ?? []
  );
};

const getBasicConstraints = (cert: X509Certificate) => {
  const extension = cert.getExtension(BasicConstraintsExtension);
  return extension
    ? { ca: extension.ca, pathLength: extension.pathLength }
    : null;
};

const getAlgorithmName = (algorithm: unknown): string => {
  if (typeof algorithm === "object" && algorithm && "name" in algorithm) {
    return String((algorithm as { name?: unknown }).name ?? "Unknown");
  }
  return "Unknown";
};

const parseCertificate = async (
  input: string,
  now: Date
): Promise<ParsedCertificate> => {
  const cert = new X509Certificate(input);
  const notBefore = cert.notBefore;
  const notAfter = cert.notAfter;
  const sha1 = await cert.getThumbprint("SHA-1");
  const sha256 = await cert.getThumbprint("SHA-256");

  return {
    basicConstraints: getBasicConstraints(cert),
    daysRemaining: Math.ceil((notAfter.getTime() - now.getTime()) / 86_400_000),
    extendedKeyUsage: getExtendedKeyUsage(cert),
    fingerprints: {
      sha1: bufferToHex(sha1),
      sha256: bufferToHex(sha256),
    },
    isExpired: now > notAfter,
    isNotYetValid: now < notBefore,
    issuer: parseDistinguishedName(cert.issuer),
    keyAlgorithm: getAlgorithmName(cert.publicKey.algorithm),
    keyUsage: getKeyUsage(cert),
    notAfter: notAfter.toISOString(),
    notBefore: notBefore.toISOString(),
    publicKeyAlgorithm: getAlgorithmName(cert.publicKey.algorithm),
    san: getSubjectAlternativeNames(cert),
    serialNumber: cert.serialNumber,
    signatureAlgorithm: getAlgorithmName(cert.signatureAlgorithm),
    subject: parseDistinguishedName(cert.subject),
  };
};

export const parseCertificates = async (
  input: string,
  now = new Date()
): Promise<CertificateParseResult> => {
  if (!input.trim()) {
    return {
      certificates: [],
      error: "Paste one or more PEM certificates",
      success: false,
    };
  }

  try {
    const certificates = await Promise.all(
      splitPemCertificates(input).map((certInput) =>
        parseCertificate(certInput, now)
      )
    );

    return { certificates, success: true };
  } catch (error) {
    return {
      certificates: [],
      error:
        error instanceof Error
          ? `Could not parse certificate: ${error.message}`
          : "Could not parse certificate",
      success: false,
    };
  }
};
