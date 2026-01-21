/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "www.cdiscount.com",
      "m.media-amazon.com",
      "ci.jumia.is",
      "images.squarespace-cdn.com"
    ],
  },
};

module.exports = nextConfig;
