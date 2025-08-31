import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { commentPattern } from '../../../src/parsers/javascript.js';
import { individual, query } from '../test-utils.js';

const run = function(parser) {
    describe('Comments', () => {
        it('captures single-line comments', () => {
            const code = `
// This is a single-line comment
const x = 1;`;
            const captures = query(parser, code);
            expect(captures).to.be.ok;

            const comments = captures.filter(c => c.name === 'comment');
            expect(comments.map(c => c.node.type)).to.deep.equal(['comment']);
            expect(comments.map(c => c.node.text)).to.deep.equal(['// This is a single-line comment']);
        });

        it('captures multi-line comments', () => {
            const code = `
/*
 * This is a multi-line comment
 * with multiple lines
 */
const y = 2;`;
            const captures = query(parser, code);
            expect(captures).to.be.ok;

            const comments = captures.filter(c => c.name === 'comment');
            expect(comments.map(c => c.node.type)).to.deep.equal(['comment']);
            expect(comments.map(c => c.node.text)).to.deep.equal(['/*\n * This is a multi-line comment\n * with multiple lines\n */']);
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(commentPattern);
    run(parser);
}

export default run;
