'use strict';

const path = require('node:path');
const { tests } = require('@iobroker/testing');

// Starts js-controller and an instance of the adapter. On its first start the instance writes `native.dbMigrated`
// and restarts once (src/lib/configSync.ts), so a test that talks to it has to wait for the second start.
tests.integration(path.join(__dirname, '..'));
