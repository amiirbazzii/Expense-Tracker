/** @type {import('next').NextConfig} */
import withPWAConstructor from "next-pwa";

const withPWA = withPWAConstructor({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

import path from "path";

const nextConfig = withPWA({
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(process.cwd(), "src");
    return config;
  },
});

export default nextConfig;
