import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    templatePattern
} from '../../../src/parsers/javascript.js';
import { query, individual } from '../test-utils.js';

// Combine patterns for this group
const templateLiteralsQuery = [
    templatePattern
].join('\n');

const run = function(parser) {
    describe('Template Literals', () => {
        describe('Template Strings', () => {
            it('captures template strings and substitutions', () => {
                const code = `const greeting = \`Hello, \${name}!\`;
const message = \`User \${user.id} has \${count} items\`;`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only template captures - exclude overlapping patterns from other groups
                const templateCaptures = captures.filter(c =>
                    ['template', 'template_var', 'template_expr'].includes(c.name)
                );
                expect(templateCaptures.map(c => c.name)).to.deep.equal(['template', 'template_expr', 'template_var', 'template', 'template_expr', 'template_var']);

                // Check template string captures
                const templateStringCaptures = captures.filter(c => c.name === 'template');
                expect(templateStringCaptures.map(c => c.node.type)).to.deep.equal(['template_string', 'template_string']);
            });
        });

        describe('Template Variables', () => {
            it('captures variables inside template literals', () => {
                const code = `const result = \`The sum of \${a} and \${b} is \${a + b}\`;`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only template captures - exclude overlapping patterns from other groups
                const templateCaptures = captures.filter(c =>
                    ['template', 'template_var', 'template_expr'].includes(c.name)
                );
                expect(templateCaptures.map(c => c.name)).to.deep.equal(['template', 'template_expr', 'template_var', 'template_expr', 'template_var']);

                // Check template variable captures
                const templateVarCaptures = captures.filter(c => c.name === 'template_var');
                expect(templateVarCaptures.map(c => c.node.text)).to.deep.equal(['a', 'b']);
            });
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(templateLiteralsQuery);
    run(parser);
}

export default run;
