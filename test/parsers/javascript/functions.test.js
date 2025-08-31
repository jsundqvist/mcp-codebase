import { parseAndQuery } from './test-utils.js';

export default function() {
    describe('Functions', () => {
        it('captures arrow functions', () => {
            const code = `
const simple = () => {};
const withParam = (x) => x * 2;
const withBlock = (value) => {
    return value * 2;
};`;
            const captures = parseAndQuery(code);
            expect(captures).to.be.ok;

            // Check arrow function captures
            const arrowCaptures = captures.filter(c => c.name === 'arrow_function');
            expect(arrowCaptures.map(c => c.node.text)).to.deep.equal(['() => {}', '(x) => x * 2', '(value) => {\n    return value * 2;\n}']);

            // Check parameter captures
            const paramCaptures = captures.filter(c => c.name === 'param_name');
            expect(paramCaptures.length).to.equal(2);
            expect(paramCaptures.map(c => c.node.text)).to.deep.equal(['x', 'value']);
        });

        it('captures function declaration', () => {
            const code = `function add(a, b) {
  return a + b;
}`;
            const captures = parseAndQuery(code);
            expect(captures).to.be.ok;
            expect(captures.length).to.be.greaterThan(0);

            // Check that we have both the function and name captures
            const functionCapture = captures.find(c => c.name === 'function');
            expect(functionCapture).to.be.ok;
            expect(functionCapture.node.type).to.equal('function_declaration');

            const nameCapture = captures.find(c => c.name === 'name');
            expect(nameCapture).to.be.ok;
            expect(nameCapture.node.text).to.equal('add');
        });
    });
}
