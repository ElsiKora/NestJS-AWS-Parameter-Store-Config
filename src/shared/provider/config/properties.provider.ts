import { PARAMETER_STORE_CONFIG_PROPERTIES } from "../../../constants";

import type { ValueProvider } from "@nestjs/common";
import type { IParameterStoreConfigProperties } from "@shared/interface/config/properties.interface";

const ParameterStoreConfigPropertiesProvider = (options: IParameterStoreConfigProperties): ValueProvider<IParameterStoreConfigProperties> => {
	return {
		provide: PARAMETER_STORE_CONFIG_PROPERTIES,
		useValue: options,
	};
};

export default ParameterStoreConfigPropertiesProvider;
