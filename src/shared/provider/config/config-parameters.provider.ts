import { PARAMETER_STORE_CONFIG_PARAMETERS, PARAMETER_STORE_CONFIG_PROPERTIES } from "../../../constants";

import { ParameterStoreService } from "@modules/aws/parameter-store/parameter-store.service";

import type { Parameter } from "@aws-sdk/client-ssm";
import type { FactoryProvider } from "@nestjs/common";
import type { IParameterStoreConfigProperties } from "@shared/interface/config/properties.interface";

const ParameterStoreConfigParametersProvider: FactoryProvider<Array<Parameter>> = {
	inject: [PARAMETER_STORE_CONFIG_PROPERTIES, ParameterStoreService],
	provide: PARAMETER_STORE_CONFIG_PARAMETERS,
	useFactory: (configOptions: IParameterStoreConfigProperties, parameterStoreService: ParameterStoreService): Promise<Array<Parameter>> => {
		return parameterStoreService.getParametersByPath(configOptions.ssmParamStorePath, configOptions.ssmDecryptParams ?? false, configOptions.ssmRecursive ?? false);
	},
};

export default ParameterStoreConfigParametersProvider;
