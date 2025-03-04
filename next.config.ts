import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  /** @type {import('next').NextConfig} */
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.externals.push("duckdb");
  //   }
  //   return config;
  // },
  experimental: {
    // serverActions: true,
  },
};


export default nextConfig;
