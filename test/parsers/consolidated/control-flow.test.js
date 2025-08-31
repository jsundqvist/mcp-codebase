import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    loopPattern,
    conditionalPattern,
    statementPattern,
    commentPattern
} from '../../../src/parsers/javascript.js';
import { query, individual } from '../test-utils.js';

// Combine patterns for this group
const controlFlowQuery = [
    loopPattern,
    conditionalPattern,
    statementPattern,
    commentPattern
].join('\n');

const run = function(parser) {
    describe('Control Flow', () => {
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

        describe('Conditionals', () => {
            it('captures if statements', () => {
                const code = `
if (condition) {
    doSomething();
} else if (otherCondition) {
    doOther();
} else {
    defaultAction();
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                const ifStatements = captures.filter(c => c.name === 'if_statement');
                expect(ifStatements.map(c => c.node.type)).to.deep.equal(['if_statement', 'if_statement']);
            });

            it('captures switch statements', () => {
                const code = `
switch (value) {
    case 1:
        action1();
        break;
    case 2:
        action2();
        break;
    default:
        defaultAction();
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                const switchStatements = captures.filter(c => c.name === 'switch_statement');
                expect(switchStatements.map(c => c.node.type)).to.deep.equal(['switch_statement']);
            });
        });

        describe('Statements', () => {
            it('captures return statements', () => {
                const code = `
function test() {
    if (true) {
        return 'value';
    }
    return null;
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                const returns = captures.filter(c => c.name === 'return');
                expect(returns.map(c => c.node.type)).to.deep.equal(['return_statement', 'return_statement']);
            });

            it('captures throw statements', () => {
                const code = `
function test() {
    if (error) {
        throw new Error('message');
    }
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                const throws = captures.filter(c => c.name === 'throw');
                expect(throws.map(c => c.node.type)).to.deep.equal(['throw_statement']);
            });

            it('captures break and continue statements', () => {
                const code = `
for (let i = 0; i < 10; i++) {
    if (i === 5) {
        break;
    }
    if (i % 2 === 0) {
        continue;
    }
    console.log(i);
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                const breaks = captures.filter(c => c.name === 'break');
                expect(breaks.map(c => c.node.type)).to.deep.equal(['break_statement']);

                const continues = captures.filter(c => c.name === 'continue');
                expect(continues.map(c => c.node.type)).to.deep.equal(['continue_statement']);
            });
        });

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
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(controlFlowQuery);
    run(parser);
}

export default run;
