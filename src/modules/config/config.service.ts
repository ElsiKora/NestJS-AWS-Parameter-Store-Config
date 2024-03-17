import { Inject, Injectable } from "@nestjs/common";

import { PARAMETER_STORE_CONFIG_PARAMETERS } from "@shared/constant/config/constant";

import type { Parameter } from "@aws-sdk/client-ssm";

@Injectable()
// eslint-disable-next-line import/prefer-default-export,@elsikora/nestjs-typed/injectable-should-be-provided
export class ParameterStoreConfigService {
	public constructor(@Inject(PARAMETER_STORE_CONFIG_PARAMETERS) private readonly parameters: Array<Parameter>) {}

	/**
	 * Retrieves the value of a parameter with the specified name.
	 *
	 * @param {string} name - The name of the parameter to retrieve.
	 * @return {null|string} - The value of the parameter if found, or null if not found.
	 */
	public get(name: string): null | string {
		const found: Parameter = this.parameters.find((parameter: Parameter) => parameter.Name === name);

		if (!found) {
			return undefined;
		}

		return found.Value;
	}
}
