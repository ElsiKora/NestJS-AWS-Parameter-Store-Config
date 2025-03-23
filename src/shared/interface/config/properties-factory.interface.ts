import type { IParameterStoreConfigProperties } from "./properties.interface";

export interface IParameterStoreConfigPropertiesFactory {
	createOptions(): IParameterStoreConfigProperties | Promise<IParameterStoreConfigProperties>;
}
