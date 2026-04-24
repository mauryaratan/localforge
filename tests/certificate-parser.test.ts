// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  certificateExample,
  parseCertificates,
} from "@/lib/certificate-parser";

const FINGERPRINT_REGEX = /^[A-F0-9:]+$/;

describe("parseCertificates", () => {
  it("parses PEM certificate details", async () => {
    const result = await parseCertificates(
      certificateExample,
      new Date("2026-04-24T00:00:00.000Z")
    );

    expect(result.success).toBe(true);
    expect(result.certificates).toHaveLength(1);
    expect(result.certificates[0].subject).toEqual(
      expect.arrayContaining([
        { key: "CN", value: "localforge.test" },
        { key: "O", value: "LocalForge" },
      ])
    );
    expect(result.certificates[0].san).toEqual(
      expect.arrayContaining([
        "dns:localforge.test",
        "dns:www.localforge.test",
        "ip:127.0.0.1",
      ])
    );
    expect(result.certificates[0].keyUsage).toEqual(
      expect.arrayContaining(["Digital signature", "Key encipherment"])
    );
    expect(result.certificates[0].fingerprints.sha256).toMatch(
      FINGERPRINT_REGEX
    );
  });

  it("returns an error for invalid input", async () => {
    const result = await parseCertificates("not a cert");

    expect(result.success).toBe(false);
    expect(result.error).toContain("Could not parse certificate");
  });

  it("returns a helpful error for empty input", async () => {
    const result = await parseCertificates("");

    expect(result.success).toBe(false);
    expect(result.error).toContain("Paste one or more");
  });
});
