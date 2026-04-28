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
// cache bust Tue Apr 28 16:49:44 CDT 2026
