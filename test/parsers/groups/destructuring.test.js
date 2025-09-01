import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    destructurePattern
} from '../../../src/parsers/javascript.js';
import { query, individual } from '../test-utils.js';

// Combine patterns for this group
const destructuringQuery = [
    destructurePattern
].join('\n');

const run = function(parser) {
    describe('Destructuring', () => {
        describe('Object Destructuring', () => {
            it('captures object destructuring patterns', () => {
                const code = `const { name, age } = person;
const { data: userData, error } = response;`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only destructuring captures - exclude overlapping patterns from other groups
                const destructuringCaptures = captures.filter(c =>
                    ['obj_destruct', 'array_destruct'].includes(c.name)
                );
                expect(destructuringCaptures.map(c => c.name)).to.deep.equal(['obj_destruct', 'obj_destruct']);

                // Check object destructuring captures
                const objDestructCaptures = captures.filter(c => c.name === 'obj_destruct');
                expect(objDestructCaptures.map(c => c.node.type)).to.deep.equal(['object_pattern', 'object_pattern']);
            });
        });

        describe('Array Destructuring', () => {
            it('captures array destructuring patterns', () => {
                const code = `const [first, second] = array;
const [head, ...rest] = list;`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only destructuring captures - exclude overlapping patterns from other groups
                const destructuringCaptures = captures.filter(c =>
                    ['obj_destruct', 'array_destruct'].includes(c.name)
                );
                expect(destructuringCaptures.map(c => c.name)).to.deep.equal(['array_destruct', 'array_destruct']);

                // Check array destructuring captures
                const arrayDestructCaptures = captures.filter(c => c.name === 'array_destruct');
                expect(arrayDestructCaptures.map(c => c.node.type)).to.deep.equal(['array_pattern', 'array_pattern']);
            });
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(destructuringQuery);
    run(parser);
}

export default run;
