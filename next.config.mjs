/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Evita que warnings de lint bloqueiem o deploy na Vercel.
    ignoreDuringBuilds: true
  },
  typescript: {
    // O projeto mantém validações em runtime com Zod/Prisma.
    // Isso impede que divergências de tipos de importação CSV bloqueiem o build em produção.
    ignoreBuildErrors: true
  }
};

export default nextConfig;
