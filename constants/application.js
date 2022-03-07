const { STAGE_REGIONS } = require('./aws');
const packageFile       = require('../package.json');

module.exports = {
  STAGE:      'development',
  SLS_DEBUG:  '*',
  IS_OFFLINE: true,

  NODE_ENGINE_VERSION: packageFile.engines.node,
  PROJECT_DESCRIPTION: packageFile.description,
  PROJECT_NAME:        packageFile.name,

  get AWS_REGION() {
    return STAGE_REGIONS[this.STAGE];
  },

  get AWS_PROFILE() {
    return this.IS_OFFLINE ? this.PROJECT_NAME : undefined;
  },

  get STACK_NAME() {
    return `${this.PROJECT_NAME}-${this.STAGE}`;
  },

  get IS_DEV() {
    return this.STAGE === 'development';
  },

  get IS_DEBUG_ENABLED() {
    return this.IS_OFFLINE === 'true' || this.IS_DEV === 'true';
  },
};
