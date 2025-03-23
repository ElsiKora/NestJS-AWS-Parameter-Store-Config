<p align="center">
  <img src="https://6jft62zmy9nx2oea.public.blob.vercel-storage.com/nestjs-aws-parameter-store-config-uTW0f4g5XGnXSI5q6V99uzMjWtY1EX.png" width="500" alt="project-logo">
</p>

<h1 align="center">🚀 NestJS-AWS-Parameter-Store-Config</h1>
<p align="center"><em>Seamlessly integrate AWS Parameter Store with your NestJS applications for robust configuration management</em></p>

<p align="center">
    <a aria-label="ElsiKora logo" href="https://elsikora.com">
  <img src="https://img.shields.io/badge/MADE%20BY%20ElsiKora-333333.svg?style=for-the-badge" alt="ElsiKora">
</a> <img src="https://img.shields.io/badge/npm-blue.svg?style=for-the-badge&logo=npm&logoColor=white" alt="npm"> <img src="https://img.shields.io/badge/version-green.svg?style=for-the-badge&logo=npm&logoColor=white" alt="version"> <img src="https://img.shields.io/badge/license-yellow.svg?style=for-the-badge&logo=license&logoColor=white" alt="license"> <img src="https://img.shields.io/badge/typescript-blue.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="typescript"> <img src="https://img.shields.io/badge/nestjs-red.svg?style=for-the-badge&logo=nestjs&logoColor=white" alt="nestjs"> <img src="https://img.shields.io/badge/aws-orange.svg?style=for-the-badge&logo=amazonaws&logoColor=white" alt="aws">
</p>


