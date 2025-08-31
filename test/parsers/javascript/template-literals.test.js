import { parseAndQuery } from './test-utils.js';

export default function() {
    describe('Template Literals', () => {
        // const jsParser = createTestParser();

        it('captures template strings and expressions', () => {
            const code = `
const name = "world";
const greeting = \`Hello \${name}!\`;
const multiline = \`
line 1
\${value}
line 2
\`;`;
            const captures = parseAndQuery(code);
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
}
