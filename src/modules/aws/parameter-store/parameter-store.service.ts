import type { GetParametersByPathCommandOutput, Parameter } from "@aws-sdk/client-ssm";

import { GetParametersByPathCommand, SSMClient } from "@aws-sdk/client-ssm";
import { Inject, Injectable } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { PARAMETER_STORE_SSM_CLIENT } from "@shared/constant/config";

@Injectable()
export class ParameterStoreService {
	public constructor(@Inject(PARAMETER_STORE_SSM_CLIENT) private readonly client: SSMClient) {}

	/**
	 * Retrieves parameters from AWS Parameter Store by the specified path.
	 * @param {string} path - The path to the parameters in AWS Parameter Store.
	 * @param {boolean} shouldDecryptParameters - Whether to decrypt the parameter values. Default is false.
	 * @param {boolean} shouldUseRecursiveLoading - Whether to recursively load parameters under the specified path. Default is false.
	 * @param {boolean} isVerbose - Whether to log verbose messages. Default is false.
	 * @returns {Promise<Array<Parameter>>} - A promise that resolves to an array of Parameter objects.
	 */
	public async getParametersByPath(path: string, shouldDecryptParameters: boolean = false, shouldUseRecursiveLoading: boolean = false, isVerbose: boolean = false): Promise<Array<Parameter>> {
		if (isVerbose) Logger.verbose(`Getting parameters from path: ${path}`, "ParameterStoreConfig");

		let allParameters: Array<Parameter> = [];
		let nextParametersToken: string | undefined;

		do {
			const getParameters: GetParametersByPathCommand = new GetParametersByPathCommand({
				NextToken: nextParametersToken,
				Path: path,
				// eslint-disable-next-line @elsikora/typescript/naming-convention
				Recursive: shouldUseRecursiveLoading,
				// eslint-disable-next-line @elsikora/typescript/naming-convention
				WithDecryption: shouldDecryptParameters,
			});

			const { NextToken, Parameters = [] }: GetParametersByPathCommandOutput = await this.client.send(getParameters);
			allParameters = [...allParameters, ...Parameters];
			nextParametersToken = NextToken;
		} while (nextParametersToken);

		if (isVerbose) Logger.verbose(`Found ${String(allParameters.length)} parameters`, "ParameterStoreConfig");

		return allParameters;
	}
}
