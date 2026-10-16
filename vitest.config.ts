import { defineConfig, mergeConfig } from "vitest/config"

import viteConfig from "./vite.config.ts"

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			env: {
				TZ: "America/New_York",
				VITE_BACKEND_API_ROOT: "http://api.test",
			},
			environment: "jsdom",
			include: ["src/**/*.test.{ts,tsx}"],
			setupFiles: ["src/test/setup.ts"],
		},
	})
)
