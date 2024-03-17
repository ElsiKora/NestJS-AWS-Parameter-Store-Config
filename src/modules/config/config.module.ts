import { Global, Module } from "@nestjs/common";

import ParameterStoreService from "@modules/aws/parameter-store/parameter-store.service";

import { ParameterStoreConfigService } from "@modules/config/config.service";
import { PARAMETER_STORE_CONFIG_PARAMETERS, PARAMETER_STORE_CONFIG_PROPERTIES } from "@shared/constant/config/constant";
import ParameterStoreConfigParametersProvider from "@shared/provider/config/config-parameters.provider";
import ParameterStoreConfigPropertiesProvider from "@shared/provider/config/properties.provider";

import ParameterStoreConfigSSMProvider from "@shared/provider/config/ssm-client.provider";

import type { DynamicModule, Provider, ValueProvider } from "@nestjs/common";
import type { Type } from "@nestjs/common/interfaces";
import type { IParameterStoreConfigAsyncModuleProperties } from "@shared/interface/config/async-module-properties.interface";
import type { IParameterStoreConfigPropertiesFactory } from "@shared/interface/config/properties-factory.interface";
import type { IParameterStoreConfigProperties } from "@shared/interface/config/properties.interface";

@Global()
@Module({})
// eslint-disable-next-line import/prefer-default-export
export class ParameterStoreConfigModule {
	/**
	 * Registers the given options for dynamic module configuration.
	 *
	 * @param {IParameterStoreConfigProperties} options - The configuration options.
	 * @return {DynamicModule} - The dynamic module configuration.
	 */
	public static register(options: IParameterStoreConfigProperties): DynamicModule {
		const propertiesProvider: ValueProvider<IParameterStoreConfigProperties> = ParameterStoreConfigPropertiesProvider(options);

		return {
			exports: [ParameterStoreConfigService, PARAMETER_STORE_CONFIG_PARAMETERS],
			module: ParameterStoreConfigModule,
			providers: [propertiesProvider, ParameterStoreConfigParametersProvider, ParameterStoreConfigSSMProvider, ParameterStoreConfigService, ParameterStoreService],
		};
	}

	/**
	 * Registers an asynchronous module in the application.
	 *
	 * @param {IParameterStoreConfigAsyncModuleProperties} properties - The properties for the async module.
	 * @return {DynamicModule} - The registered dynamic module.
	 */
	public static registerAsync(properties: IParameterStoreConfigAsyncModuleProperties): DynamicModule {
		const providers: Array<Provider> = this.createAsyncProviders(properties);

		return {
			exports: [ParameterStoreConfigService, PARAMETER_STORE_CONFIG_PARAMETERS],
			imports: properties.imports || [],
			module: ParameterStoreConfigModule,
			providers,
		};
	}

	/**
	 * Creates an async options provider for the given `properties` object.
	 *
	 * @param {IParameterStoreConfigAsyncModuleProperties} properties - The properties object used to configure the async options provider.
	 * @returns {Provider} - The created async options provider.
	 * @private
	 */
	private static createAsyncOptionsProvider(properties: IParameterStoreConfigAsyncModuleProperties): Provider {
		if (properties.useFactory) {
			return {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				inject: properties.inject || [],
				provide: PARAMETER_STORE_CONFIG_PROPERTIES,
				useFactory: properties.useFactory,
			};
		}

		const inject: Type<IParameterStoreConfigPropertiesFactory> = properties.useExisting || properties.useClass;

		return {
			inject: inject ? [inject] : [],
			provide: PARAMETER_STORE_CONFIG_PROPERTIES,
			useFactory: async (optionsFactory: IParameterStoreConfigPropertiesFactory): Promise<IParameterStoreConfigProperties> => {
				return optionsFactory.createOptions();
			},
		};
	}

	/**
	 * Creates an array of Providers for asynchronous module configuration using the given properties.
	 *
	 * @param {IParameterStoreConfigAsyncModuleProperties} properties - The properties for configuring the module asynchronously.
	 *
	 * @returns {Array<Provider>} An array of Providers for the module configuration.
	 *
	 * @private
	 */
	private static createAsyncProviders(properties: IParameterStoreConfigAsyncModuleProperties): Array<Provider> {
		const optionsProvider: Provider = this.createAsyncOptionsProvider(properties);

		const requestProviders: Array<Provider> = [optionsProvider, ParameterStoreConfigParametersProvider, ParameterStoreConfigSSMProvider, ParameterStoreConfigService, ParameterStoreService];

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
