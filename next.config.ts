import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "ivory-bitter-gerbil-665.mypinata.cloud" },
    ],
  },
};

export default nextConfig;
