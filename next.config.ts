/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["jspdf"],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.cdiscount.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "ci.jumia.is" },
      { protocol: "https", hostname: "images.squarespace-cdn.com" },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/domw8nvul/**", // scope it to your account
      },
    ],
  },
};

module.exports = nextConfig;