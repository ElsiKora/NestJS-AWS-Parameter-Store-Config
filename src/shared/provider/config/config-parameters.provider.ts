import ParameterStoreService from "@modules/aws/parameter-store/parameter-store.service";
import { PARAMETER_STORE_CONFIG_PARAMETERS, PARAMETER_STORE_CONFIG_PROPERTIES } from "@shared/constant/config/constant";

import type { Parameter } from "@aws-sdk/client-ssm";
import type { FactoryProvider } from "@nestjs/common";
import type { IParameterStoreConfigProperties } from "@shared/interface/config/properties.interface";

const ParameterStoreConfigParametersProvider: FactoryProvider<Array<Parameter>> = {
	inject: [PARAMETER_STORE_CONFIG_PROPERTIES, ParameterStoreService],
	provide: PARAMETER_STORE_CONFIG_PARAMETERS,
	useFactory: (properties: IParameterStoreConfigProperties, parameterStoreService: ParameterStoreService): Promise<Array<Parameter>> => {
		const path: string = properties.basePath ?? `${properties.application}/${properties.environment}`;

		return parameterStoreService.getParametersByPath(path, properties.decryptParameters ?? false, properties.recursiveLoading ?? false, properties.verbose ?? false);
	},
};

export default ParameterStoreConfigParametersProvider;
