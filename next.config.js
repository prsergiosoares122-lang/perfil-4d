/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! ATENÇÃO: Isso desativa a verificação de tipos no build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Isso desativa o lint no build
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig