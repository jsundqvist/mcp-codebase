import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { arrowFunctionPattern } from '../../../src/parsers/javascript.js';
import { individual } from './test-utils.js';

function query(parser, code) {
    const tree = parser.parser.parse(code);
    return parser.query.captures(tree.rootNode);
}

const run = function(parser) {
    describe('Arrow Functions', () => {
        it('captures arrow functions', () => {
            const code = `
const simple = () => {};
const withParam = (x) => x * 2;
const withBlock = (value) => {
    return value * 2;
};`;
            const captures = query(parser, code);
            expect(captures).to.be.ok;

            // Check arrow function captures
            const arrowCaptures = captures.filter(c => c.name === 'arrow_function');
            expect(arrowCaptures.map(c => c.node.text)).to.deep.equal(['() => {}', '(x) => x * 2', '(value) => {\n    return value * 2;\n}']);

            // Check parameter captures
            const paramCaptures = captures.filter(c => c.name === 'param_name');
            expect(paramCaptures.length).to.equal(2);
            expect(paramCaptures.map(c => c.node.text)).to.deep.equal(['x', 'value']);
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(arrowFunctionPattern);
    run(parser);
}

export default run;
