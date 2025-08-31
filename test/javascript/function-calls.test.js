import { parseAndQuery } from './test-utils.js';

describe('Function Calls', () => {
    // const jsParser = createTestParser();

    it('captures direct function calls', () => {
        const code = `calculate();
doSomething(arg1, arg2);`;
        const captures = parseAndQuery(code);
        expect(captures).to.be.ok;

        // Check function call captures
        const callCaptures = captures.filter(c => c.name === 'function_call');
        expect(callCaptures.length).to.equal(2);

        // Check function names
        const nameCaptures = captures.filter(c => c.name === 'function_name');
        expect(nameCaptures.length).to.equal(2);
        expect(nameCaptures.map(c => c.node.text)).to.deep.equal(['calculate', 'doSomething']);
    });

    it('captures method calls', () => {
        const code = `console.log("test");
object.method(arg);`;
        const captures = parseAndQuery(code);
        expect(captures).to.be.ok;

        // Check method call captures
        const callCaptures = captures.filter(c => c.name === 'method_call');
        expect(callCaptures.length).to.equal(2);

        // Check object and property names
        const objectCaptures = captures.filter(c => c.name === 'object');
        expect(objectCaptures.length).to.equal(2);
        expect(objectCaptures.map(c => c.node.text)).to.deep.equal(['console', 'object']);

        const propertyCaptures = captures.filter(c => c.name === 'property');
        expect(propertyCaptures.length).to.equal(2);
        expect(propertyCaptures.map(c => c.node.text)).to.deep.equal(['log', 'method']);
    });
});
