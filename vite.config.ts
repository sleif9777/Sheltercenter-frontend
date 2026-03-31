import tailwind from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { config } from "dotenv"
import { defineConfig } from "vite"

config()

export default defineConfig({
	plugins: [react(), tailwind()],
	server: {
		allowedHosts: ["savinggracencscheduler.com"],
	},
})