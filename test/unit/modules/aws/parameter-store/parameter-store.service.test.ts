import type { GetParametersByPathCommand, SSMClient } from "@aws-sdk/client-ssm";

import { ParameterStoreService } from "@modules/aws/parameter-store";
import { Logger } from "@nestjs/common";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Creates an SSM client stub that answers each send with the next page.
 * @param {Array<object>} pages - Pages returned in order.
 * @returns {{ client: SSMClient, send: ReturnType<typeof vi.fn> }} The client and its send mock.
 */
function createClient(pages: Array<{ NextToken?: string; Parameters?: Array<{ Name: string; Value: string }> }>): { client: SSMClient; send: ReturnType<typeof vi.fn> } {
	const send: ReturnType<typeof vi.fn> = vi.fn();

	for (const page of pages) {
		send.mockResolvedValueOnce(page);
	}

	return { client: { send } as unknown as SSMClient, send };
}

describe("ParameterStoreService", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("follows NextToken until every page is loaded", async () => {
		const { client, send } = createClient([{ NextToken: "page-2", Parameters: [{ Name: "/app/test/a", Value: "1" }] }, { Parameters: [{ Name: "/app/test/b", Value: "2" }] }]);

		const parameters = await new ParameterStoreService(client).getParametersByPath("/app/test", true, false);

		expect(parameters.map((parameter) => parameter.Name)).toEqual(["/app/test/a", "/app/test/b"]);
		expect(send).toHaveBeenCalledTimes(2);
		expect((send.mock.calls[0]?.[0] as GetParametersByPathCommand).input).toEqual({ NextToken: undefined, Path: "/app/test", Recursive: false, WithDecryption: true });
		expect((send.mock.calls[1]?.[0] as GetParametersByPathCommand).input).toEqual({ NextToken: "page-2", Path: "/app/test", Recursive: false, WithDecryption: true });
	});

	it("loads recursively without decryption by default and accepts a page without parameters", async () => {
		const { client, send } = createClient([{}]);

		await expect(new ParameterStoreService(client).getParametersByPath("/app/test")).resolves.toEqual([]);
		expect((send.mock.calls[0]?.[0] as GetParametersByPathCommand).input).toMatchObject({ Recursive: true, WithDecryption: false });
	});

	it("logs only when verbose", async () => {
		const verbose = vi.spyOn(Logger, "verbose").mockImplementation(vi.fn());

		await new ParameterStoreService(createClient([{}]).client).getParametersByPath("/app/test");
		expect(verbose).not.toHaveBeenCalled();

		await new ParameterStoreService(createClient([{}]).client).getParametersByPath("/app/test", false, true, true);
		expect(verbose).toHaveBeenCalledWith("Getting parameters from path: /app/test", "ParameterStoreConfig");
		expect(verbose).toHaveBeenCalledWith("Found 0 parameters", "ParameterStoreConfig");
	});
});
