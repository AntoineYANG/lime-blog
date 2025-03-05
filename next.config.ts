import type { NextConfig } from "next";
import NextMDX from "@next/mdx";


const withMDX = NextMDX({
  extension: /\.mdx?$/,
});

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
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


export default withMDX(nextConfig);
