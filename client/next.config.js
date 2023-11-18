/** @type {import('next').NextConfig} */
const nextConfig = {
    // env: {
    //     NEXT_PUBLIC_SERVER_BASE_URL: process.env.NEXT_PUBLIC_SERVER_BASE_URL
    // },
    images: {
        remotePatterns: [
            {
                hostname: "images.unsplash.com",
                protocol: "https"
            }
        ]
    }
}

module.exports = nextConfig
