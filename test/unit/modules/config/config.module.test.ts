import type { GetParametersByPathCommand, Parameter } from "@aws-sdk/client-ssm";
import type { DynamicModule } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import type { IParameterStoreConfigProperties, IParameterStoreConfigPropertiesFactory } from "@shared/interface/config";

import { ParameterStoreConfigModule, ParameterStoreConfigService } from "@modules/config";
import { Inject, Injectable, Module } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PARAMETER_STORE_CONFIG_PARAMETERS, PARAMETER_STORE_SSM_CLIENT } from "@shared/constant/config";
import { describe, expect, it, vi } from "vitest";

const PROPERTIES: IParameterStoreConfigProperties = { application: "app", environment: "test", instanceName: "main", namespace: "postgres" };
const PARAMETER: Parameter = { Name: "/app/test/postgres/main/host", Value: "db.internal" };

@Injectable()
class OtherPropertiesFactory implements IParameterStoreConfigPropertiesFactory {
	public createOptions(): IParameterStoreConfigProperties {
		return { ...PROPERTIES, application: "other" };
	}
}

@Injectable()
class ParametersConsumer {
	public constructor(
		@Inject(ParameterStoreConfigService) public readonly config: ParameterStoreConfigService,
		@Inject(PARAMETER_STORE_CONFIG_PARAMETERS) public readonly parameters: Array<Parameter>,
	) {}
}

// A sibling of the configuration module that does not import it: it sees the exports only because the module is global
@Module({ exports: [ParametersConsumer], providers: [ParametersConsumer] })
class ParametersConsumerModule {}

@Injectable()
class PropertiesFactory implements IParameterStoreConfigPropertiesFactory {
	public createOptions(): IParameterStoreConfigProperties {
		return PROPERTIES;
	}
}

@Module({ exports: [PropertiesFactory], providers: [PropertiesFactory] })
class PropertiesFactoryModule {}

/**
 * Compiles the module next to ParametersConsumerModule with a stubbed SSM client.
 * @param {DynamicModule} module - The configured module.
 * @returns {Promise<{ moduleReference: TestingModule, send: ReturnType<typeof vi.fn> }>} The compiled module and the send mock.
 */
async function compile(module: DynamicModule): Promise<{ moduleReference: TestingModule; send: ReturnType<typeof vi.fn> }> {
	const send: ReturnType<typeof vi.fn> = vi.fn().mockResolvedValue({ Parameters: [PARAMETER] });

	const moduleReference: TestingModule = await Test.createTestingModule({ imports: [module, ParametersConsumerModule] })
		.overrideProvider(PARAMETER_STORE_SSM_CLIENT)
		.useValue({ send })
		.compile();

	return { moduleReference, send };
}

describe("ParameterStoreConfigModule", () => {
	it.each([
		["register", ParameterStoreConfigModule.register(PROPERTIES)],
		["registerAsync with useFactory", ParameterStoreConfigModule.registerAsync({ useFactory: () => PROPERTIES })],
		["registerAsync with useFactory and inject", ParameterStoreConfigModule.registerAsync<[PropertiesFactory]>({ imports: [PropertiesFactoryModule], inject: [PropertiesFactory], useFactory: (factory: PropertiesFactory) => factory.createOptions() })],
		["registerAsync with useClass", ParameterStoreConfigModule.registerAsync({ useClass: PropertiesFactory })],
		["registerAsync with useExisting", ParameterStoreConfigModule.registerAsync({ imports: [PropertiesFactoryModule], useExisting: PropertiesFactory })],
	])("loads parameters once and exports the service and the parameters globally through %s", async (_name: string, module: DynamicModule) => {
		const { moduleReference, send } = await compile(module);
		const consumer: ParametersConsumer = moduleReference.select(ParametersConsumerModule).get(ParametersConsumer, { strict: true });

		expect(consumer.config.get({ path: ["host"] })).toBe("db.internal");
		expect(consumer.parameters).toEqual([PARAMETER]);
		expect(send).toHaveBeenCalledTimes(1);

		await moduleReference.close();
	});

	it("prefers useExisting over useClass when both are given", async () => {
		const { moduleReference, send } = await compile(ParameterStoreConfigModule.registerAsync({ imports: [PropertiesFactoryModule], useClass: OtherPropertiesFactory, useExisting: PropertiesFactory }));

		expect((send.mock.calls[0]?.[0] as GetParametersByPathCommand).input.Path).toBe("/app/test");

		await moduleReference.close();
	});
});
