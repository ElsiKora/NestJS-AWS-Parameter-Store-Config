import type { Parameter } from "@aws-sdk/client-ssm";

import { Inject, Injectable } from "@nestjs/common";
import { PARAMETER_STORE_CONFIG_PARAMETERS } from "@shared/constant/config";
import { EInstanceName } from "@shared/enum";

import { IConfigGetProperties } from "./interface";

@Injectable()
export class ParameterStoreConfigService {
	public constructor(@Inject(PARAMETER_STORE_CONFIG_PARAMETERS) private readonly parameters: Array<Parameter>) {}

	/**
	 * Retrieves the value of a parameter with the specified name.
	 * @param {IConfigGetProperties | string} properties - The parameter name or context options.
	 * @returns {null | string} - The value of the parameter if found, or null if not found.
	 */
	public get(properties: IConfigGetProperties | string): null | string {
		if (typeof properties === "string") {
			const found: Parameter | undefined = this.parameters.find((parameter: Parameter) => parameter.Name == properties);

			if (!found?.Value) {
				return null;
			}

			return found.Value;
		} else {
			const { application = this.getApplication(), environment = this.getEnvironment(), path = [], service = "" }: IConfigGetProperties = properties;
			let instanceName: string = properties.instanceName ?? `${application}-${EInstanceName.REAPER_API}`;

			if (properties.instanceName === EInstanceName.REAPER_API || properties.instanceName === EInstanceName.REAPER_API_TEST) {
				instanceName = `${application}-${properties.instanceName}`;
			}

			const parameterPath: string = `/${application}/${environment}/${instanceName}/${service}/${path.join("/")}`;

			const found: Parameter | undefined = this.parameters.find((parameter: Parameter) => parameter.Name == parameterPath);

			if (!found?.Value) {
				return null;
			}

			return found.Value;
		}
	}

	/**
	 * Gets the application name from environment variables.
	 * @returns {string} The application name.
	 */
	public getApplication(): string {
		return process.env.APPLICATION ?? "";
	}

	/**
	 * Gets the environment name from environment variables.
	 * @returns {string} The environment name.
	 */
	public getEnvironment(): string {
		return process.env.ENVIRONMENT ?? "";
	}
}
