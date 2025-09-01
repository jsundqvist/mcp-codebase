import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    operatorPattern,
    logicalAssignmentPattern,
    optionalPattern
} from '../../../src/parsers/javascript.js';
import { query, individual } from '../test-utils.js';

// Combine patterns for this group
const operatorsExpressionsQuery = [
    operatorPattern,
    logicalAssignmentPattern,
    optionalPattern
].join('\n');

const run = function(parser) {
    describe('Operators & Expressions', () => {
        describe('Basic Operators', () => {
            it('captures member access and binary expressions', () => {
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
                expect(memberAccess.map(c => c.node.type)).to.deep.equal(['member_expression']);  // obj.x

                // Check binary expressions
                const binaryOps = captures.filter(c => c.name === 'binary');
                expect(binaryOps.map(c => c.node.type)).to.deep.equal(['binary_expression', 'binary_expression']);  // + and * operations
            });
        });

        describe('Logical Assignments', () => {
            it('captures logical assignment operators', () => {
                const code = `
// Nullish coalescing assignment
let settings = {};
settings.value ??= 'default';

// Logical AND assignment
let config = {};
config.enabled &&= true;

// Logical OR assignment
let options = {};
options.theme ||= 'light';`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check logical assignment captures
                const logicalAssignments = captures.filter(c => c.name === 'logical_assignment');
                expect(logicalAssignments).to.have.lengthOf(3);
                expect(logicalAssignments.map(c => c.node.type)).to.deep.equal(['augmented_assignment_expression', 'augmented_assignment_expression', 'augmented_assignment_expression']);
            });
        });

        describe('Optional Chaining', () => {
            it('captures optional chaining and nullish coalescing', () => {
                const code = `
// Optional chaining
const value = obj?.prop?.method();

// Nullish coalescing
const result = value ?? 'default';`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check optional chaining
                const optionalChains = captures.filter(c => c.name === 'optional_chain');
                expect(optionalChains).to.have.lengthOf(2);

                // Check nullish coalescing
                const nullishOps = captures.filter(c => c.name === 'nullish_coalesce');
                expect(nullishOps).to.have.lengthOf(1);
                expect(nullishOps.map(c => c.node.type)).to.deep.equal(['binary_expression']);
            });
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(operatorsExpressionsQuery);
    run(parser);
}

export default run;
