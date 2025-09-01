import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    spreadPattern,
    asyncPattern,
    commentPattern
} from '../../../src/parsers/javascript.js';
import { query, individual } from '../test-utils.js';

// Combine patterns for this group
const miscellaneousQuery = [
    spreadPattern,
    asyncPattern,
    commentPattern
].join('\n');

const run = function(parser) {
    describe('Miscellaneous', () => {
        describe('Spread/Rest Operators', () => {
            it('captures rest parameters and spread elements', () => {
                const code = `function sum(...numbers) {
    return numbers.reduce((a, b) => a + b);
}

const arr = [1, 2, 3];
const newArr = [...arr, 4, 5];`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check rest parameter captures
                const restParams = captures.filter(c => c.name === 'rest');
                expect(restParams).to.have.lengthOf(1);
                expect(restParams.map(c => c.node.type)).to.deep.equal(['rest_pattern']);

                // Check spread element captures
                const spreadElements = captures.filter(c => c.name === 'spread');
                expect(spreadElements).to.have.lengthOf(1);
                expect(spreadElements.map(c => c.node.type)).to.deep.equal(['spread_element']);
            });
        });

        describe('Async/Await', () => {
            it('captures async functions and await expressions', () => {
                const code = `async function fetchData() {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check async function captures
                const asyncFunctions = captures.filter(c => c.name === 'async_function');
                expect(asyncFunctions).to.have.lengthOf(1);
                expect(asyncFunctions.map(c => c.node.type)).to.deep.equal(['function_declaration']);

                // Check await expression captures
                const awaitExpressions = captures.filter(c => c.name === 'await_expr');
                expect(awaitExpressions).to.have.lengthOf(2);
                expect(awaitExpressions.map(c => c.node.type)).to.deep.equal(['await_expression', 'await_expression']);
            });
        });

        describe('Comments', () => {
            it('captures comments', () => {
                const code = `// This is a single line comment
/*
 * This is a multi-line comment
 */
const x = 1; // End of line comment`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check comment captures
                const comments = captures.filter(c => c.name === 'comment');
                expect(comments).to.have.lengthOf(3);  // 3 comments in the code
                expect(comments.map(c => c.node.type)).to.deep.equal(['comment', 'comment', 'comment']);
            });
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(miscellaneousQuery);
    run(parser);
}

export default run;
