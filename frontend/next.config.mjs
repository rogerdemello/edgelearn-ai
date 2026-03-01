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
}

export default nextConfig
