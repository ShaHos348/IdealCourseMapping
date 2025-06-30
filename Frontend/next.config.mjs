const nextConfig = {
  output: 'export',
  basePath: '/demos/ideal-course-mapping',
  assetPrefix: '/demos/ideal-course-mapping/',
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, 
  },
};

export default nextConfig;