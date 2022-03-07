const importDir = require('directory-import');

const camelCase = require('lodash/camelCase');
const forEach   = require('lodash/forEach');
const pick      = require('lodash/pick');

const consoleTableObject = require('./utils/console-table-object');
const setIfNotExists     = require('./utils/set-if-not-exists');

const {
  NODE_ENGINE_VERSION,
  PROJECT_DESCRIPTION,
  PROJECT_NAME,

  AWS_PROFILE,
  AWS_REGION,
  STACK_NAME,
  STAGE,

  IS_OFFLINE,
  IS_DEV,
} = require('./constants/application');

// Base configuration
(() => {
  const config = module.exports;

  config.service = PROJECT_NAME;

  config.frameworkVersion = '2';

  config.configValidationMode                = 'error';
  config.unresolvedVariablesNotificationMode = 'error';
  config.deprecationNotificationMode         = 'error';

  config.plugins = [
    // 'serverless-domain-manager',
    // 'serverless-certificate-creator',
    'serverless-offline',
    'serverless-stack-output',
    'serverless-plugin-scripts',
    'serverless-deployment-bucket',
    'serverless-plugin-tree-shake',
    'serverless-iam-roles-per-function',
    'serverless-plugin-include-dependencies',
  ];

  consoleTableObject('⚡ Serverless base configuration:', config);
})();

// Provider configuration
(() => {
  const config = setIfNotExists(module.exports, 'provider', {}).provider;

  config.name    = 'aws';
  config.runtime = `nodejs${NODE_ENGINE_VERSION}`;

  config.stage     = STAGE;
  config.region    = AWS_REGION;
  config.stackName = STACK_NAME;

  config.profile         = IS_OFFLINE ? AWS_PROFILE : undefined;
  config.disableRollback = !!IS_DEV;

  config.logRetentionInDays   = 7;
  config.lambdaHashingVersion = 20_201_221;

  config.versionFunctions = true;

  consoleTableObject('⚡ Serverless provider configuration:', config);
})();

// Deployment bucket configuration
(() => {
  const config = setIfNotExists(module.exports, 'provider.deploymentBucket', {}).provider.deploymentBucket;

  config.name = `${STACK_NAME}-deployment-bucket`;

  config.blockPublicAccess              = true;
  config.maxPreviousDeploymentArtifacts = 1;

  consoleTableObject('⚡ Serverless deployment bucket configuration:', config);
})();

// Api configuration
(() => {
  setIfNotExists(module.exports, 'provider', {});
  setIfNotExists(module.exports, 'provider.apiGateway', {});
  setIfNotExists(module.exports, 'provider.logs.restApi', {});
  setIfNotExists(module.exports, 'provider.logs.websocket', {});

  const config = module.exports.provider;

  config.apiName           = `${STACK_NAME}-http-api`;
  config.websocketsApiName = `${STACK_NAME}-websocket-api`;

  config.apiGateway.description            = PROJECT_DESCRIPTION;
  config.apiGateway.disableDefaultEndpoint = true;
  config.apiGateway.metrics                = true;

  config.logs.restApi.level   = 'INFO';
  config.logs.websocket.level = 'INFO';

  consoleTableObject('⚡ Serverless api gateway configuration:', config);
})();

// Package configuration
(() => {
  const config = setIfNotExists(module.exports, 'package', {}).package;

  config.individually = true;
  config.exclude      = ['package.json'];

  // no need to spend time excluding dev dependencies, given that
  // serverless-plugin-tree-shake does it already
  config.excludeDevDependencies = false;

  consoleTableObject('⚡ Serverless package Configuration:', config);
})();

// Stack output configuration
(() => {
  const config = setIfNotExists(module.exports, 'custom.output', {}).custom.output;

  config.file = '.serverless/stack-output.json';

  consoleTableObject('⚡ Serverless stack output Configuration:', config);
})();

// Lambda functions configuration
(() => {
  const config = setIfNotExists(module.exports, 'functions', {}).functions;

  const preparedLambdaFunctionsDataToLog = {};

  const importLambdaFunctionsConfigurationOptions = {
    directoryPath: './lambda-functions',
    exclude:       /^((?!lambda-config.js).)*$/, // exclude everything that is not a lambda-config.js
  };

  importDir(importLambdaFunctionsConfigurationOptions, (fileName, filePath, fileData) => {
    forEach(fileData, (lambdaFunctionConfig, lambdaFunctionName) => {
      config[lambdaFunctionName] = lambdaFunctionConfig;

      preparedLambdaFunctionsDataToLog[lambdaFunctionName] = pick(lambdaFunctionConfig, ['handler', 'description']);
    });
  });

  console.group('⚡', 'Serverless prepared lambda functions:');
  console.table(preparedLambdaFunctionsDataToLog);
  console.groupEnd();
})();

// Resources configuration
(() => {
  const config = setIfNotExists(module.exports, 'resources', {}).resources;

  importDir({ directoryPath: './resources' }, (resourceName, resourcePath, resourceConfig) => {
    const resourceCamelCaseName = camelCase(resourceName);

    config[resourceCamelCaseName] = resourceConfig;
  });

  console.group('⚡', 'Serverless resources configuration:');
  console.table(config);
  console.groupEnd();
})();
