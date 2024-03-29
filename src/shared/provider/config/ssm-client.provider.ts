import { SSMClient } from "@aws-sdk/client-ssm";

import { PARAMETER_STORE_CONFIG_PROPERTIES, PARAMETER_STORE_SSM_CLIENT } from "@shared/constant/config/constant";

import type { FactoryProvider } from "@nestjs/common";
import type { IParameterStoreConfigProperties } from "@shared/interface/config/properties.interface";

const ParameterStoreConfigSSMProvider: FactoryProvider<SSMClient> = {
	inject: [PARAMETER_STORE_CONFIG_PROPERTIES],
	provide: PARAMETER_STORE_SSM_CLIENT,
	useFactory: (properties: IParameterStoreConfigProperties): SSMClient => {
		return new SSMClient(properties.config ?? {});
	},
};

export default ParameterStoreConfigSSMProvider;
