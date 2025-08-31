import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { asyncPattern } from '../../../src/parsers/javascript.js';
import { individual } from './test-utils.js';

function query(parser, code) {
    const tree = parser.parser.parse(code);
    return parser.query.captures(tree.rootNode);
}

const run = function(parser) {
    describe('Async/Await', () => {
        it('captures async functions and await expressions', () => {
            const code = `
async function fetchData() {
    const result = await fetch('/api');
    return result;
}`;
            const captures = query(parser, code);
            expect(captures).to.be.ok;

            // Check async function
            const asyncFuncs = captures.filter(c => c.name === 'async_function');
            expect(asyncFuncs.map(c => c.node.type)).to.deep.equal(['function_declaration']);

            const asyncNames = captures.filter(c => c.name === 'async_name');
            expect(asyncNames.map(c => c.node.text)).to.deep.equal(['fetchData']);

            // Check await expression
            const awaits = captures.filter(c => c.name === 'await_expr');
            expect(awaits.map(c => c.node.type)).to.deep.equal(['await_expression']);
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(asyncPattern);
    run(parser);
}

export default run;