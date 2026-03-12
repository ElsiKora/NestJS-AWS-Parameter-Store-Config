import type { EEnvironment, ENamespace } from "@shared/enum";

/**
 * Canonical structured lookup options for parameter retrieval.
 */
export interface IConfigGetProperties {
	application?: string;
	environment?: EEnvironment | string;
	instanceName?: string;
	namespace?: ENamespace | string;
	path: Array<string>;
}
