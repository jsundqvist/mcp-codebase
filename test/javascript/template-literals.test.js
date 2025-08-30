import { parseAndQuery } from './test-utils.js';

describe('JavaScript Template Literals', () => {
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
        expect(captures).toBeTruthy();
        
        // Check template strings
        const templates = captures.filter(c => c.name === 'template');
        expect(templates.length).toBe(2);
        
        // Check template expressions
        const expressions = captures.filter(c => c.name === 'template_expr');
        expect(expressions.length).toBe(2);
        
        // Check template variables
        const vars = captures.filter(c => c.name === 'template_var');
        expect(vars.length).toBe(2);
        expect(vars.map(c => c.node.text)).toEqual(['name', 'value']);
    });
});
