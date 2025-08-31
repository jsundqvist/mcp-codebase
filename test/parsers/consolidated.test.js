import { createJavaScriptParser } from '../../src/parsers/javascript.js';
import { jsQuery } from '../../src/parsers/javascript.js';
import coreDeclarations from './consolidated/core-declarations.test.js';
import controlFlow from './consolidated/control-flow.test.js';
import expressionsOperators from './consolidated/expressions-operators.test.js';
import callsErrorHandling from './consolidated/calls-error-handling.test.js';
import classFeatures from './consolidated/class-features.test.js';
import advancedFeatures from './consolidated/advanced-features.test.js';

const parser = createJavaScriptParser(jsQuery);

describe('JavaScript - New Consolidated Tests', () => {
    coreDeclarations(parser);
    controlFlow(parser);
    expressionsOperators(parser);
    callsErrorHandling(parser);
    classFeatures(parser);
    advancedFeatures(parser);
});
