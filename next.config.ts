/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["jspdf"],
  reactStrictMode: true,
  images: {
    domains: [
      "www.cdiscount.com",
      "m.media-amazon.com",
      "ci.jumia.is",
      "images.squarespace-cdn.com",
      "res.cloudinary.com"
    ],
  },
};

module.exports = nextConfig;
