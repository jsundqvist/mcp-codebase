import { parseAndQuery } from './test-utils.js';

describe('JavaScript', () => {
  describe('Async/Await', () => {
    // const jsParser = createTestParser();

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
        expect(asyncFuncs.length).to.equal(1);
        
        const asyncNames = captures.filter(c => c.name === 'async_name');
        expect(asyncNames.length).to.equal(1);
        expect(asyncNames[0].node.text).to.equal('fetchData');
        
        // Check await expression
        const awaits = captures.filter(c => c.name === 'await_expr');
        expect(awaits.length).to.equal(1);
    });
  });
});
