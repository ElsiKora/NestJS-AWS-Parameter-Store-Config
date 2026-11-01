import type { IParameterStoreConfigProperties } from "@elsikora/nestjs-aws-parameter-store-config";
import type { DynamicModule, OnModuleInit } from "@nestjs/common";

import { EEnvironment, ENamespace, ParameterStoreConfigModule, ParameterStoreConfigService } from "@elsikora/nestjs-aws-parameter-store-config";
import { Inject, Injectable, Module } from "@nestjs/common";

const SSM_ENDPOINT: string = "SSM_ENDPOINT";

@Module({})
class EndpointModule {
	public static register(endpoint: string): DynamicModule {
		return { exports: [SSM_ENDPOINT], module: EndpointModule, providers: [{ provide: SSM_ENDPOINT, useValue: endpoint }] };
	}
}

@Module({})
export class AppModule {
	/**
	 * Registers the configuration with ParameterStoreConfigModule.register.
	 * @param {string} endpoint - Stub endpoint.
	 * @returns {DynamicModule} The application module.
	 */
	public static withRegister(endpoint: string): DynamicModule {
		return { imports: [ParameterStoreConfigModule.register(createProperties(endpoint))], module: AppModule, providers: [DatabaseSettings] };
	}

	/**
	 * Registers the configuration with ParameterStoreConfigModule.registerAsync and an injected factory argument.
	 * @param {string} endpoint - Stub endpoint.
	 * @returns {DynamicModule} The application module.
	 */
	public static withRegisterAsync(endpoint: string): DynamicModule {
		return {
			imports: [
				ParameterStoreConfigModule.registerAsync<[string]>({
					imports: [EndpointModule.register(endpoint)],
					inject: [SSM_ENDPOINT],
					useFactory: (injectedEndpoint: string) => createProperties(injectedEndpoint),
				}),
			],
			module: AppModule,
			providers: [DatabaseSettings],
		};
	}
}

@Injectable()
export class DatabaseSettings implements OnModuleInit {
	public host: null | string = null;

	public password: null | string = null;

	public redisUrl: null | string = null;

	public constructor(@Inject(ParameterStoreConfigService) private readonly config: ParameterStoreConfigService) {}

	public onModuleInit(): void {
		this.host = this.config.get({ path: ["host"] });
		this.password = this.config.get({ path: ["password"] });
		this.redisUrl = this.config.get({ instanceName: "cache", namespace: ENamespace.REDIS, path: ["url"] });
	}
}

/**
 * Builds the module defaults that point the SSM client at the stub.
 * @param {string} endpoint - Stub endpoint.
 * @returns {IParameterStoreConfigProperties} The module properties.
 */
export function createProperties(endpoint: string): IParameterStoreConfigProperties {
	return {
		application: "smoke",
		config: { credentials: { accessKeyId: "smoke", secretAccessKey: "smoke" }, endpoint, maxAttempts: 1, region: "us-east-1" },
		environment: EEnvironment.TEST,
		instanceName: "main",
		namespace: ENamespace.POSTGRES,
		shouldDecryptParameters: true,
	};
}
