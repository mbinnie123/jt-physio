import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "static.wixstatic.com" },
      { protocol: "https", hostname: "images.wixstatic.com" },
      { protocol: "https", hostname: "static.wixstatic.com", pathname: "/media/**" },
    ],
  },
};

export default nextConfig;
