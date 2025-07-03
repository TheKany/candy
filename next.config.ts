// next.config.js
const nextConfig = {
  reactStrictMode: false, 
  compiler: {
    styledComponents: true,
    removeConsole: process.env.NODE_ENV === "production",
  },
   experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

module.exports = nextConfig;
