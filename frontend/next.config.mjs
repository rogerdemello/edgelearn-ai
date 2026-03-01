import path from 'path'
import { fileURLToPath } from 'url'
import { config as loadEnv } from 'dotenv'

// Load project root .env (edgelearn-ai/.env) so one file is used everywhere
const __dirname = path.dirname(fileURLToPath(import.meta.url))
loadEnv({ path: path.resolve(__dirname, '../.env') })

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Optional: configure rewrites for API proxy
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : 'http://localhost:8000/api/:path*',
      },
    ]
  },
}

export default nextConfig
