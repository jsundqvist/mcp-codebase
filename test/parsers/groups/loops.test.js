import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    loopPattern
} from '../../../src/parsers/javascript.js';
import { query, individual } from '../test-utils.js';

// Combine patterns for this group
const loopsQuery = [
    loopPattern
].join('\n');

const run = function(parser) {
    describe('Loops', () => {
        describe('For Loops', () => {
            it('captures for loops', () => {
                const code = `for (let i = 0; i < 10; i++) {
    console.log(i);
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only loop captures - exclude overlapping patterns from other groups
                const loopCaptures = captures.filter(c =>
                    ['for_loop', 'while_loop', 'do_while_loop'].includes(c.name)
                );
                expect(loopCaptures.map(c => c.name)).to.deep.equal(['for_loop']);

                // Check for loop capture
                const forCapture = captures.find(c => c.name === 'for_loop');
                expect(forCapture).to.be.ok;
                expect(forCapture.node.type).to.equal('for_statement');
            });
        });

        describe('While Loops', () => {
            it('captures while loops', () => {
                const code = `let i = 0;
while (i < 10) {
    console.log(i);
    i++;
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only loop captures - exclude overlapping patterns from other groups
                const loopCaptures = captures.filter(c =>
                    ['for_loop', 'while_loop', 'do_while_loop'].includes(c.name)
                );
                expect(loopCaptures.map(c => c.name)).to.deep.equal(['while_loop']);

                // Check while loop capture
                const whileCapture = captures.find(c => c.name === 'while_loop');
                expect(whileCapture).to.be.ok;
                expect(whileCapture.node.type).to.equal('while_statement');
            });
        });

        describe('Do-While Loops', () => {
            it('captures do-while loops', () => {
                const code = `let i = 0;
do {
    console.log(i);
    i++;
} while (i < 10);`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only loop captures - exclude overlapping patterns from other groups
                const loopCaptures = captures.filter(c =>
                    ['for_loop', 'while_loop', 'do_while_loop'].includes(c.name)
                );
                expect(loopCaptures.map(c => c.name)).to.deep.equal(['do_while_loop']);

                // Check do-while loop capture
                const doWhileCapture = captures.find(c => c.name === 'do_while_loop');
                expect(doWhileCapture).to.be.ok;
                expect(doWhileCapture.node.type).to.equal('do_statement');
            });
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(loopsQuery);
    run(parser);
}

export default run;
