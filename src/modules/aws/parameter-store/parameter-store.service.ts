import { GetParametersByPathCommand, SSMClient } from "@aws-sdk/client-ssm";
import { Inject, Injectable } from "@nestjs/common";

import { PARAMETER_STORE_SSM_CLIENT } from "@/constants";

import type { Parameter } from "@aws-sdk/client-ssm";

@Injectable()
export class ParameterStoreService {
	public constructor(@Inject(PARAMETER_STORE_SSM_CLIENT) private readonly client: SSMClient) {}

	public async getParametersByPath(path: string, decrypt = false, recursive = false): Promise<Array<Parameter>> {
		let allParameters: Array<Parameter> = [];
		let nextParametersToken: string | undefined;

		do {
			const getParameters = new GetParametersByPathCommand({
				NextToken: nextParametersToken,
				Path: path,
				Recursive: recursive,
				WithDecryption: decrypt,
			});

			const { NextToken, Parameters = [] } = await this.client.send(getParameters);
			allParameters = allParameters.concat(Parameters);
			nextParametersToken = NextToken;
		} while (Boolean(nextParametersToken));

		return allParameters;
	}
}
