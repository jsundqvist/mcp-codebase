import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { optionalPattern } from '../../../src/parsers/javascript.js';
import { individual, query } from '../test-utils.js';

const run = function(parser) {
    describe('Optional Chaining', () => {
        it('captures optional chaining and nullish coalescing expressions', () => {
            const code = `
// Basic optional chaining
const name = user?.profile?.name;
const items = response?.data?.items;

// Nullish coalescing
const value = data?.value ?? defaultValue;
const config = settings?.timeout ?? 5000;

// Complex nested optional chaining
const nested = obj?.foo?.bar?.baz?.qux;
const method = instance?.compute?.()?.result;

// Multiple nullish coalescing
const fallback = value ?? backup ?? default ?? null;

// Combined optional chaining and nullish coalescing
const complex = user?.settings?.theme?.color ?? defaultTheme?.color ?? '#000000';`;
            const captures = query(parser, code);
            expect(captures).to.be.ok;

            // Check optional chain expressions
            const optionalChains = captures.filter(c => c.name === 'optional_chain');
            expect(optionalChains.length).to.equal(17);  // All ?. operators

            // Check nullish coalescing expressions
            const nullishCoalesce = captures.filter(c => c.name === 'nullish_coalesce');
            expect(nullishCoalesce.length).to.equal(7);  // All ?? operators

            // Add array access case
            const code2 = `
const item = array?.[0]?.name;
const element = list?.[index]?.value;`;
            const arrayCaptures = query(parser, code2);
            const arrayOptionalChains = arrayCaptures.filter(c => c.name === 'optional_chain');
            expect(arrayOptionalChains.length).to.equal(4);  // array?.[0], [0]?.name, list?.[index], [index]?.value

            // Verify specific pattern types exist
            const hasMethodChain = optionalChains.some(c =>
                c.node.text?.includes('compute') ||
                c.node.parent?.text?.includes('compute?.'));
            expect(hasMethodChain).to.equal(true, 'Should find optional chaining with compute method');

            // Verify multiple nullish coalescing
            const hasMultipleNullish = nullishCoalesce.some(c =>
                c.node.text?.includes('??') &&
                (c.node.parent?.text?.includes('backup') || c.node.text?.includes('backup')));
            expect(hasMultipleNullish).to.equal(true, 'Should find nullish coalescing with backup value');
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(optionalPattern);
    run(parser);
}

export default run;
