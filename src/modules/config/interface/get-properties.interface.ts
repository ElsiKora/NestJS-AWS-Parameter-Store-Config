import type { EEnvironment, EInstanceName, EService } from "@shared/enum";

/**
 * Context options for parameter retrieval
 */
export interface IConfigGetProperties {
	application?: string;
	environment?: EEnvironment | string;
	instanceName?: EInstanceName | string;
	path?: Array<string>;
	service?: EService | string;
}
