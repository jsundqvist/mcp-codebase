import { parseAndQuery } from './test-utils.js';

describe('JavaScript Objects', () => {
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
        expect(captures).toBeTruthy();
        
        // Check property captures
        const propCaptures = captures.filter(c => c.name === 'prop_name');
        expect(propCaptures.length).toBe(2); // name and value
        expect(propCaptures.map(c => c.node.text)).toEqual(['name', 'value']);
        
        // Check method capture
        const methodCapture = captures.find(c => c.name === 'method_name');
        expect(methodCapture).toBeTruthy();
        expect(methodCapture.node.text).toBe('method');
    });
});
