import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { templatePattern } from '../../../src/parsers/javascript.js';
import { individual, query } from '../test-utils.js';

const run = function(parser) {
    describe('Template Literals', () => {
        it('captures template strings and expressions', () => {
            const code = `
const name = "world";
const greeting = \`Hello \${name}!\`;
const multiline = \`
line 1
\${value}
line 2
\`;`;
            const captures = query(parser, code);
            expect(captures).to.be.ok;

            const templates = captures.filter(c => c.name === 'template_literal');
            expect(templates.map(c => c.node.text)).to.deep.equal(["`Hello ${name}!`", "`\nline 1\n${value}\nline 2\n`"]);
        });
    });
};
export default run;

