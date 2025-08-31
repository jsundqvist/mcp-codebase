import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { variablePattern } from '../../../src/parsers/javascript.js';
import { individual } from './test-utils.js';

function query(parser, code) {
    const tree = parser.parser.parse(code);
    return parser.query.captures(tree.rootNode);
}

const run = function(parser) {
    describe('Variables', () => {
        it('captures variable declarations', () => {
            const code = `const answer = 42;
let count = 0;
var legacy = true;`;
            const captures = query(parser, code);
            expect(captures).to.be.ok;
            expect(captures.length).to.be.greaterThan(0);

            // Should find all three variable declarations
            const varCaptures = captures.filter(c => c.name === 'variable');
            expect(varCaptures.length).to.equal(3);

            // Check the variable names
            const nameCaptures = captures.filter(c => c.name === 'var_name');
            expect(nameCaptures.length).to.equal(3);
            expect(nameCaptures.map(c => c.node.text)).to.deep.equal(['answer', 'count', 'legacy']);
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(variablePattern);
    run(parser);
}

export default run;
