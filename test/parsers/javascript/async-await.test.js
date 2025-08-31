import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { asyncPattern } from '../../../src/parsers/javascript.js';
import { individual, query } from '../test-utils.js';

const run = function(parser) {
    describe('Async/Await', () => {
        it('captures async functions and await expressions', () => {
            const code = `async function fetchData() {
  const response = await fetch('/api/data');
  const data = await response.json();
  return data;
}`;
            const captures = query(parser, code);
            expect(captures).to.be.ok;
            expect(captures.length).to.be.greaterThan(0);

            // Check for async function captures
            const asyncCaptures = captures.filter(c => c.name === 'async_function');
            expect(asyncCaptures.length).to.be.greaterThan(0);

            // Check for await captures
            const awaitCaptures = captures.filter(c => c.name === 'await_expr');
            expect(awaitCaptures.length).to.be.greaterThan(0);
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(asyncPattern);
    run(parser);
}

export default run;