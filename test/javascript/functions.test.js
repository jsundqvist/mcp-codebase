import { parseAndQuery } from './test-utils.js';

describe('JavaScript Functions', () => {


    it('captures arrow functions', () => {
        const code = ` 
const simple = () => {};
const withParam = (x) => x * 2;
const withBlock = (value) => {
    return value * 2;
};`;
        const captures = parseAndQuery(code);
        expect(captures).toBeTruthy();
        
        // Check arrow function captures
        const arrowCaptures = captures.filter(c => c.name === 'arrow_function');
        expect(arrowCaptures.length).toBe(3);
        
        // Check parameter captures
        const paramCaptures = captures.filter(c => c.name === 'param_name');
        expect(paramCaptures.length).toBe(2);
        expect(paramCaptures.map(c => c.node.text)).toEqual(['x', 'value']);
    });

    it('captures function declaration', () => {
        const code = `function add(a, b) {
return a + b;
}`;
    const captures = parseAndQuery(code);
        expect(captures).toBeTruthy();
        expect(captures.length).toBeGreaterThan(0);
        
        // Check that we have both the function and name captures
        const functionCapture = captures.find(c => c.name === 'function');
        expect(functionCapture).toBeTruthy();
        expect(functionCapture.node.type).toBe('function_declaration');
        
        const nameCapture = captures.find(c => c.name === 'name');
        expect(nameCapture).toBeTruthy();
        expect(nameCapture.node.text).toBe('add');
    });
});
