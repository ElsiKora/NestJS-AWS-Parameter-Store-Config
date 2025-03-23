/**
 * Injection token for Parameter Store configuration properties.
 * Used to provide and inject configuration options throughout the module.
 */
export const PARAMETER_STORE_CONFIG_PROPERTIES: string = "PARAMETER_STORE_CONFIG_PROPERTIES";

/**
 * Injection token for Parameter Store parameters.
 * Used to provide and inject the parameters retrieved from AWS Parameter Store.
 */
export const PARAMETER_STORE_CONFIG_PARAMETERS: string = "PARAMETER_STORE_CONFIG_PARAMETERS";

/**
 * Injection token for the AWS SSM client.
 * Used to provide and inject the configured SSM client.
 */
export const PARAMETER_STORE_SSM_CLIENT: string = "PARAMETER_STORE_SSM_CLIENT";
