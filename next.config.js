/** @type {import('next').NextConfig} */
const nextConfig = {
    // Lets next/image load photos stored in Supabase Storage (fetched server-side).
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: '**.supabase.co' },
      ],
    },
  
    // Forwards browser requests for /supabase-proxy/* to Supabase from the server,
    // so visitors on ISPs that DNS-block *.supabase.co can still load data.
    async rewrites() {
      return [
        {
          source: '/supabase-proxy/:path*',
          destination: 'https://blenhixylcitexupwrxm.supabase.co/:path*',
        },
      ];
    },
  };
  
  module.exports = nextConfig;