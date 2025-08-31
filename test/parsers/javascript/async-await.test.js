import { parseAndQuery } from './test-utils.js';

export default function() {
    describe('Async/Await', () => {
        it('captures async functions and await expressions', () => {
            const code = `
async function fetchData() {
    const result = await fetch('/api');
    return result;
}`;
            const captures = parseAndQuery(code);
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
}