import functions from './javascript/functions.test.js';
import variables from './javascript/variables.test.js';
import classes from './javascript/classes.test.js';
import asyncAwait from './javascript/async-await.test.js';
import classFields from './javascript/class-fields.test.js';
import destructuring from './javascript/destructuring.test.js';
import errorHandling from './javascript/error-handling.test.js';
import functionCalls from './javascript/function-calls.test.js';
import modules from './javascript/modules.test.js';
import objects from './javascript/objects.test.js';
import operators from './javascript/operators.test.js';
import restSpread from './javascript/rest-spread.test.js';
import templateLiterals from './javascript/template-literals.test.js';

describe('JavaScript', () => {
    functions();
    variables();
    classes();
    asyncAwait();
    classFields();
    destructuring();
    errorHandling();
    functionCalls();
    modules();
    objects();
    operators();
    restSpread();
    templateLiterals();
});
