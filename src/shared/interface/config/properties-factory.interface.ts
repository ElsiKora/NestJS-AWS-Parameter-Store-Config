import type { IParameterStoreConfigProperties } from "./properties.interface";

/**
 * Interface for a factory that creates Parameter Store configuration properties.
 */
export interface IParameterStoreConfigPropertiesFactory {
	/**
	 * Creates configuration options for the Parameter Store module.
	 * @returns {IParameterStoreConfigProperties | Promise<IParameterStoreConfigProperties>} Configuration properties or a Promise resolving to properties
	 */
	createOptions(): IParameterStoreConfigProperties | Promise<IParameterStoreConfigProperties>;
}
