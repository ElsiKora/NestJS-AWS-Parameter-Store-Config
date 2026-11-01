import type { IParameterStoreConfigProperties } from "@shared/interface/config";

import { SSMClient } from "@aws-sdk/client-ssm";
import { ParameterStoreConfigSSMProvider } from "@shared/provider/config";
import { afterEach, describe, expect, it, vi } from "vitest";

const PROPERTIES: IParameterStoreConfigProperties = { application: "app", environment: "test", instanceName: "main", namespace: "postgres" };

describe("ParameterStoreConfigSSMProvider", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("creates the SSM client from the configured client options", async () => {
		vi.stubEnv("AWS_REGION", "us-east-2");
		const client: SSMClient = ParameterStoreConfigSSMProvider.useFactory({ ...PROPERTIES, config: { maxAttempts: 7, region: "eu-south-2" } }) as SSMClient;

		expect(client).toBeInstanceOf(SSMClient);
		await expect(client.config.region()).resolves.toBe("eu-south-2");
		await expect(client.config.maxAttempts()).resolves.toBe(7);
	});

	it("falls back to the AWS SDK defaults without client options", async () => {
		vi.stubEnv("AWS_REGION", "us-east-2");
		const client: SSMClient = ParameterStoreConfigSSMProvider.useFactory(PROPERTIES) as SSMClient;

		await expect(client.config.region()).resolves.toBe("us-east-2");
	});
});
