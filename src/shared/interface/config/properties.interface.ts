import type { SSMClientConfig } from "@aws-sdk/client-ssm";

export interface IParameterStoreConfigProperties {
	application?: string;
	basePath?: string;
	config?: SSMClientConfig;
	environment?: string;
	isVerbose?: boolean;
	shouldDecryptParameters?: boolean;
	shouldUseRecursiveLoading?: boolean;
}
