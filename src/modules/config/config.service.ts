import { Inject, Injectable } from "@nestjs/common";

import { PARAMETER_STORE_CONFIG_PARAMETERS } from "@/constants";

import type { Parameter } from "@aws-sdk/client-ssm";

type Maybe<T> = null | T;

@Injectable()
export class ParameterStoreConfigService {
	private static readonly trutyValues = ["true", "True", "1", "y", "yes", "Yes"];

	public constructor(@Inject(PARAMETER_STORE_CONFIG_PARAMETERS) private readonly parameters: Array<Parameter>) {}

	public get<R extends string>(name: string, defaultValue: Maybe<R> = null): Maybe<R> {
		const found = this.parameters.find((parameter) => parameter.Name?.endsWith(name));

		if (!found) {
			return defaultValue;
		}

		return found.Value as R;
	}

	public getBool<R extends boolean>(name: string, defaultValue: Maybe<R> = null): Maybe<R> {
		const found = this.parameters.find((parameter) => parameter.Name?.endsWith(name));

		if (!found) {
			return defaultValue;
		}

		const isTrue = ParameterStoreConfigService.trutyValues.includes(found.Value ?? "");

		return isTrue as R;
	}

	public getNumber<R extends number>(name: string, defaultValue: Maybe<R> = null): Maybe<R> {
		const found = this.parameters.find((parameter) => parameter.Name?.endsWith(name));

		if (!found?.Value) {
			return defaultValue;
		}

		return +found.Value as R;
	}
}
