import type { MetadataRoute } from "next";
import { buildManifest } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return buildManifest();
}
