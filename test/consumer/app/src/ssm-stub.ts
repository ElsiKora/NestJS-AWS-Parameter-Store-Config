import type { IncomingMessage, Server, ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";

import { createServer } from "node:http";

export interface ISsmStub {
	close: () => Promise<void>;
	endpoint: string;
	requests: Array<ISsmStubRequest>;
}

export interface ISsmStubRequest {
	NextToken?: string;
	Path: string;
	Recursive: boolean;
	WithDecryption: boolean;
}

const PAGES: Array<{ NextToken?: string; Parameters: Array<{ Name: string; Type: string; Value: string }> }> = [
	{
		NextToken: "page-2",
		Parameters: [{ Name: "/smoke/test/postgres/main/host", Type: "String", Value: "db.internal" }],
	},
	{
		Parameters: [
			{ Name: "/smoke/test/postgres/main/password", Type: "SecureString", Value: "decrypted-secret" },
			{ Name: "/smoke/test/redis/cache/url", Type: "String", Value: "redis://cache" },
		],
	},
];

/**
 * Starts an HTTP server that answers the AWS JSON protocol call GetParametersByPath with two pages.
 * @returns {Promise<ISsmStub>} The endpoint, the recorded requests and a close callback.
 */
export async function startSsmStub(): Promise<ISsmStub> {
	const requests: Array<ISsmStubRequest> = [];

	const server: Server = createServer((request: IncomingMessage, response: ServerResponse) => {
		let body: string = "";
		request.setEncoding("utf8");
		request.on("data", (chunk: string) => {
			body += chunk;
		});
		request.on("end", () => {
			if (request.headers["x-amz-target"] !== "AmazonSSM.GetParametersByPath") {
				response.writeHead(400, { "content-type": "application/x-amz-json-1.1" });
				response.end(JSON.stringify({ __type: "UnknownOperationException" }));

				return;
			}

			const input: ISsmStubRequest = JSON.parse(body) as ISsmStubRequest;
			requests.push(input);
			response.writeHead(200, { "content-type": "application/x-amz-json-1.1" });
			response.end(JSON.stringify(input.NextToken === "page-2" ? PAGES[1] : PAGES[0]));
		});
	});

	await new Promise<void>((resolve: () => void) => server.listen(0, "127.0.0.1", resolve));
	const { port }: AddressInfo = server.address() as AddressInfo;

	return {
		close: async () => {
			await new Promise<void>((resolve: () => void, reject: (error: Error) => void) =>
				server.close((error?: Error) => {
					if (error) {
						reject(error);
					} else {
						resolve();
					}
				}),
			);
		},
		endpoint: `http://127.0.0.1:${String(port)}`,
		requests,
	};
}
