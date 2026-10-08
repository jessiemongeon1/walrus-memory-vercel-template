import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Walrus Memory SDK is a server-only dependency; keep it out of the
  // client bundle and let Next trace its Node built-in usage.
  serverExternalPackages: ["@mysten-incubation/memwal"],
};

export default nextConfig;
