import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',   // produces a static `out/` folder — open directly in browser, no server needed
  trailingSlash: true, // ensures links work when opening index.html from disk
};

export default nextConfig;
