module.exports = {
  compiler: {
    styledComponents: true,
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
