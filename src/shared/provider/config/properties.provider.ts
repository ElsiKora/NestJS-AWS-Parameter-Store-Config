import type { ValueProvider } from "@nestjs/common";
import type { IParameterStoreConfigProperties } from "@shared/interface/config";

import { PARAMETER_STORE_CONFIG_PROPERTIES } from "@shared/constant/config";

export const ParameterStoreConfigPropertiesProvider = (options: IParameterStoreConfigProperties): ValueProvider<IParameterStoreConfigProperties> => {
	return {
		provide: PARAMETER_STORE_CONFIG_PROPERTIES,
		useValue: options,
	};
};
