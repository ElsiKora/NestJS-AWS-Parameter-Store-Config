import type { SSMClientConfig } from "@aws-sdk/client-ssm";

export interface IParameterStoreConfigProperties {
	application?: string;
	basePath?: string;
	config?: SSMClientConfig;
	decryptParameters?: boolean;
	environment?: string;
	recursiveLoading?: boolean;
	verbose?: boolean;
}
