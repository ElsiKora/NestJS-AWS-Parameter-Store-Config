import type { ValueProvider } from "@nestjs/common";
import type { IParameterStoreConfigProperties } from "@shared/interface/config";

import { PARAMETER_STORE_CONFIG_PROPERTIES } from "@shared/constant/config";

/**
 * Creates a value provider for Parameter Store configuration properties.
 * @param {IParameterStoreConfigProperties} options - The configuration options to provide
 * @returns {ValueProvider<IParameterStoreConfigProperties>} A ValueProvider that provides the configuration options
 */
export const ParameterStoreConfigPropertiesProvider = (options: IParameterStoreConfigProperties): ValueProvider<IParameterStoreConfigProperties> => {
	return {
		provide: PARAMETER_STORE_CONFIG_PROPERTIES,
		useValue: options,
	};
};
