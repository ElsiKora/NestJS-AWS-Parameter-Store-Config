import type { DynamicModule, INestApplicationContext } from "@nestjs/common";

import assert from "node:assert/strict";

import { NestFactory } from "@nestjs/core";

import { AppModule, DatabaseSettings } from "./module.js";
import { type ISsmStub, startSsmStub } from "./ssm-stub.js";

import "reflect-metadata";

/**
 * Starts a Nest 12 application with the module, checks the loaded values and the SSM calls, and closes it.
 * @param {string} name - Scenario name.
 * @param {(endpoint: string) => DynamicModule} createModule - Builds the application module for the stub endpoint.
 * @returns {Promise<void>}
 */
async function runScenario(name: string, createModule: (endpoint: string) => DynamicModule): Promise<void> {
	const stub: ISsmStub = await startSsmStub();

	try {
		const app: INestApplicationContext = await NestFactory.createApplicationContext(createModule(stub.endpoint), { abortOnError: false, logger: false });
		const settings: DatabaseSettings = app.get(DatabaseSettings);

		assert.equal(settings.host, "db.internal");
		assert.equal(settings.password, "decrypted-secret");
		assert.equal(settings.redisUrl, "redis://cache");
		assert.deepEqual(stub.requests, [
			{ Path: "/smoke/test", Recursive: true, WithDecryption: true },
			{ NextToken: "page-2", Path: "/smoke/test", Recursive: true, WithDecryption: true },
		]);

		await app.close();
		process.stdout.write(`PASS ${name}\n`);
	} finally {
		await stub.close();
	}
}

// No top-level await: the commonjs consumer compiles this file to CommonJS
void (async () => {
	await runScenario("register", (endpoint: string) => AppModule.withRegister(endpoint));
	await runScenario("registerAsync", (endpoint: string) => AppModule.withRegisterAsync(endpoint));
})().catch((error: unknown) => {
	process.stderr.write(`${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`);
	process.exitCode = 1;
});
