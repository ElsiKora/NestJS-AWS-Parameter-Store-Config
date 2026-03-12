# @elsikora/nestjs-aws-parameter-store-config

NestJS module for loading AWS Systems Manager Parameter Store values through one explicit, canonical SSM contract.

## Canonical SSM Contract

Every parameter lookup follows the same path model:

```text
/<application>/<environment>/<namespace>/<instanceName>/<path...>
```

Where:

- `application` is the product or system name, for example `gameport`
- `environment` is a lifecycle environment token: `local`, `development`, `staging`, `production`, `test`
- `namespace` is one owner/runtime/resource token such as `aws-ecs-fargate` or `aws-rds`
- `instanceName` is the concrete deployable unit or resource instance
- `path` is the config path inside that namespace

Example paths:

```text
/gameport/staging/aws-ecs-fargate/reaper-api/api/version
/gameport/staging/aws-ecs-fargate/reaper-api/swagger/terms-url
/gameport/staging/aws-rds/aurora-postgres/host
/gameport/staging/aws-secrets-manager/database/secret-id
```

## Installation

```bash
npm install @elsikora/nestjs-aws-parameter-store-config @aws-sdk/client-ssm @nestjs/common
```

## Module Registration

Register the module with explicit defaults for `application`, `environment`, `namespace`, and `instanceName`.

```typescript
import { Module } from "@nestjs/common";
import { EEnvironment, ENamespace, ParameterStoreConfigModule } from "@elsikora/nestjs-aws-parameter-store-config";

@Module({
	imports: [
		ParameterStoreConfigModule.register({
			application: "gameport",
			environment: EEnvironment.STAGING,
			namespace: ENamespace.AWS_ECS_FARGATE,
			instanceName: "reaper-api",
			shouldDecryptParameters: true,
			config: {
				region: "eu-north-1",
			},
		}),
	],
})
export class AppModule {}
```

Async registration:

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EEnvironment, ENamespace, ParameterStoreConfigModule } from "@elsikora/nestjs-aws-parameter-store-config";

@Module({
	imports: [
		ConfigModule.forRoot(),
		ParameterStoreConfigModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				application: "gameport",
				environment: EEnvironment.STAGING,
				namespace: ENamespace.AWS_ECS_FARGATE,
				instanceName: "reaper-api",
				shouldDecryptParameters: true,
				shouldUseRecursiveLoading: true,
				config: {
					region: configService.getOrThrow("AWS_REGION"),
				},
			}),
		}),
	],
})
export class AppModule {}
```

## Lookup API

The canonical lookup API is:

```typescript
get(properties: {
	path: string[];
	namespace?: ENamespace | string;
	instanceName?: string;
	application?: string;
	environment?: EEnvironment | string;
}): string | null;
```

Examples:

```typescript
import { Injectable } from "@nestjs/common";
import { ENamespace, ParameterStoreConfigService } from "@elsikora/nestjs-aws-parameter-store-config";

@Injectable()
export class ExampleService {
	public constructor(private readonly configService: ParameterStoreConfigService) {}

	public getApiPort(): null | string {
		return this.configService.get({
			path: ["api", "port"],
		});
	}

	public getSwaggerTermsUrl(): null | string {
		return this.configService.get({
			path: ["swagger", "terms-url"],
		});
	}

	public getDatabaseHost(): null | string {
		return this.configService.get({
			namespace: ENamespace.AWS_RDS,
			instanceName: "aurora-postgres",
			path: ["host"],
		});
	}

	public getDatabaseSecretId(): null | string {
		return this.configService.get({
			namespace: ENamespace.AWS_SECRETS_MANAGER,
			instanceName: "database",
			path: ["secret-id"],
		});
	}
}
```

With the defaults from the registration example above, these lookups resolve to:

```text
get({ path: ["api", "port"] })
=> /gameport/staging/aws-ecs-fargate/reaper-api/api/port

get({ path: ["swagger", "terms-url"] })
=> /gameport/staging/aws-ecs-fargate/reaper-api/swagger/terms-url

get({ namespace: "aws-rds", instanceName: "aurora-postgres", path: ["host"] })
=> /gameport/staging/aws-rds/aurora-postgres/host

get({ namespace: "aws-secrets-manager", instanceName: "database", path: ["secret-id"] })
=> /gameport/staging/aws-secrets-manager/database/secret-id
```

## Loader Behavior

At startup the module loads parameters recursively from:

```text
/${application}/${environment}
```

That broad prefix keeps one in-memory cache capable of serving:

- app config under `aws-ecs-fargate/reaper-api/...`
- shared infrastructure metadata under `aws-rds/aurora-postgres/...`
- shared secrets metadata under `aws-secrets-manager/database/...`

`shouldUseRecursiveLoading` defaults to `true`. Disable it only if you intentionally want non-recursive SSM loading.

## Built-In Enums

`EEnvironment` includes lifecycle environments only:

```typescript
EEnvironment.LOCAL;
EEnvironment.DEVELOPMENT;
EEnvironment.STAGING;
EEnvironment.PRODUCTION;
EEnvironment.TEST;
```

`ENamespace` includes curated owner/runtime/resource tokens:

```typescript
ENamespace.AWS_ECS_FARGATE;
ENamespace.AWS_ECS_EC2;
ENamespace.AWS_EKS_FARGATE;
ENamespace.AWS_EKS_EC2;
ENamespace.AWS_RDS;
ENamespace.AWS_SECRETS_MANAGER;
ENamespace.AWS_CLOUDWATCH;
```

You can also pass custom strings for `environment` and `namespace` when your system needs tokens outside the built-in enums.

## Validation Rules

The module fails fast with explicit errors when:

- `application` is missing
- `environment` is missing
- `namespace` is missing
- `instanceName` is missing
- `path` is not a non-empty `string[]`
- any segment is empty, contains only whitespace, or contains `/`

## License

MIT
