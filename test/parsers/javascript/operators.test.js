import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { operatorPattern } from '../../../src/parsers/javascript.js';
import { individual } from './test-utils.js';

function query(parser, code) {
    const tree = parser.parser.parse(code);
    return parser.query.captures(tree.rootNode);
}

const run = function(parser) {
    describe('Operators', () => {
        it('captures basic member access and binary expressions', () => {
            const code = `
const obj = {
    x: 1,
    y: 2
};
const value = obj.x;
const sum = a + b;
const product = x * y;`;
            const captures = query(parser, code);
            expect(captures).to.be.ok;

            // Check member expressions
            const memberAccess = captures.filter(c => c.name === 'member');
            expect(memberAccess.length).to.equal(1);  // obj.x

            // Check binary expressions
            const binaryOps = captures.filter(c => c.name === 'binary');
            expect(binaryOps.length).to.equal(2);  // + and * operations
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(operatorPattern);
    run(parser);
}

export default run;
