import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    operatorPattern,
    logicalAssignmentPattern,
    optionalPattern,
    callPattern,
    errorHandlingPattern
} from '../../../src/parsers/javascript.js';
import { query, individual } from '../test-utils.js';

// Combine patterns for this group
const expressionsOperatorsQuery = [
    operatorPattern,
    logicalAssignmentPattern,
    optionalPattern,
    callPattern,
    errorHandlingPattern
].join('\n');

const run = function(parser) {
    describe('Expressions & Operators', () => {
        describe('Operators', () => {
            it('captures basic member access and binary expressions', () => {
                const code = `
const obj = {
    x: 1,
    y: 2
};
const value = obj.x;
const sum = a + b;
const product = x * y;`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check member expressions
                const memberAccess = captures.filter(c => c.name === 'member');
                expect(memberAccess.length).to.equal(1);  // obj.x

                // Check binary expressions
                const binaryOps = captures.filter(c => c.name === 'binary');
                expect(binaryOps.length).to.equal(2);  // + and * operations
            });
        });

        describe('Logical Assignments', () => {
            it('captures logical assignment operators', () => {
                const code = `
// Nullish coalescing assignment
let settings = {};
settings.timeout ??= 5000;  // Set if undefined/null
settings.retries ??= 3;     // Set if undefined/null

// Logical AND assignment
let config = { debug: true };
config.verbose &&= isDevMode;  // Set only if config.verbose is truthy
permissions.write &&= userHasAccess;  // Set only if permissions.write is truthy

// Logical OR assignment
let headers = {};
headers.contentType ||= 'application/json';  // Set if falsy
cache.maxSize ||= 1000;  // Set if falsy`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check logical assignments
                const logicalOps = captures.filter(c => c.name === 'logical_operator');
                expect(logicalOps.length).to.equal(6);  // 2 of each operator type

                // Group by operator type
                const operators = logicalOps.map(c => c.node.text);
                const nullishAssigns = operators.filter(op => op === '??=');
                const andAssigns = operators.filter(op => op === '&&=');
                const orAssigns = operators.filter(op => op === '||=');

                // Check counts of each type
                expect(nullishAssigns.length).to.equal(2);  // timeout and retries
                expect(andAssigns.length).to.equal(2);      // verbose and write
                expect(orAssigns.length).to.equal(2);       // contentType and maxSize

                // Check full assignments
                const assignments = captures.filter(c => c.name === 'logical_assignment');
                expect(assignments.length).to.equal(6);  // All logical assignments

                // Verify we captured some specific assignments
                const assignmentTexts = assignments.map(c => c.node.text);
                expect(assignmentTexts.some(t => t.includes('settings.timeout ??= 5000'))).to.equal(true);
                expect(assignmentTexts.some(t => t.includes('config.verbose &&= isDevMode'))).to.equal(true);
                expect(assignmentTexts.some(t => t.includes('headers.contentType ||= '))).to.equal(true);
            });
        });

        describe('Optional Chaining', () => {
            it('captures optional chaining and nullish coalescing expressions', () => {
                const code = `
// Basic optional chaining
const name = user?.profile?.name;
const items = response?.data?.items;

// Nullish coalescing
const value = data?.value ?? defaultValue;
const config = settings?.timeout ?? 5000;

// Complex nested optional chaining
const nested = obj?.foo?.bar?.baz?.qux;
const method = instance?.compute?.()?.result;

// Multiple nullish coalescing
const fallback = value ?? backup ?? default ?? null;

// Combined optional chaining and nullish coalescing
const complex = user?.settings?.theme?.color ?? defaultTheme?.color ?? '#000000';`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check optional chain expressions
                const optionalChains = captures.filter(c => c.name === 'optional_chain');
                expect(optionalChains.length).to.equal(17);  // All ?. operators

                // Check nullish coalescing expressions
                const nullishCoalesce = captures.filter(c => c.name === 'nullish_coalesce');
                expect(nullishCoalesce.length).to.equal(7);  // All ?? operators

                // Add array access case
                const code2 = `
const item = array?.[0]?.name;
const element = list?.[index]?.value;`;
                const arrayCaptures = query(parser, code2);
                const arrayOptionalChains = arrayCaptures.filter(c => c.name === 'optional_chain');
                expect(arrayOptionalChains.length).to.equal(4);  // array?.[0], [0]?.name, list?.[index], [index]?.value

                // Verify specific pattern types exist
                const hasMethodChain = optionalChains.some(c =>
                    c.node.text?.includes('compute') ||
                    c.node.parent?.text?.includes('compute?.'));
                expect(hasMethodChain).to.equal(true, 'Should find optional chaining with compute method');

                // Verify multiple nullish coalescing
                const hasMultipleNullish = nullishCoalesce.some(c =>
                    c.node.text?.includes('??') &&
                    (c.node.parent?.text?.includes('backup') || c.node.text?.includes('backup')));
                expect(hasMultipleNullish).to.equal(true, 'Should find nullish coalescing with backup value');
            });
        });

        describe('Function Calls', () => {
            it('captures direct function calls', () => {
                const code = `calculate(1, 2);
console.log('Hello');`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                expect(captures.length).to.be.greaterThan(0);

                // Check for direct function call captures
                const callCaptures = captures.filter(c => c.name === 'function_call');
                expect(callCaptures.length).to.be.greaterThan(0);
            });

            it('captures method calls', () => {
                const code = `obj.method(arg1, arg2);
array.push(item);`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                expect(captures.length).to.be.greaterThan(0);

                // Check for method call captures
                const methodCaptures = captures.filter(c => c.name === 'method_call');
                expect(methodCaptures.length).to.be.greaterThan(0);
            });
        });

        describe('Error Handling', () => {
            it('captures try-catch blocks', () => {
                const code = `try {
    riskyOperation();
} catch (error) {
    console.error(error);
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check error handling structure
                const errorCapture = captures.find(c => c.name === 'error_handling');
                expect(errorCapture).to.be.ok;
                expect(errorCapture.node.type).to.equal('try_statement');

                // Check try block capture
                const tryCapture = captures.find(c => c.name === 'try_body');
                expect(tryCapture).to.be.ok;

                // Check catch parameter and body
                const errorParamCapture = captures.find(c => c.name === 'error_param');
                expect(errorParamCapture).to.be.ok;
                expect(errorParamCapture.node.text).to.equal('error');

                const catchBodyCapture = captures.find(c => c.name === 'catch_body');
                expect(catchBodyCapture).to.be.ok;
            });
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(expressionsOperatorsQuery);
    run(parser);
}

export default run;
