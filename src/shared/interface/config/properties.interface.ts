import type { SSMClientConfig } from "@aws-sdk/client-ssm";
import type { EEnvironment, ENamespace } from "@shared/enum";

/**
 * Canonical AWS Parameter Store module defaults.
 */
export interface IParameterStoreConfigProperties {
	/** The application name used in canonical parameter paths */
	application: string;
	/** AWS SSM client configuration */
	config?: SSMClientConfig;
	/** The lifecycle environment used in canonical parameter paths */
	environment: EEnvironment | string;
	/** The default instance name used when lookups do not override it */
	instanceName: string;
	/** Whether to enable verbose logging */
	isVerbose?: boolean;
	/** The default namespace used when lookups do not override it */
	namespace: ENamespace | string;
	/** Whether to decrypt secure string parameters */
	shouldDecryptParameters?: boolean;
	/** Whether to load parameters recursively. Defaults to true. */
	shouldUseRecursiveLoading?: boolean;
}
