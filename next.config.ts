import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer must run as a plain Node dependency —
  // bundling it breaks its font/layout engine.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
