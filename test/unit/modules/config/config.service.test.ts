import type { Parameter } from "@aws-sdk/client-ssm";
import type { IParameterStoreConfigProperties } from "@shared/interface/config";

import { ParameterStoreConfigService } from "@modules/config";
import { EEnvironment, ENamespace } from "@shared/enum";
import { describe, expect, it } from "vitest";

const DEFAULTS: IParameterStoreConfigProperties = {
	application: "reverse-proxy",
	environment: EEnvironment.PRODUCTION,
	instanceName: "main",
	namespace: ENamespace.POSTGRES,
};

const PARAMETERS: Array<Parameter> = [
	{ Name: "/reverse-proxy/production/postgres/main/host", Value: "db.internal" },
	{ Name: "/reverse-proxy/production/postgres/replica/host", Value: "replica.internal" },
	{ Name: "/billing/staging/redis/cache/connection/url", Value: "redis://cache" },
];

/**
 * Creates the service over the fixed parameters.
 * @param {Partial<IParameterStoreConfigProperties>} properties - Overrides of the module defaults.
 * @returns {ParameterStoreConfigService} The service.
 */
function createService(properties: Partial<IParameterStoreConfigProperties> = {}): ParameterStoreConfigService {
	return new ParameterStoreConfigService({ ...DEFAULTS, ...properties }, PARAMETERS);
}

describe("ParameterStoreConfigService", () => {
	it("reads a parameter from the module defaults and the path", () => {
		expect(createService().get({ path: ["host"] })).toBe("db.internal");
	});

	it("lets every lookup override a module default", () => {
		expect(createService().get({ instanceName: "replica", path: ["host"] })).toBe("replica.internal");
		expect(createService().get({ application: "billing", environment: EEnvironment.STAGING, instanceName: "cache", namespace: ENamespace.REDIS, path: ["connection", "url"] })).toBe("redis://cache");
	});

	it("trims segments before building the path", () => {
		expect(createService({ application: " reverse-proxy " }).get({ path: [" host "] })).toBe("db.internal");
	});

	it("returns null for a parameter that was not loaded", () => {
		expect(createService().get({ path: ["port"] })).toBeNull();
	});

	it("refuses an empty or missing path", () => {
		const service: ParameterStoreConfigService = createService();

		expect(() => service.get({ path: [] })).toThrow("Parameter Store path must be a non-empty string array.");
		expect(() => service.get({} as never)).toThrow("Parameter Store path must be a non-empty string array.");
	});

	it("refuses segments that are blank, not strings or contain a slash", () => {
		const service: ParameterStoreConfigService = createService();

		expect(() => service.get({ path: ["  "] })).toThrow("Parameter Store path[0] must be a non-empty string.");
		expect(() => service.get({ path: ["host", 1 as never] })).toThrow(new TypeError("Parameter Store path[1] must be a string."));
		expect(() => service.get({ namespace: "a/b", path: ["host"] })).toThrow('Parameter Store namespace must not contain "/".');
	});

	it("refuses a module default that is missing", () => {
		expect(() => createService({ instanceName: undefined as never }).get({ path: ["host"] })).toThrow("Parameter Store instanceName is required.");
	});
});
