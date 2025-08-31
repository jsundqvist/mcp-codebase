import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { destructurePattern } from '../../../src/parsers/javascript.js';
import { individual, query } from '../test-utils.js';

const run = function(parser) {
    describe('Destructuring', () => {
        it('captures object and array destructuring', () => {
            const code = `
const { x, y } = point;
const [first, second] = array;`;
            const captures = query(parser, code);
            expect(captures).to.be.ok;

            // Check object and array destructuring patterns exist
            const objDestructures = captures.filter(c => c.name === 'obj_destruct');
            expect(objDestructures.map(c => c.node.type)).to.deep.equal(['object_pattern']);

            const arrayDestructures = captures.filter(c => c.name === 'array_destruct');
            expect(arrayDestructures.map(c => c.node.type)).to.deep.equal(['array_pattern']);
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(destructurePattern);
    run(parser);
}

export default run;
