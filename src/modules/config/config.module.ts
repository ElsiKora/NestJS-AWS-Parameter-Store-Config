import type { DynamicModule, Provider, ValueProvider } from "@nestjs/common";
import type { Type } from "@nestjs/common/interfaces";

import { ParameterStoreService } from "@modules/aws/parameter-store";
import { Global, Module } from "@nestjs/common";
import { PARAMETER_STORE_CONFIG_PARAMETERS, PARAMETER_STORE_CONFIG_PROPERTIES } from "@shared/constant/config";
import { IParameterStoreConfigAsyncModuleProperties, IParameterStoreConfigProperties, IParameterStoreConfigPropertiesFactory } from "@shared/interface/config";
import { ParameterStoreConfigParametersProvider, ParameterStoreConfigPropertiesProvider, ParameterStoreConfigSSMProvider } from "@shared/provider/config";

import { ParameterStoreConfigService } from "./config.service";

@Global()
@Module({})
export class ParameterStoreConfigModule {
	/**
	 * Registers the given options for dynamic module configuration.
	 * @param {IParameterStoreConfigProperties} options - The configuration options.
	 * @returns {DynamicModule} - The dynamic module configuration.
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
	 * @param {IParameterStoreConfigAsyncModuleProperties} properties - The properties for the async module.
	 * @returns {DynamicModule} - The registered dynamic module.
	 */
	public static registerAsync(properties: IParameterStoreConfigAsyncModuleProperties): DynamicModule {
		const providers: Array<Provider> = this.createAsyncProviders(properties);

		return {
			exports: [ParameterStoreConfigService, PARAMETER_STORE_CONFIG_PARAMETERS],
			imports: properties.imports ?? [],
			module: ParameterStoreConfigModule,
			providers,
		};
	}

	/**
	 * Creates an async options provider for the given `properties` object.
	 * @param {IParameterStoreConfigAsyncModuleProperties} properties - The properties object used to configure the async options provider.
	 * @returns {Provider} - The created async options provider.
	 * @private
	 */
	private static createAsyncOptionsProvider(properties: IParameterStoreConfigAsyncModuleProperties): Provider {
		if (properties.useFactory) {
			return {
				inject: properties.inject ?? [],
				provide: PARAMETER_STORE_CONFIG_PROPERTIES,
				useFactory: properties.useFactory,
			};
		}

		const inject: Type<IParameterStoreConfigPropertiesFactory> | undefined = properties.useExisting ?? properties.useClass;

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
	 * @param {IParameterStoreConfigAsyncModuleProperties} properties - The properties for configuring the module asynchronously.
	 * @returns {Array<Provider>} An array of Providers for the module configuration.
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
