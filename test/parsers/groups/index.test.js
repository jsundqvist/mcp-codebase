import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { jsQuery } from '../../../src/parsers/javascript.js';
import coreDeclarations from './core-declarations.test.js';
import classFields from './class-fields.test.js';
import functionCalls from './function-calls.test.js';
import controlFlow from './control-flow.test.js';
import errorHandling from './error-handling.test.js';
import operatorsExpressions from './operators-expressions.test.js';
import es6ObjectFeatures from './es6-object-features.test.js';
import es6Modules from './es6-modules.test.js';
import miscellaneous from './miscellaneous.test.js';
import conditionals from './conditionals.test.js';
import loops from './loops.test.js';
import statements from './statements.test.js';
import arrowFunctions from './arrow-functions.test.js';
import objectPatterns from './object-patterns.test.js';
import destructuring from './destructuring.test.js';
import templateLiterals from './template-literals.test.js';

const parser = createJavaScriptParser(jsQuery);

describe('JavaScript - Pattern Groups', () => {
    coreDeclarations(parser);
    classFields(parser);
    functionCalls(parser);
    controlFlow(parser);
    errorHandling(parser);
    operatorsExpressions(parser);
    es6ObjectFeatures(parser);
    es6Modules(parser);
    miscellaneous(parser);
    conditionals(parser);
    loops(parser);
    statements(parser);
    arrowFunctions(parser);
    objectPatterns(parser);
    destructuring(parser);
    templateLiterals(parser);
});
