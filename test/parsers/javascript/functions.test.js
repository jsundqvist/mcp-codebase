import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { functionPattern } from '../../../src/parsers/javascript.js';
import { individual, query } from '../test-utils.js';

const run = function(parser) {
    describe('Functions', () => {
        it('captures function declaration', () => {
            const code = `function add(a, b) {
  return a + b;
}`;
            const captures = query(parser, code);
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
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(functionPattern);
    run(parser);
}

export default run;
