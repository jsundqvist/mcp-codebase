import { parseAndQuery } from './test-utils.js';

describe('JavaScript', () => {
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
        expect(templates.length).to.equal(2);
        
        // Check template expressions
        const expressions = captures.filter(c => c.name === 'template_expr');
        expect(expressions.length).to.equal(2);
        
        // Check template variables
        const vars = captures.filter(c => c.name === 'template_var');
        expect(vars.length).to.equal(2);
        expect(vars.map(c => c.node.text)).to.deep.equal(['name', 'value']);
    });
  });
});
