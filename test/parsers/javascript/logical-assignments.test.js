import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { logicalAssignmentPattern } from '../../../src/parsers/javascript.js';
import { individual } from './test-utils.js';

function query(parser, code) {
    const tree = parser.parser.parse(code);
    return parser.query.captures(tree.rootNode);
}

const run = function(parser) {
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
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(logicalAssignmentPattern);
    run(parser);
}

export default run;
