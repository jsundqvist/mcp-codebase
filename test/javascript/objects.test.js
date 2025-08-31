import { parseAndQuery } from './test-utils.js';

describe('Objects', () => {
    // const jsParser = createTestParser();

    it('captures object properties and methods', () => {
        const code = `
const obj = {
    name: "test",
    value: 42,
    method() {
        return this.value;
    }
};`;
        const captures = parseAndQuery(code);
        expect(captures).to.be.ok;

        // Check property captures
        const propCaptures = captures.filter(c => c.name === 'prop_name');
        expect(propCaptures.length).to.equal(2); // name and value
        expect(propCaptures.map(c => c.node.text)).to.deep.equal(['name', 'value']);

        // Check method capture
        const methodCapture = captures.find(c => c.name === 'method_name');
        expect(methodCapture).to.be.ok;
        expect(methodCapture.node.text).to.equal('method');
    });
});
