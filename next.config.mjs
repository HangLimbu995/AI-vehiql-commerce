/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['flwbougauwelghyptzvi.supabase.co']
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
          config.resolve.fallback = {
            ...config.resolve.fallback,
            worker_threads: false,
            fs: false,
            net: false,
            tls: false,
          };
        }
        return config;
      },
};

export default nextConfig;
