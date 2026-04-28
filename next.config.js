const withPWA = require('next-pwa')({
  dest: 'public',
  disable: true,
  register: false,
  skipWaiting: true,
})

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [],
  },
}

module.exports = withPWA(nextConfig)
