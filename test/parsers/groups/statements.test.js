import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    statementPattern
} from '../../../src/parsers/javascript.js';
import { query, individual } from '../test-utils.js';

// Combine patterns for this group
const statementsQuery = [
    statementPattern
].join('\n');

const run = function(parser) {
    describe('Statements', () => {
        describe('Return Statements', () => {
            it('captures return statements', () => {
                const code = `function add(a, b) {
    return a + b;
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only statement captures - exclude overlapping patterns from other groups
                const statementCaptures = captures.filter(c =>
                    ['return', 'throw', 'break', 'continue'].includes(c.name)
                );
                expect(statementCaptures.map(c => c.name)).to.deep.equal(['return']);

                // Check return statement capture
                const returnCapture = captures.find(c => c.name === 'return');
                expect(returnCapture).to.be.ok;
                expect(returnCapture.node.type).to.equal('return_statement');
            });
        });

        describe('Throw Statements', () => {
            it('captures throw statements', () => {
                const code = `function divide(a, b) {
    if (b === 0) {
        throw new Error('Division by zero');
    }
    return a / b;
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only statement captures - exclude overlapping patterns from other groups
                const statementCaptures = captures.filter(c =>
                    ['return', 'throw', 'break', 'continue'].includes(c.name)
                );
                expect(statementCaptures.map(c => c.name)).to.deep.equal(['throw', 'return']);

                // Check throw statement capture
                const throwCapture = captures.find(c => c.name === 'throw');
                expect(throwCapture).to.be.ok;
                expect(throwCapture.node.type).to.equal('throw_statement');
            });
        });

        describe('Break and Continue', () => {
            it('captures break and continue statements', () => {
                const code = `for (let i = 0; i < 10; i++) {
    if (i === 5) {
        break;
    }
    if (i % 2 === 0) {
        continue;
    }
    console.log(i);
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only statement captures - exclude overlapping patterns from other groups
                const statementCaptures = captures.filter(c =>
                    ['return', 'throw', 'break', 'continue'].includes(c.name)
                );
                expect(statementCaptures.map(c => c.name)).to.deep.equal(['break', 'continue']);

                // Check break and continue captures
                const breakCapture = captures.find(c => c.name === 'break');
                expect(breakCapture).to.be.ok;
                expect(breakCapture.node.type).to.equal('break_statement');

                const continueCapture = captures.find(c => c.name === 'continue');
                expect(continueCapture).to.be.ok;
                expect(continueCapture.node.type).to.equal('continue_statement');
            });
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(statementsQuery);
    run(parser);
}

export default run;
