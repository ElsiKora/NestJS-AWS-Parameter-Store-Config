import type { ModuleMetadata, Type } from "@nestjs/common/interfaces";

import type { IParameterStoreConfigPropertiesFactory } from "./properties-factory.interface";
import type { IParameterStoreConfigProperties } from "./properties.interface";

/**
 * Interface for asynchronous module configuration properties.
 * Provides different options for asynchronously configuring the Parameter Store module.
 */
export interface IParameterStoreConfigAsyncModuleProperties extends Pick<ModuleMetadata, "imports"> {
	/** Optional array of dependencies to be injected into the factory function or class */
	inject?: Array<any>;
	/** Optional class that implements IParameterStoreConfigPropertiesFactory to be instantiated */
	useClass?: Type<IParameterStoreConfigPropertiesFactory>;
	/** Optional existing provider implementing IParameterStoreConfigPropertiesFactory to be used */
	useExisting?: Type<IParameterStoreConfigPropertiesFactory>;
	/** Optional factory function that returns configuration properties */
	useFactory?: (...arguments_: Array<any>) => IParameterStoreConfigProperties | Promise<IParameterStoreConfigProperties>;
}
