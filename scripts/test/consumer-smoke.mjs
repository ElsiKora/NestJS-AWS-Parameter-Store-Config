#!/usr/bin/env node
/**
 * Consumer smoke test for the packed package.
 *
 * Packs the built package and installs the tarball with the peer stack into a temporary project.
 * It first checks that importing the package (ESM import and CommonJS require) prints nothing and
 * leaves process.env alone even with a .env file in the working directory. Then, for every consumer
 * in test/consumer (ESM bundler, ESM nodenext, and CommonJS node10 and default resolution through
 * require(esm)), it typechecks the shared app in test/consumer/app/src and runs it: the app starts and
 * closes a Nest 12 application context with register and registerAsync against a local SSM stub.
 *
 * Flags: --skip-build reuses the current dist, --keep leaves the temporary project in place.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CONSUMER_ROOT = path.join(ROOT, "test/consumer");
const PACKAGE_NAME = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8")).name;

const CONSUMERS = [
	{ name: "bundler", type: "module" },
	{ name: "nodenext", type: "module" },
	{ name: "commonjs", type: "commonjs" },
	// The Core and Gameport shape: module commonjs without moduleResolution, which TypeScript 6 resolves as bundler
	{ name: "commonjs-default", type: "commonjs" },
];
const STACK = ["@aws-sdk/client-ssm", "@nestjs/common", "@nestjs/core", "@types/node", "reflect-metadata", "rxjs", "typescript"];

const IMPORT_CHECKS = [
	{ arguments_: ["--input-type=module", "--eval", `await import(${JSON.stringify(PACKAGE_NAME)}); console.log(JSON.stringify(process.env.SMOKE_DOTENV ?? null));`], name: "esm import" },
	{ arguments_: ["--input-type=commonjs", "--eval", `require(${JSON.stringify(PACKAGE_NAME)}); console.log(JSON.stringify(process.env.SMOKE_DOTENV ?? null));`], name: "commonjs require" },
];
const ARGS = new Set(process.argv.slice(2));

/**
 * Runs a command with inherited output and fails the smoke when it exits non-zero.
 * @param {string} command - Executable.
 * @param {Array<string>} commandArguments - Arguments.
 * @param {{ cwd: string }} options - Working directory.
 * @returns {void}
 */
function run(command, commandArguments, options) {
	process.stdout.write(`$ ${command} ${commandArguments.join(" ")}\n`);
	execFileSync(command, commandArguments, { cwd: options.cwd, stdio: "inherit" });
}

/**
 * Builds the temporary project manifest: the tarball plus the stack versions the repository tests with.
 * @param {string} tarball - Absolute tarball path.
 * @returns {string} The manifest JSON.
 */
function createManifest(tarball) {
	const repositoryManifest = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8"));
	const dependencies = { [PACKAGE_NAME]: `file:${tarball}` };

	for (const name of STACK) {
		const version = repositoryManifest.devDependencies[name];

		if (!version) {
			throw new Error(`The repository has no devDependency ${name} to pin the consumer stack to`);
		}

		dependencies[name] = version;
	}

	return JSON.stringify({ dependencies, name: "parameter-store-config-consumer-smoke", private: true }, undefined, "\t");
}

/**
 * Imports the package in a fresh process next to a .env file and checks that the import prints nothing and loads no variables.
 * @param {string} directory - Directory with the installed package and the .env file.
 * @param {{ arguments_: Array<string>, name: string }} check - The Node.js arguments for one module system.
 * @returns {void}
 */
function checkSilentImport(directory, check) {
	const result = spawnSync(process.execPath, check.arguments_, { cwd: directory, encoding: "utf8" });

	if (result.status !== 0 || result.stderr !== "" || result.stdout !== "null\n") {
		throw new Error(`${check.name} of ${PACKAGE_NAME} is not silent: exit ${String(result.status)}, stdout ${JSON.stringify(result.stdout)}, stderr ${JSON.stringify(result.stderr)}`);
	}

	process.stdout.write(`PASS ${check.name} prints nothing and loads no .env\n`);
}

const workDirectory = mkdtempSync(path.join(tmpdir(), "parameter-store-config-consumer-"));
let failed = false;

try {
	if (!ARGS.has("--skip-build")) {
		run("npm", ["run", "build"], { cwd: ROOT });
	}

	run("npm", ["pack", "--pack-destination", workDirectory], { cwd: ROOT });

	const tarball = path.join(
		workDirectory,
		readdirSync(workDirectory).find((file) => file.endsWith(".tgz")),
	);

	writeFileSync(path.join(workDirectory, "package.json"), createManifest(tarball));
	run("npm", ["install", "--no-audit", "--no-fund", "--loglevel=error"], { cwd: workDirectory });
	writeFileSync(path.join(workDirectory, ".env"), "SMOKE_DOTENV=loaded\n");
	process.stdout.write(`\n=== import side effects (Node.js ${process.version}) ===\n`);

	for (const check of IMPORT_CHECKS) {
		checkSilentImport(workDirectory, check);
	}

	for (const consumer of CONSUMERS) {
		const consumerDirectory = path.join(workDirectory, consumer.name);

		cpSync(path.join(CONSUMER_ROOT, "app/src"), path.join(consumerDirectory, "src"), { recursive: true });
		cpSync(path.join(CONSUMER_ROOT, consumer.name, "tsconfig.json"), path.join(consumerDirectory, "tsconfig.json"));
		writeFileSync(path.join(consumerDirectory, "package.json"), JSON.stringify({ name: `consumer-${consumer.name}`, private: true, type: consumer.type }));

		try {
			process.stdout.write(`\n=== consumer ${consumer.name} (${consumer.type}, Node.js ${process.version}) ===\n`);
			run(process.execPath, [path.join(workDirectory, "node_modules/typescript/bin/tsc"), "-p", "tsconfig.json"], { cwd: consumerDirectory });
			run(process.execPath, ["dist/main.js"], { cwd: consumerDirectory });
		} catch {
			failed = true;
			process.stdout.write(`consumer ${consumer.name} FAILED\n`);
		}
	}
} catch (error) {
	failed = true;
	process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
} finally {
	if (ARGS.has("--keep")) {
		process.stdout.write(`Kept ${workDirectory}\n`);
	} else {
		rmSync(workDirectory, { force: true, recursive: true });
	}
}

process.exitCode = failed ? 1 : 0;
