import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    conditionalPattern,
    loopPattern,
    statementPattern
} from '../../../src/parsers/javascript.js';
import { query, individual } from '../test-utils.js';

// Combine patterns for this group
const controlFlowQuery = [
    conditionalPattern,
    loopPattern,
    statementPattern
].join('\n');

const run = function(parser) {
    describe('Control Flow (Combined)', () => {
        it('captures all control flow constructs', () => {
            const code = `if (x > 0) {
    for (let i = 0; i < 10; i++) {
        if (i === 5) {
            break;
        }
        console.log(i);
    }
    return true;
} else {
    throw new Error('Invalid');
}`;
            const captures = query(parser, code);
            expect(captures).to.be.ok;
            // Filter to only control flow captures - exclude overlapping patterns from other groups
            const controlFlowCaptures = captures.filter(c =>
                ['if_statement', 'switch_statement', 'for_loop', 'while_loop', 'do_while_loop', 'return', 'throw', 'break', 'continue'].includes(c.name)
            );
            expect(controlFlowCaptures.map(c => c.name)).to.deep.equal(['if_statement', 'for_loop', 'if_statement', 'break', 'return', 'throw']);

            // Check that we have the main control flow constructs
            const ifCapture = captures.find(c => c.name === 'if_statement');
            expect(ifCapture).to.be.ok;
            expect(ifCapture.node.type).to.equal('if_statement');

            const forCapture = captures.find(c => c.name === 'for_loop');
            expect(forCapture).to.be.ok;
            expect(forCapture.node.type).to.equal('for_statement');
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(controlFlowQuery);
    run(parser);
}

export default run;
