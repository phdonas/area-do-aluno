import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/ferramentas/playbook-iniciais/:path*",
        destination: "/ferramentas/mpc-playbook-iniciais/:path*",
      },
      {
        source: "/ferramentas/playbook-completo/:path*",
        destination: "/ferramentas/mpc-playbook-completo/:path*",
      },
    ];
  },
};

export default nextConfig;
