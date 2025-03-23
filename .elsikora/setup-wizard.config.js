export default {
	ci: {
		isEnabled: true,
		isNpmPackage: true,
		moduleProperties: {
			dependabot: {
				devBranchName: "dev",
			},
			"release-npm": {
				isPrerelease: true,
				mainBranch: "main",
				preReleaseBranch: "dev",
			},
		},
		modules: ["codecommit-sync", "dependabot", "qodana", "release-npm", "snyk"],
		provider: "GitHub",
	},
	commitlint: {
		isEnabled: true,
	},
	eslint: {
		features: ["sonar", "unicorn", "perfectionist", "jsdoc", "javascript", "typescript", "json", "yaml", "checkFile", "packageJson", "markdown", "nest", "node", "regexp", "prettier", "stylistic", "noSecrets"],
		isEnabled: true,
	},
	gitignore: {
		isEnabled: true,
	},
	ide: {
		isEnabled: false,
	},
	license: {
		author: "ElsiKora",
		isEnabled: true,
		license: "MIT",
		year: 2025,
	},
	"lint-staged": {
		features: ["eslint", "prettier"],
		isEnabled: true,
	},
	prettier: {
		isEnabled: true,
	},
	"semantic-release": {
		developBranch: "dev",
		isBackmergeEnabled: true,
		isEnabled: true,
		isPrereleaseEnabled: true,
		mainBranch: "main",
		preReleaseBranch: "dev",
		preReleaseChannel: "beta",
		repositoryUrl: "git@github.com:ElsiKora/NestJS-AWS-Parameter-Store-Config",
	},
	stylelint: {
		isEnabled: false,
	},
};
