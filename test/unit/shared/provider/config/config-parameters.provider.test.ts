import type { ParameterStoreService } from "@modules/aws/parameter-store";
import type { IParameterStoreConfigProperties } from "@shared/interface/config";

import { ParameterStoreConfigParametersProvider } from "@shared/provider/config";
import { describe, expect, it, vi } from "vitest";

const PROPERTIES: IParameterStoreConfigProperties = { application: "app", environment: "test", instanceName: "main", namespace: "postgres" };

/**
 * Runs the provider factory with a stubbed ParameterStoreService.
 * @param {Partial<IParameterStoreConfigProperties>} properties - Overrides of the module properties.
 * @returns {{ getParametersByPath: ReturnType<typeof vi.fn>, result: Promise<unknown> }} The service mock and the factory result.
 */
function load(properties: Partial<IParameterStoreConfigProperties>): { getParametersByPath: ReturnType<typeof vi.fn>; result: Promise<unknown> } {
	const getParametersByPath: ReturnType<typeof vi.fn> = vi.fn().mockResolvedValue([]);
	const service: ParameterStoreService = { getParametersByPath } as unknown as ParameterStoreService;

	return { getParametersByPath, result: ParameterStoreConfigParametersProvider.useFactory({ ...PROPERTIES, ...properties }, service) as Promise<unknown> };
}

describe("ParameterStoreConfigParametersProvider", () => {
	it("loads the application and environment prefix with the default options", async () => {
		const { getParametersByPath, result } = load({ application: " app ", environment: " test " });

		await expect(result).resolves.toEqual([]);
		expect(getParametersByPath).toHaveBeenCalledWith("/app/test", false, true, false);
	});

	it("passes decryption, recursion and verbosity through", async () => {
		const { getParametersByPath, result } = load({ isVerbose: true, shouldDecryptParameters: true, shouldUseRecursiveLoading: false });

		await result;
		expect(getParametersByPath).toHaveBeenCalledWith("/app/test", true, false, true);
	});

	it.each([
		[{ application: 1 as never }, "Parameter Store application must be a string."],
		[{ environment: undefined as never }, "Parameter Store environment must be a string."],
		[{ application: " " }, "Parameter Store application is required."],
		[{ environment: "" }, "Parameter Store environment is required."],
		[{ application: "a/b" }, 'Parameter Store application must not contain "/".'],
		[{ environment: "a/b" }, 'Parameter Store environment must not contain "/".'],
	])("refuses %o", async (properties: Partial<IParameterStoreConfigProperties>, message: string) => {
		const { getParametersByPath, result } = load(properties);

		await expect(result).rejects.toThrow(message);
		expect(getParametersByPath).not.toHaveBeenCalled();
	});
});