## 📚 Table of Contents
- [Description](#-description)
- [Features](#-features)
- [Installation](#-installation)
- [Usage](#-usage)
- [Roadmap](#-roadmap)
- [FAQ](#-faq)
- [License](#-license)


## 📖 Description
NestJS-AWS-Parameter-Store-Config is a powerful library that brings AWS Parameter Store capabilities directly to your NestJS applications. It provides a clean, type-safe interface for retrieving configuration parameters stored in AWS Parameter Store, enabling centralized configuration management across multiple services and environments. This library is particularly valuable for microservice architectures, serverless applications, or any system where configuration management needs to be secure, scalable, and maintainable. By abstracting the AWS SDK interactions, it offers a more developer-friendly way to access your configuration while maintaining the security benefits of AWS Parameter Store, such as encryption, version control, and access policies.

## 🚀 Features
- ✨ **🔒 Secure access to configuration parameters stored in AWS Parameter Store**
- ✨ **🌐 Hierarchical organization of parameters by application, environment, and service**
- ✨ **✨ Simple and intuitive API for retrieving configuration values**
- ✨ **🧩 Full integration with NestJS dependency injection system**
- ✨ **⚡ Supports both synchronous and asynchronous module initialization**
- ✨ **🔐 Built-in parameter decryption for secure strings**
- ✨ **📁 Recursive parameter loading for complex hierarchical structures**
- ✨ **🔄 Comprehensive TypeScript support with interfaces for all configuration options**
- ✨ **📊 Verbose mode for debugging and monitoring parameter loading**

## 🛠 Installation
```bash
# Using npm
npm install nestjs-aws-parameter-store-config

# Using yarn
yarn add nestjs-aws-parameter-store-config

# Using pnpm
pnpm add nestjs-aws-parameter-store-config


This package has peer dependencies on `@aws-sdk/client-ssm` and `@nestjs/common`, so make sure they are installed in your project:


npm install @aws-sdk/client-ssm @nestjs/common
```

## 💡 Usage
## Basic Usage

First, import and register the `ParameterStoreConfigModule` in your application's root module:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ParameterStoreConfigModule } from 'nestjs-aws-parameter-store-config';

@Module({
  imports: [
    ParameterStoreConfigModule.register({
      application: 'my-app',
      environment: 'development',
      shouldDecryptParameters: true,
      shouldUseRecursiveLoading: true,
      isVerbose: true
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

## Using the Config Service

Once the module is registered, you can inject the `ParameterStoreConfigService` in your services or controllers to access the configuration values:

```typescript
// my.service.ts
import { Injectable } from '@nestjs/common';
import { ParameterStoreConfigService } from 'nestjs-aws-parameter-store-config';

@Injectable()
export class MyService {
  constructor(private readonly configService: ParameterStoreConfigService) {}

  async doSomething() {
    // Get a parameter by its full name
    const apiKey = this.configService.get('/my-app/development/my-app-reaper-api/api/key');
    
    // Or use structured approach
    const dbConnectionString = this.configService.get({
      application: 'my-app',
      environment: 'development',
      service: 'postgres',
      path: ['connection', 'string']
    });
    
    // Use the parameters
    // ...
  }
}
```

## Async Module Registration

You can also register the module asynchronously, which is useful when you need to load configuration data from other sources before initializing the AWS Parameter Store client:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ParameterStoreConfigModule } from 'nestjs-aws-parameter-store-config';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ParameterStoreConfigModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        application: configService.get('APP_NAME'),
        environment: configService.get('NODE_ENV'),
        config: {
          region: configService.get('AWS_REGION'),
          credentials: {
            accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
          },
        },
        shouldDecryptParameters: true,
        shouldUseRecursiveLoading: true,
      }),
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

## Using Environment Variables

The config service can automatically detect application and environment from environment variables:

```typescript
// Set these environment variables in your deployment
// APPLICATION=my-app
// ENVIRONMENT=production

// In your code
const databaseUrl = this.configService.get({
  // application and environment will be auto-detected
  service: 'database',
  path: ['url']
});
```

## Custom AWS Configuration

You can provide custom AWS SDK configuration, including region, credentials, and other options:

```typescript
ParameterStoreConfigModule.register({
  application: 'my-app',
  environment: 'development',
  config: {
    region: 'us-west-2',
    credentials: {
      accessKeyId: 'YOUR_ACCESS_KEY',
      secretAccessKey: 'YOUR_SECRET_KEY',
    },
    endpoint: 'https://ssm.us-west-2.amazonaws.com',
    maxAttempts: 3,
  },
})
```

## Advanced Use Case: Parameter Path Structure

This library works best with a hierarchical parameter structure in AWS Parameter Store. Here's a recommended structure:

```
/[application]/[environment]/[instance-name]/[service]/[param-path]
```

For example:

```
/my-app/production/my-app-reaper-api/database/host
/my-app/production/my-app-reaper-api/database/port
/my-app/production/my-app-reaper-api/database/username
/my-app/production/my-app-reaper-api/database/password
```

With this structure, you can retrieve parameters using a concise syntax:

```typescript
const dbHost = this.configService.get({
  service: 'database',
  path: ['host']
});

const dbCredentials = {
  host: this.configService.get({ service: 'database', path: ['host'] }),
  port: this.configService.get({ service: 'database', path: ['port'] }),
  username: this.configService.get({ service: 'database', path: ['username'] }),
  password: this.configService.get({ service: 'database', path: ['password'] }),
};
```

## Usage with Specific Instance Types

The library provides built-in enums for commonly used services and environments:

```typescript
import { EService, EEnvironment, EInstanceName } from 'nestjs-aws-parameter-store-config';

const apiKey = this.configService.get({
  environment: EEnvironment.PRODUCTION,
  instanceName: EInstanceName.REAPER_API,
  service: EService.AUTH_SERVICE,
  path: ['api', 'key']
});
```

## Testing with Parameter Store

For testing environments, you can use the AWS Parameter Store local emulator or mock the `ParameterStoreConfigService`:

```typescript
// In your test file
import { Test } from '@nestjs/testing';
import { ParameterStoreConfigService, PARAMETER_STORE_CONFIG_PARAMETERS } from 'nestjs-aws-parameter-store-config';

describe('MyService', () => {
  let service: MyService;
  let configService: ParameterStoreConfigService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MyService,
        ParameterStoreConfigService,
        {
          provide: PARAMETER_STORE_CONFIG_PARAMETERS,
          useValue: [
            { Name: '/my-app/test/my-app-reaper-api-test/api/key', Value: 'test-api-key' },
            { Name: '/my-app/test/my-app-reaper-api-test/database/url', Value: 'test-db-url' },
          ],
        },
      ],
    }).compile();

    service = moduleRef.get<MyService>(MyService);
    configService = moduleRef.get<ParameterStoreConfigService>(ParameterStoreConfigService);
  });

  it('should retrieve configuration values', () => {
    expect(configService.get('/my-app/test/my-app-reaper-api-test/api/key')).toBe('test-api-key');
    // ... more tests
  });
});
```

## 🛣 Roadmap
| Task / Feature | Status |
|---------------|--------|
| Future development plans may include: | 🚧 In Progress |
| - Caching layer to reduce API calls to AWS Parameter Store | 🚧 In Progress |
| - Parameter validation with schema support | 🚧 In Progress |
| - Support for parameter versioning and history tracking | 🚧 In Progress |
| - Integration with AWS AppConfig for feature flags | 🚧 In Progress |
| - Real-time parameter updates through event subscription | 🚧 In Progress |
| - Built-in support for common parameter patterns (database connections, API keys, etc.) | 🚧 In Progress |
| - Parameter transformation and type conversion utilities | 🚧 In Progress |
| - Web interface for parameter management | 🚧 In Progress |
| - Enhanced metrics and monitoring capabilities | 🚧 In Progress |
| Contributions and feature requests are welcome! Please check the GitHub repository for the most up-to-date roadmap. | 🚧 In Progress |
| (done) 🔒 Secure access to configuration parameters stored in AWS Parameter Store | 🚧 In Progress |
| (done) 🌐 Hierarchical organization of parameters by application, environment, and service | 🚧 In Progress |
| (done) ✨ Simple and intuitive API for retrieving configuration values | 🚧 In Progress |

## ❓ FAQ
## Frequently Asked Questions

### What are the advantages of using AWS Parameter Store over environment variables?

AWS Parameter Store offers several advantages over simple environment variables:
- Centralized management of parameters across multiple applications and environments
- Support for parameter hierarchies and organization
- Built-in encryption for sensitive values
- Parameter versioning and audit trails
- Integration with IAM for access control
- No need to rebuild or redeploy applications when configuration changes

### How does this library handle parameter caching?

Currently, parameters are loaded when the application starts. There's no built-in cache refreshing mechanism, but you can restart your application to reload parameters or implement your own caching layer on top of this library.

### Is there a limit to how many parameters I can retrieve?

AWS Parameter Store has its own service limits. This library handles pagination automatically, so you can retrieve a large number of parameters. However, be mindful of AWS's rate limits and pricing.

### Can I use this with AWS Lambda?

Yes, this library works well with AWS Lambda functions using NestJS. Just be aware that the cold start time might increase slightly due to the initial parameter loading.

### How do I handle different environments (dev, staging, prod)?

The library is designed to support different environments through the hierarchical structure of parameters. Simply use the appropriate environment value when registering the module or structure your parameters with environment-specific paths.

### Does it support parameter encryption and decryption?

Yes, set the `shouldDecryptParameters` option to `true` when registering the module to automatically decrypt secure string parameters.

### Can I use this with non-NestJS applications?

This library is specifically designed for NestJS and leverages its dependency injection system. For non-NestJS applications, you might want to use the AWS SDK directly or find a different library.

## 🔒 License
This project is licensed under **MIT License

Copyright (c) 2025 ElsiKora

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.**.
