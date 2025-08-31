import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { templatePattern } from '../../../src/parsers/javascript.js';
import { individual } from './test-utils.js';

function query(parser, code) {
    const tree = parser.parser.parse(code);
    return parser.query.captures(tree.rootNode);
}

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

            // Check template strings
            const templates = captures.filter(c => c.name === 'template');
            expect(templates.map(c => c.node.text)).to.deep.equal(['`Hello ${name}!`', '`\nline 1\n${value}\nline 2\n`']);

            // Check template expressions
            const expressions = captures.filter(c => c.name === 'template_expr');
            expect(expressions.map(c => c.node.text)).to.deep.equal(['${name}', '${value}']);

            // Check template variables
            const vars = captures.filter(c => c.name === 'template_var');
            expect(vars.length).to.equal(2);
            expect(vars.map(c => c.node.text)).to.deep.equal(['name', 'value']);
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(templatePattern);
    run(parser);
}

export default run;
