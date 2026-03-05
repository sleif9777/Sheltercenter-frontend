import tailwind from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { config } from "dotenv"
import { defineConfig } from "vite"

// Load environment variables from .env file
config()

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwind()],
})
