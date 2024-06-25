module.exports = {
  compiler: {
    styledComponents: true,
  },
  eslint: {
    // Ignores linting for builds and only enable it for development
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const destinationUrl = process.env.NEXT_PUBLIC_SECURITY_BC_URL;

    if (!destinationUrl) {
      throw new Error("The NEXT_PUBLIC_SECURITY_BC_URL environment variable is not defined.");
    }

    return [
      {
        source: "/api/:path*",
        destination: `${destinationUrl}/:path*`,
      },
    ];
  },
};
