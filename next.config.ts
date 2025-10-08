import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Optimize output and enable lazy loading features
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  
  // Enable React strict mode for better error detection
  reactStrictMode: true,
};

export default nextConfig;
