import type { Parameter } from "@aws-sdk/client-ssm";
import type { IParameterStoreConfigProperties } from "@shared/interface/config";

import { IConfigGetProperties } from "@modules/config/interface";
import { Inject, Injectable } from "@nestjs/common";
import { PARAMETER_STORE_CONFIG_PARAMETERS, PARAMETER_STORE_CONFIG_PROPERTIES } from "@shared/constant/config";

@Injectable()
export class ParameterStoreConfigService {
	public constructor(
		@Inject(PARAMETER_STORE_CONFIG_PROPERTIES) private readonly properties: IParameterStoreConfigProperties,
		@Inject(PARAMETER_STORE_CONFIG_PARAMETERS) private readonly parameters: Array<Parameter>,
	) {}

	/**
	 * Retrieves the value of a parameter using the canonical structured lookup contract.
	 * @param {IConfigGetProperties} properties - The lookup properties.
	 * @returns {null | string} - The value of the parameter if found, or null if not found.
	 */
	public get(properties: IConfigGetProperties): null | string {
		const parameterPath: string = this.buildLookupPath(properties);
		const found: Parameter | undefined = this.parameters.find((parameter: Parameter) => parameter.Name === parameterPath);

		return found?.Value ?? null;
	}

	/**
	 * Builds the canonical SSM lookup path from module defaults and per-call overrides.
	 * @param {IConfigGetProperties} properties - The per-call lookup overrides.
	 * @returns {string} The canonical lookup path.
	 */
	private buildLookupPath(properties: IConfigGetProperties): string {
		const resolvedDefaults: IResolvedModuleDefaults = this.resolveModuleDefaults();
		const application: string = this.normalizeSegment(properties.application ?? resolvedDefaults.application, "application");
		const environment: string = this.normalizeSegment(properties.environment ?? resolvedDefaults.environment, "environment");
		const instanceName: string = this.normalizeSegment(properties.instanceName ?? resolvedDefaults.instanceName, "instanceName");
		const namespace: string = this.normalizeSegment(properties.namespace ?? resolvedDefaults.namespace, "namespace");
		const path: Array<string> = this.normalizePath(properties.path);

		return `/${application}/${environment}/${namespace}/${instanceName}/${path.join("/")}`;
	}

	/**
	 * Normalizes and validates the path portion of a lookup request.
	 * @param {Array<string>} path - The raw lookup path.
	 * @returns {Array<string>} The normalized path segments.
	 */
	private normalizePath(path: unknown): Array<string> {
		if (!Array.isArray(path) || path.length === 0) {
			throw new Error("Parameter Store path must be a non-empty string array.");
		}

		return path.map((segment: unknown, index: number) => this.normalizeSegment(segment, `path[${String(index)}]`));
	}

	/**
	 * Normalizes and validates one SSM path segment.
	 * @param {unknown} segment - The raw segment value.
	 * @param {string} segmentName - The segment label used in error messages.
	 * @returns {string} The normalized segment.
	 */
	private normalizeSegment(segment: unknown, segmentName: string): string {
		if (segment === undefined || segment === null) {
			throw new Error(`Parameter Store ${segmentName} is required.`);
		}

		if (typeof segment !== "string") {
			throw new TypeError(`Parameter Store ${segmentName} must be a string.`);
		}

		const normalizedSegment: string = segment.trim();

		if (!normalizedSegment) {
			throw new Error(`Parameter Store ${segmentName} must be a non-empty string.`);
		}

		if (normalizedSegment.includes("/")) {
			throw new Error(`Parameter Store ${segmentName} must not contain "/".`);
		}

		return normalizedSegment;
	}

	/**
	 * Normalizes and validates the module defaults required by the canonical contract.
	 * @returns {IResolvedModuleDefaults} The normalized defaults.
	 */
	private resolveModuleDefaults(): IResolvedModuleDefaults {
		return {
			application: this.normalizeSegment(this.properties.application, "application"),
			environment: this.normalizeSegment(this.properties.environment, "environment"),
			instanceName: this.normalizeSegment(this.properties.instanceName, "instanceName"),
			namespace: this.normalizeSegment(this.properties.namespace, "namespace"),
		};
	}
}

interface IResolvedModuleDefaults {
	application: string;
	environment: string;
	instanceName: string;
	namespace: string;
}
