import type { SSMClientConfig } from "@aws-sdk/client-ssm";

/**
 * Interface for AWS Parameter Store configuration properties.
 */
export interface IParameterStoreConfigProperties {
	/** The application name to use for parameter paths */
	application?: string;
	/** The base path for parameter lookup */
	basePath?: string;
	/** AWS SSM client configuration */
	config?: SSMClientConfig;
	/** The environment name to use for parameter paths */
	environment?: string;
	/** Whether to enable verbose logging */
	isVerbose?: boolean;
	/** Whether to decrypt secure string parameters */
	shouldDecryptParameters?: boolean;
	/** Whether to load parameters recursively */
	shouldUseRecursiveLoading?: boolean;
}
