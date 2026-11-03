# [3.0.0](https://github.com/ElsiKora/NestJS-AWS-Parameter-Store-Config/compare/v2.0.2...v3.0.0) (2026-11-03)

### Build System

- **deps:** move to nestjs 12 and the latest tooling majors ([33dbf4d](https://github.com/ElsiKora/NestJS-AWS-Parameter-Store-Config/commit/33dbf4d908b60c29c9749e605f396b8e272ac5a1))
- **package:** publish an esm-only build with extension-qualified declarations ([ab483ec](https://github.com/ElsiKora/NestJS-AWS-Parameter-Store-Config/commit/ab483ec719cb96dca4c884edbc92277b556edd91))

### BREAKING CHANGES

- **package:** the package is ES modules only. dist/esm, dist/cjs and the require export condition are gone. A commonjs application keeps require() and loads the package through node's require(esm), and deep imports into dist no longer resolve.
- **deps:** the peer range of @nestjs/common is now >=12.3.2 <13 and engines.node is ^22.13.0 || >=24.11.0. Applications on nestjs 11 or older, or on node 20, stay on 2.x.

## [2.0.2](https://github.com/ElsiKora/NestJS-AWS-Parameter-Store-Config/compare/v2.0.1...v2.0.2) (2026-03-12)

## [2.0.1](https://github.com/ElsiKora/NestJS-AWS-Parameter-Store-Config/compare/v2.0.0...v2.0.1) (2026-03-12)

# [2.0.0](https://github.com/ElsiKora/NestJS-AWS-Parameter-Store-Config/compare/v1.2.14...v2.0.0) (2026-03-12)

### Code Refactoring

- **config:** replace service enum with namespace enum and simplify config structure ([21cd19d](https://github.com/ElsiKora/NestJS-AWS-Parameter-Store-Config/commit/21cd19dfba64ea54fdbdf7c02f6a01fde4dda1fa))

### BREAKING CHANGES

- **config:** Service enum replaced with Namespace enum - update imports and usage accordingly.

Remove service.enum.ts and instance-name.enum.ts in favor of namespace.enum.ts. Simplify config service interface and properties handling. Update README.md with revised documentation. Remove commitlint-ai config file. Update package.json dependencies and configuration.

## [1.2.14](https://github.com/ElsiKora/NestJS-AWS-Parameter-Store-Config/compare/v1.2.13...v1.2.14) (2025-03-23)

## [1.2.13](https://github.com/ElsiKora/NestJS-AWS-Parameter-Store-Config/compare/v1.2.12...v1.2.13) (2025-03-23)

## [1.2.12](https://github.com/ElsiKora/NestJS-AWS-Parameter-Store-Config/compare/v1.2.11...v1.2.12) (2025-03-23)

## [1.2.11](https://github.com/ElsiKora/NestJS-AWS-Parameter-Store-Config/compare/v1.2.10...v1.2.11) (2025-03-23)

## [1.2.10](https://github.com/ElsiKora/NestJS-AWS-Parameter-Store-Config/compare/v1.2.9...v1.2.10) (2025-03-23)

## [1.2.9](https://github.com/ElsiKora/NestJS-AWS-Parameter-Store-Config/compare/v1.2.8...v1.2.9) (2025-03-23)
