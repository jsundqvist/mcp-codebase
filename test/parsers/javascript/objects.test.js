import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { objectPattern } from '../../../src/parsers/javascript.js';
import { individual, query } from './test-utils.js';

const run = function(parser) {
    describe('Objects', () => {
        it('captures object properties and methods', () => {
            const code = `
const obj = {
    name: "test",
    value: 42,
    method() {
        return this.value;
    }
};`;
            const captures = query(parser, code);
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
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(objectPattern);
    run(parser);
}

export default run;
