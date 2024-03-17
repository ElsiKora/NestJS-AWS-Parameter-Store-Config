import { Global, Module } from "@nestjs/common";

import { PARAMETER_STORE_CONFIG_PARAMETERS, PARAMETER_STORE_CONFIG_PROPERTIES } from "@/constants";
import { ParameterStoreService } from "@/modules/aws/parameter-store/parameter-store.service";
import { ParameterStoreConfigService } from "@/modules/config/config.service";

import ParameterStoreConfigParametersProvider from "@shared/provider/config/config-parameters.provider";
import ParameterStoreConfigPropertiesProvider from "@shared/provider/config/properties.provider";

import ParameterStoreConfigSSMProvider from "@shared/provider/config/ssm-client.provider";

import type { DynamicModule, Provider } from "@nestjs/common";
import type { IParameterStoreConfigAsyncModuleProperties } from "@shared/interface/config/async-module-properties.interface";
import type { IParameterStoreConfigPropertiesFactory } from "@shared/interface/config/properties-factory.interface";
import type { IParameterStoreConfigProperties } from "@shared/interface/config/properties.interface";

@Global()
@Module({})
export class ParameterStoreConfigModule {
	public static register(options: IParameterStoreConfigProperties): DynamicModule {
		const propertiesProvider = ParameterStoreConfigPropertiesProvider(options);

		return {
			exports: [ParameterStoreConfigService, PARAMETER_STORE_CONFIG_PARAMETERS],
			module: ParameterStoreConfigModule,
			providers: [propertiesProvider, ParameterStoreConfigParametersProvider, ParameterStoreConfigSSMProvider, ParameterStoreConfigService, ParameterStoreService],
		};
	}

	public static registerAsync(options: IParameterStoreConfigAsyncModuleProperties): DynamicModule {
		const providers = this.createAsyncProviders(options);

		return {
			exports: [ParameterStoreConfigService, PARAMETER_STORE_CONFIG_PARAMETERS],
			imports: options.imports || [],
			module: ParameterStoreConfigModule,
			providers,
		};
	}

	private static createAsyncOptionsProvider(options: IParameterStoreConfigAsyncModuleProperties): Provider {
		if (options.useFactory) {
			return {
				inject: options.inject || [],
				provide: PARAMETER_STORE_CONFIG_PROPERTIES,
				useFactory: options.useFactory,
			};
		}

		const inject = options.useExisting || options.useClass;

		return {
			inject: inject ? [inject] : [],
			provide: PARAMETER_STORE_CONFIG_PROPERTIES,
			useFactory: async (optionsFactory: IParameterStoreConfigPropertiesFactory) => {
				return optionsFactory.createOptions();
			},
		};
	}

	private static createAsyncProviders(properties: IParameterStoreConfigAsyncModuleProperties): Array<Provider> {
		const optionsProvider = this.createAsyncOptionsProvider(properties);

		const requestProviders = [optionsProvider, ParameterStoreConfigParametersProvider, ParameterStoreConfigSSMProvider, ParameterStoreConfigService, ParameterStoreService];

		if (properties.useExisting || properties.useFactory || !properties.useClass) {
			return requestProviders;
		}

		return [
			...requestProviders,
			{
				provide: properties.useClass,
				useClass: properties.useClass,
			},
		];
	}
}
