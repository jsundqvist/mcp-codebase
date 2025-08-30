import { parseAndQuery } from './test-utils.js';

describe('JavaScript Classes', () => {

    it('captures class declarations', () => {
        const code = `class User {
    constructor(name) {
        this.name = name;
    }
}`;
        const captures = parseAndQuery(code);
        expect(captures).toBeTruthy();
        expect(captures.length).toBeGreaterThan(0);
        
        // Check that we have both the class and name captures
        const classCapture = captures.find(c => c.name === 'class');
        expect(classCapture).toBeTruthy();
        expect(classCapture.node.type).toBe('class_declaration');
        
        const nameCapture = captures.find(c => c.name === 'class_name');
        expect(nameCapture).toBeTruthy();
        expect(nameCapture.node.text).toBe('User');
    });

    it('captures class method', () => {
        const code = `class Calculator {
add(a, b) {
    return a + b;
}
}`;
        const captures = parseAndQuery(code);
        expect(captures).toBeTruthy();
        expect(captures.length).toBeGreaterThan(0);
        
        // Check for method capture
        const methodCapture = captures.find(c => c.name === 'method');
        expect(methodCapture).toBeTruthy();
        expect(methodCapture.node.type).toBe('method_definition');
        
        // Check for method name capture
        const nameCapture = captures.find(c => c.name === 'method_name');
        expect(nameCapture).toBeTruthy();
        expect(nameCapture.node.text).toBe('add');
    });
});
