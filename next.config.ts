import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Que `next dev` no cree AGENTS.md ni CLAUDE.md en la raíz.
  agentRules: false,
};

export default nextConfig;
