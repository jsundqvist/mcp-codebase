import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    conditionalPattern
} from '../../../src/parsers/javascript.js';
import { query, individual } from '../test-utils.js';

// Combine patterns for this group
const conditionalsQuery = [
    conditionalPattern
].join('\n');

const run = function(parser) {
    describe('Conditionals', () => {
        describe('If Statements', () => {
            it('captures if statements', () => {
                const code = `if (x > 0) {
    console.log('positive');
} else {
    console.log('non-positive');
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only conditional captures - exclude overlapping patterns from other groups
                const conditionalCaptures = captures.filter(c =>
                    ['if_statement', 'switch_statement'].includes(c.name)
                );
                expect(conditionalCaptures.map(c => c.name)).to.deep.equal(['if_statement']);

                // Check if statement capture
                const ifCapture = captures.find(c => c.name === 'if_statement');
                expect(ifCapture).to.be.ok;
                expect(ifCapture.node.type).to.equal('if_statement');
            });
        });

        describe('Switch Statements', () => {
            it('captures switch statements', () => {
                const code = `switch (day) {
    case 1:
        console.log('Monday');
        break;
    case 2:
        console.log('Tuesday');
        break;
    default:
        console.log('Other day');
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only conditional captures - exclude overlapping patterns from other groups
                const conditionalCaptures = captures.filter(c =>
                    ['if_statement', 'switch_statement'].includes(c.name)
                );
                expect(conditionalCaptures.map(c => c.name)).to.deep.equal(['switch_statement']);

                // Check switch statement capture
                const switchCapture = captures.find(c => c.name === 'switch_statement');
                expect(switchCapture).to.be.ok;
                expect(switchCapture.node.type).to.equal('switch_statement');
            });
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(conditionalsQuery);
    run(parser);
}

export default run;
