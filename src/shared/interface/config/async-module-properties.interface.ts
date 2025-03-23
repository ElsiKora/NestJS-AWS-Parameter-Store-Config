import type { ModuleMetadata, Type } from "@nestjs/common/interfaces";

import type { IParameterStoreConfigPropertiesFactory } from "./properties-factory.interface";
import type { IParameterStoreConfigProperties } from "./properties.interface";

export interface IParameterStoreConfigAsyncModuleProperties extends Pick<ModuleMetadata, "imports"> {
	inject?: Array<any>;
	useClass?: Type<IParameterStoreConfigPropertiesFactory>;
	useExisting?: Type<IParameterStoreConfigPropertiesFactory>;
	useFactory?: (...arguments_: Array<any>) => IParameterStoreConfigProperties | Promise<IParameterStoreConfigProperties>;
}
