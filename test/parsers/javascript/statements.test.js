import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { statementPattern } from '../../../src/parsers/javascript-query.js';
import { individual } from './test-utils.js';

const parser = createJavaScriptParser(statementPattern);

function parseAndQuery(code) {
    const tree = parser.parser.parse(code);
    return parser.query.captures(tree.rootNode);
}

const run = function() {
    describe('Statements', () => {
        it('captures return statements', () => {
            const code = `
function test() {
    if (true) {
        return 'value';
    }
    return null;
}`;
            const captures = parseAndQuery(code);
            expect(captures).to.be.ok;

            const returns = captures.filter(c => c.name === 'return');
            expect(returns.map(c => c.node.type)).to.deep.equal(['return_statement', 'return_statement']);
        });

        it('captures throw statements', () => {
            const code = `
function test() {
    if (error) {
        throw new Error('message');
    }
}`;
            const captures = parseAndQuery(code);
            expect(captures).to.be.ok;

            const throws = captures.filter(c => c.name === 'throw');
            expect(throws.map(c => c.node.type)).to.deep.equal(['throw_statement']);
        });

        it('captures break and continue statements', () => {
            const code = `
for (let i = 0; i < 10; i++) {
    if (i === 5) {
        break;
    }
    if (i % 2 === 0) {
        continue;
    }
    console.log(i);
}`;
            const captures = parseAndQuery(code);
            expect(captures).to.be.ok;

            const breaks = captures.filter(c => c.name === 'break');
            expect(breaks.map(c => c.node.type)).to.deep.equal(['break_statement']);

            const continues = captures.filter(c => c.name === 'continue');
            expect(continues.map(c => c.node.type)).to.deep.equal(['continue_statement']);
        });
    });
};

if (individual(import.meta.url)) {
    run();
}

export default run;
