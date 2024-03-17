import type { SSMClientConfig } from "@aws-sdk/client-ssm";

export interface IParameterStoreConfigProperties {
	ssmClientOptions?: SSMClientConfig;
	ssmDecryptParams?: boolean;
	ssmParamStorePath: string;
	ssmRecursive?: boolean;
}
