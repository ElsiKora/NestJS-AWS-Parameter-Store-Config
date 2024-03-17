# NestJS AWS Parameter Store Config

[![NPM](https://img.shields.io/npm/v/@elsikora/nestjs-aws-parameter-store-config.svg)](https://www.npmjs.com/package/@elsikora/nestjs-aws-parameter-store-config)
![Package License](https://img.shields.io/github/license/albertomr86/@elsikora/nestjs-aws-parameter-store-config)
![Build Status](https://github.com/albertomr86/@elsikora/nestjs-aws-parameter-store-config/workflows/ci/badge.svg)
[![codecov](https://codecov.io/gh/albertomr86/@elsikora/nestjs-aws-parameter-store-config/graph/badge.svg?token=WT83BVBOZE)](https://codecov.io/gh/albertomr86/@elsikora/nestjs-aws-parameter-store-config)

This package allows you to configure your NestJS application by loading the configuration from [AWS SSM Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html).

## Installation

```bash
npm install @elsikora/nestjs-aws-parameter-store-config @aws-sdk/client-ssm
```

## Configuration

### Static configuration

```typescript
import { Module } from '@nestjs/common';
import { ParameterStoreConfigModule } from '@elsikora/nestjs-aws-parameter-store-config';

@Module({
  imports: [
    ParameterStoreConfigModule.register({
      ssmParamStorePath: '/production/services/my-modules',
      ssmDecryptParams: true,
      ssmRecursive: false,
      ssmClientOptions: {
        region: 'us-east-1',
      },
    }),
  ],
})
export class AppModule {}
```

By calling `ParameterStoreConfigModule.register`, you configure the module to load all the parameters under the path `ssmParamStorePath`.

### Async configuration

The following example shows how to retrieve the configuration before registering the module.

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ParameterStoreConfigModule } from '@elsikora/nestjs-aws-parameter-store-config';

@Module({
  imports: [
    ParameterStoreConfigModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService<EnvironmentVariables>) => ({
        ssmParamStorePath: config.get<string>('APP_CONFIG_PATH'),
        ssmDecryptParams: true,
        ssmRecursive: false,
        ssmClientOptions: {
          region: config.get<string>('AWS_REGION'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## Options

| Option            	| Required 	| Default     	| Description                                                       	|
|-------------------	|----------	|-------------	|-------------------------------------------------------------------	|
| ssmParamStorePath 	| Yes      	|             	| The hierarchy for the parameter                                   	|
| ssmDecryptParams  	| No       	| `false`     	| Retrieve all parameters in a hierarchy with their value decrypted 	|
| ssmRecursive      	| No       	| `false`     	| Retrieve all parameters within a hierarchy                        	|
| ssmClientOptions  	| No       	| `undefined` 	| Options to pass to the underlying SSM client                      	|

## Services

This module exposes the following services.

### ConfigService

The `ParameterStoreConfigService` service allows you to access the configuration loaded from Parameter Store. Use its own class name as the injection token.

Let's assume the following parameters were previously registered:

- `/production/services/my-service/pagination-limit`: '25'
- `/production/services/my-service/post-table`: 'ProductionPostTable'

Configure the module with `ssmParamStorePath` pointing to `/production/services/my-service` to access all the parameters register for the service in production.

Then, access the configuration as follows:

```typescript
import { Injectable } from '@nestjs/common';
import { ParameterStoreConfigService } from '@elsikora/nestjs-aws-parameter-store-config';
import { DynamoDBClient, QueryCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';

@Injectable()
export class PostRepository {
  // Some common initialization.
  public constructor(
    private readonly dynamodbClient: DynamoDBClient,
    private readonly ParameterStoreConfigService: ParameterStoreConfigService,
  ) {}

  public getPostsByUser(userId: string) {
    // Here: Note how to retrieve the configuration.
    const table = await this.ParameterStoreConfigService.get<string>('post-table');
    const limit = await this.ParameterStoreConfigService.get<number>('pagination-limit');

    const queryCommand = new QueryCommand({
      TableName: table, // <- use
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': { S: `USER#${userId}` },
      },
      Limit: limit,  // <- use
    });

    const { Items = [] } = await this.dynamodbClient.send(queryCommand);
    // .... snip ....
  }
}
```

The `ParameterStoreConfigService` service exposes the following methods:

- `get(name, defaultValue)`: To retrieve a string configuration.
- `getBool(name, defaultValue)`: To retrieve a boolean configuration. The following values as considered truly: `true`, `True`, `1`, `y`, `yes`, and `Yes`.
- `getNumber(name, defaultValue)`: To retrieve a numeric configuration.

### How does the ParameterStoreConfigService service resolve the configurations?

When calling `get`, `getBool`, or `getNumber`, the service will look up a parameter whose name ends with the name specified. This means that the match is partial.

Given the following parameter:

- `/production/services/my-service/pagination-limit`: '25'

It can be retrieved using one of these alternatives:

- `get('pagination-limit')`
- `get('my-service/pagination-limit')`
- `get('services/my-service/pagination-limit')`
- `get('production/services/my-service/pagination-limit')`

### Raw Parameters

You can access the raw parameters loaded from the Parameter Store.

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { PARAMETER_STORE_CONFIG_PARAMETERS, PSConfigParameters } from '@elsikora/nestjs-aws-parameter-store-config';

@Injectable()
export class SophisticatedService {
  public constructor(
    @Inject(PARAMETER_STORE_CONFIG_PARAMETERS) parameters: PSConfigParameters,
  ) {
    console.log(parameters);
  }
}
```

Example of output:

```json
[
  {
      "Name": "/production/services/my-modules/pagination-limit",
      "Type": "String",
      "Value": "25",
      "Version": 1,
      "LastModifiedDate": "2022-09-03T02:55:00.389000-04:00",
      "ARN": "arn:aws:ssm:us-east-1:000000000000:parameter/production/services/my-modules/pagination-limit",
      "DataType": "text"
  },
  {
      "Name": "/production/services/my-modules/post-table",
      "Type": "String",
      "Value": "ProductionPostTable",
      "Version": 1,
      "LastModifiedDate": "2022-09-03T03:15:15.032000-04:00",
      "ARN": "arn:aws:ssm:us-east-1:000000000000:parameter/production/services/my-modules/post-table",
      "DataType": "text"
  }
]
```

## Troubleshooting

### Empty list of parameters returned

This happens when `recursive` is `false` and the specified path does not resolve the final level in the hierarchy.

[Reference: GetParametersByPath](https://docs.aws.amazon.com/systems-manager/latest/APIReference/API_GetParametersByPath.html#API_GetParametersByPath_RequestSyntax)

```typescript
import { Module } from '@nestjs/common';
import { ParameterStoreConfigModule } from '@elsikora/nestjs-aws-parameter-store-config';

@Module({
  imports: [
    ParameterStoreConfigModule.register({
      ssmParamStorePath: '/production',
      ssmRecursive: true,   // <-- specify recursively
    }),
  ],
})
export class AppModule {}
```
