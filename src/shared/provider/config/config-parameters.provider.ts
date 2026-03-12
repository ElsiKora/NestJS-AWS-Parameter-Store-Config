import type { Parameter } from "@aws-sdk/client-ssm";
import type { FactoryProvider } from "@nestjs/common";
import type { IParameterStoreConfigProperties } from "@shared/interface/config";

import { ParameterStoreService } from "@modules/aws/parameter-store";
import { PARAMETER_STORE_CONFIG_PARAMETERS, PARAMETER_STORE_CONFIG_PROPERTIES } from "@shared/constant/config";

/**
 * Factory provider that fetches parameters from AWS Parameter Store.
 * Constructs the parameter path based on application and environment settings,
 * then retrieves all parameters under that path.
 */
export const ParameterStoreConfigParametersProvider: FactoryProvider<Array<Parameter>> = {
	inject: [PARAMETER_STORE_CONFIG_PROPERTIES, ParameterStoreService],
	provide: PARAMETER_STORE_CONFIG_PARAMETERS,
	useFactory: async (properties: IParameterStoreConfigProperties, parameterStoreService: ParameterStoreService): Promise<Array<Parameter>> => {
		if (typeof properties.application !== "string") {
			throw new TypeError("Parameter Store application must be a string.");
		}

		if (typeof properties.environment !== "string") {
			throw new TypeError("Parameter Store environment must be a string.");
		}

		const application: string = properties.application.trim();
		const environment: string = properties.environment.trim();

		if (!application) {
			throw new Error("Parameter Store application is required.");
		}

		if (!environment) {
			throw new Error("Parameter Store environment is required.");
		}

		if (application.includes("/")) {
			throw new Error('Parameter Store application must not contain "/".');
		}

		if (environment.includes("/")) {
			throw new Error('Parameter Store environment must not contain "/".');
		}

		const path: string = `/${application}/${environment}`;

		return parameterStoreService.getParametersByPath(path, properties.shouldDecryptParameters ?? false, properties.shouldUseRecursiveLoading ?? true, properties.isVerbose ?? false);
	},
};
