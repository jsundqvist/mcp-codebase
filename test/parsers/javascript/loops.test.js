import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { loopPattern } from '../../../src/parsers/javascript.js';
import { individual, query } from './test-utils.js';

const run = function(parser) {
    describe('Loops', () => {
        it('captures for loops', () => {
            const code = `
for (let i = 0; i < 10; i++) {
    console.log(i);
}`;
            const captures = query(parser, code);
            expect(captures).to.be.ok;

            const forLoops = captures.filter(c => c.name === 'for_loop');
            expect(forLoops.map(c => c.node.type)).to.deep.equal(['for_statement']);
        });

        it('captures for-in and for-of loops', () => {
            const code = `
for (let key in obj) {
    console.log(key);
}
for (let value of arr) {
    console.log(value);
}`;
            const captures = query(parser, code);
            expect(captures).to.be.ok;

            const loops = captures.filter(c => c.name === 'for_loop');
            expect(loops.map(c => c.node.type)).to.deep.equal(['for_in_statement', 'for_in_statement']);
        });

        it('captures while and do-while loops', () => {
            const code = `
while (condition) {
    doSomething();
}
do {
    doSomething();
} while (condition);`;
            const captures = query(parser, code);
            expect(captures).to.be.ok;

            const whileLoops = captures.filter(c => c.name === 'while_loop');
            expect(whileLoops.map(c => c.node.type)).to.deep.equal(['while_statement']);

            const doWhileLoops = captures.filter(c => c.name === 'do_while_loop');
            expect(doWhileLoops.map(c => c.node.type)).to.deep.equal(['do_statement']);
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(loopPattern);
    run(parser);
}

export default run;
