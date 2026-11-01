import { defineConfig } from "vitest/config";

export default defineConfig({
	publicDir: false,
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		coverage: {
			exclude: ["**/interface/**", "**/index.ts"],
			include: ["src/**/*"],
			provider: "v8",
			reporter: ["text", "json", "html"],
		},
		environment: "node",
		include: ["test/unit/**/*.test.ts"],
		root: ".",
		watch: false,
	},
});
