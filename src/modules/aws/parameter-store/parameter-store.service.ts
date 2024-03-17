import { GetParametersByPathCommand, SSMClient } from "@aws-sdk/client-ssm";
import { Inject, Injectable } from "@nestjs/common";

import { Logger } from "@nestjs/common";

import { PARAMETER_STORE_SSM_CLIENT } from "@shared/constant/config/constant";

import type { GetParametersByPathCommandOutput, Parameter } from "@aws-sdk/client-ssm";

@Injectable()
// eslint-disable-next-line @elsikora/nestjs-typed/injectable-should-be-provided
export default class ParameterStoreService {
	public constructor(@Inject(PARAMETER_STORE_SSM_CLIENT) private readonly client: SSMClient) {}

	public async getParametersByPath(path: string, decryptParameters: boolean = false, recursiveLoading: boolean = false, verbose: boolean = false): Promise<Array<Parameter>> {
		if (verbose) Logger.verbose(`Getting parameters from path: ${path}`, "ParameterStoreConfig");

		let allParameters: Array<Parameter> = [];
		let nextParametersToken: string | undefined;

		do {
			const getParameters: GetParametersByPathCommand = new GetParametersByPathCommand({
				NextToken: nextParametersToken,
				Path: path,
				Recursive: recursiveLoading,
				WithDecryption: decryptParameters,
			});

			const { NextToken, Parameters = [] }: GetParametersByPathCommandOutput = await this.client.send(getParameters);
			allParameters = [...allParameters, ...Parameters];
			nextParametersToken = NextToken;
		} while (Boolean(nextParametersToken));

		if (verbose) Logger.verbose(`Found ${allParameters.length} parameters`, "ParameterStoreConfig");

		return allParameters;
	}
}
