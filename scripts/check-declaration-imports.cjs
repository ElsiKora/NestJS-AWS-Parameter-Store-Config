#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const { builtinModules } = require("node:module");
const path = require("node:path");

const outputRoot = path.resolve("dist");
const manifest = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf8"));
const runtimePackages = new Set([...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.peerDependencies ?? {})]);
const builtins = new Set(builtinModules);
// Specifiers in `from "..."`, `import("...")`, side-effect `import "..."` and `require("...")` forms
const specifierPattern = /(?:\bfrom\s+|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*)["']([^"']+)["']/g;
// JSDoc and line comments carry example imports that are not part of the module graph
const commentLinePattern = /^\s*(?:\*|\/\/|\/\*)/;
const exportKeysCache = new Map();
const problems = [];

/**
 * Splits a bare specifier into its package name and its subpath.
 * @param {string} specifier - Bare specifier, for example `@nestjs/common/interfaces`.
 * @returns {{ name: string, subpath: string }} The package name and the subpath (`.` for the package root).
 */
function parseBareSpecifier(specifier) {
	const parts = specifier.split("/");
	const nameLength = specifier.startsWith("@") ? 2 : 1;

	return { name: parts.slice(0, nameLength).join("/"), subpath: parts.length > nameLength ? `./${parts.slice(nameLength).join("/")}` : "." };
}

/**
 * Returns the explicit `exports` keys of an installed package; wildcard keys are left out.
 * @param {string} name - Package name.
 * @returns {Set<string> | undefined} The explicit keys, or undefined when the package has no `exports` map.
 */
function getExplicitExportKeys(name) {
	if (!exportKeysCache.has(name)) {
		const packageManifest = JSON.parse(fs.readFileSync(path.resolve("node_modules", name, "package.json"), "utf8"));
		const { exports: exportMap } = packageManifest;
		let keys;

		if (typeof exportMap === "string" || Array.isArray(exportMap)) {
			keys = new Set(["."]);
		} else if (exportMap && typeof exportMap === "object") {
			const entries = Object.keys(exportMap);
			// An exports object without "./" keys is a conditions object for the root entry
			keys = new Set(entries.some((key) => key.startsWith(".")) ? entries.filter((key) => !key.includes("*")) : ["."]);
		}

		exportKeysCache.set(name, keys);
	}

	return exportKeysCache.get(name);
}

/**
 * Checks one relative specifier: it needs a `.js` extension and a file it resolves to.
 * @param {string} filePath - File that holds the specifier.
 * @param {string} specifier - Relative specifier.
 * @returns {string | undefined} The problem, or undefined when the specifier is valid.
 */
function checkRelativeSpecifier(filePath, specifier) {
	// A declaration resolves "./x.js" to "./x.d.ts"; type-only modules have no .js output
	const target = filePath.endsWith(".d.ts") ? specifier.replace(/\.js$/, ".d.ts") : specifier;

	if (!specifier.endsWith(".js")) {
		return "relative import without a .js extension";
	}

	if (!fs.existsSync(path.resolve(path.dirname(filePath), target))) {
		return "relative import without a matching file";
	}
}

/**
 * Checks one bare specifier: the package must be a dependency or peer and a subpath must be an explicit `exports` key.
 * @param {string} specifier - Bare specifier.
 * @returns {string | undefined} The problem, or undefined when the specifier is valid.
 */
function checkBareSpecifier(specifier) {
	if (specifier.startsWith("node:") || builtins.has(specifier)) {
		return;
	}

	const { name, subpath } = parseBareSpecifier(specifier);

	if (!runtimePackages.has(name)) {
		return `${name} is not in dependencies or peerDependencies`;
	}

	if (subpath === ".") {
		return;
	}

	const keys = getExplicitExportKeys(name);

	if (!keys?.has(subpath)) {
		return `subpath ${subpath} is not an explicit key in the exports of ${name}`;
	}
}

/**
 * Scans the build output and records every invalid import.
 * @param {string} directoryPath - Directory to scan.
 * @returns {void}
 */
function scanDirectory(directoryPath) {
	for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
		const entryPath = path.join(directoryPath, entry.name);

		if (entry.isDirectory()) {
			scanDirectory(entryPath);
			continue;
		}

		if (!entry.name.endsWith(".d.ts") && !entry.name.endsWith(".js")) {
			continue;
		}

		const relativePath = path.relative(process.cwd(), entryPath);
		const fileContent = fs.readFileSync(entryPath, "utf8");

		if (fileContent.includes("node_modules/")) {
			problems.push(`${relativePath}: path into node_modules`);
		}

		for (const line of fileContent.split("\n")) {
			if (commentLinePattern.test(line)) {
				continue;
			}

			for (const [, specifier] of line.matchAll(specifierPattern)) {
				const problem = specifier.startsWith(".") ? checkRelativeSpecifier(entryPath, specifier) : checkBareSpecifier(specifier);

				if (problem) {
					problems.push(`${relativePath}: "${specifier}": ${problem}`);
				}
			}
		}
	}
}

if (!fs.existsSync(outputRoot)) {
	process.stderr.write(`Build output does not exist: ${outputRoot}\n`);
	process.exit(1);
}

scanDirectory(outputRoot);

if (problems.length > 0) {
	process.stderr.write(`Build output has invalid imports:\n${problems.map((problem) => `- ${problem}`).join("\n")}\n`);
	process.exit(1);
}

process.stdout.write("Every relative import in dist has a .js extension and a matching file, and every bare import is a dependency or peer root or an explicit exports key.\n");
