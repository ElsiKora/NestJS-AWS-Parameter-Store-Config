import type { IParameterStoreConfigProperties } from "@shared/interface/config/properties.interface";

export interface IParameterStoreConfigPropertiesFactory {
	createOptions(): IParameterStoreConfigProperties | Promise<IParameterStoreConfigProperties>;
}
