/** @type {import('next').NextConfig} */
import withPWAConstructor from "next-pwa";

const withPWA = withPWAConstructor({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false,
});

const nextConfig = withPWA({
  // your next.js config
});

export default nextConfig;
