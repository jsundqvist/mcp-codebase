import { parseAndQuery } from './test-utils.js';

describe('JavaScript', () => {
  describe('Classes', () => {

    it('captures class declarations', () => {
        const code = `class User {
    constructor(name) {
        this.name = name;
    }
}`;
        const captures = parseAndQuery(code);
        expect(captures).to.be.ok;
        expect(captures.length).to.be.greaterThan(0);
        
        // Check that we have both the class and name captures
        const classCapture = captures.find(c => c.name === 'class');
        expect(classCapture).to.be.ok;
        expect(classCapture.node.type).to.equal('class_declaration');
        
        const nameCapture = captures.find(c => c.name === 'class_name');
        expect(nameCapture).to.be.ok;
        expect(nameCapture.node.text).to.equal('User');
    });

    it('captures class method', () => {
        const code = `class Calculator {
add(a, b) {
    return a + b;
}
}`;
        const captures = parseAndQuery(code);
        expect(captures).to.be.ok;
        expect(captures.length).to.be.greaterThan(0);
        
        // Check for method capture
        const methodCapture = captures.find(c => c.name === 'method');
        expect(methodCapture).to.be.ok;
        expect(methodCapture.node.type).to.equal('method_definition');
        
        // Check for method name capture
        const nameCapture = captures.find(c => c.name === 'method_name');
        expect(nameCapture).to.be.ok;
        expect(nameCapture.node.text).to.equal('add');
    });
  });
});
