/** @type {import('next').NextConfig} */
const config = {
  // Custom server — do not use `output: 'standalone'`
  async headers() {
    return [
      {
        source: '/opengraph-image(.*)',
        headers: [{ key: 'cross-origin-resource-policy', value: 'cross-origin' }],
      },
      {
        source: '/api/og(.*)',
        headers: [{ key: 'cross-origin-resource-policy', value: 'cross-origin' }],
      },
    ]
  },
}

export default config
