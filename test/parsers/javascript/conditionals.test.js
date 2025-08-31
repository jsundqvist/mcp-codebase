import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { conditionalPattern } from '../../../src/parsers/javascript.js';
import { individual } from './test-utils.js';

function query(parser, code) {
    const tree = parser.parser.parse(code);
    return parser.query.captures(tree.rootNode);
}

const run = function(parser) {
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
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(conditionalPattern);
    run(parser);
}

export default run;
