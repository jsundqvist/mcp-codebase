import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { variablePattern } from '../../../src/parsers/javascript.js';
import { individual, query } from '../test-utils.js';

const run = function(parser) {
    describe('Variables', () => {
        it('captures variable declarations', () => {
            const code = `const name = 'John';
let age = 30;
var city = 'New York';`;
            const captures = query(parser, code);
            expect(captures).to.be.ok;
            expect(captures.length).to.be.greaterThan(0);

            // Check for variable captures
            const variableCaptures = captures.filter(c => c.name === 'variable');
            expect(variableCaptures.length).to.be.greaterThan(0);

            // Check for name captures
            const nameCaptures = captures.filter(c => c.name === 'var_name');
            expect(nameCaptures.length).to.be.greaterThan(0);
            expect(nameCaptures.map(c => c.node.text)).to.include.members(['name', 'age', 'city']);
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(variablePattern);
    run(parser);
}

export default run;
