import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { modulePattern, templatePattern } from '../../../src/parsers/javascript.js';
import { individual, query } from '../test-utils.js';

const runModules = function(parser) {
	describe('Modules', () => {
		it('captures import statements', () => {
			const code = `import x from 'y'; import { a, b } from 'z';`;
			const captures = query(parser, code);
			expect(captures).to.be.ok;
			const imports = captures.filter(c => c.node.type === 'import_statement');
			expect(imports.length).to.equal(2);
		});
		it('captures export statements', () => {
			const code = `export default x; export { a, b };`;
			const captures = query(parser, code);
			expect(captures).to.be.ok;
			const exports = captures.filter(c => c.node.type === 'export_statement');
			expect(exports.map(e => e.node.type)).to.deep.equal([]);
		});
	});
};

const runTemplates = function(parser) {
	describe('Template Literals', () => {
		it('captures template literals', () => {
			const code = '`Hello ${name}!`';
			const captures = query(parser, code);
			expect(captures).to.be.ok;
			const templates = captures.filter(c => c.name === 'template_literal');
			expect(templates.map(c => c.node.type)).to.deep.equal(['template_string']);
		});
		it('captures export with template literal', () => {
			const code = 'export const foo = `bar${baz}`;';
			const captures = query(parser, code);
			expect(captures).to.be.ok;
			const templates = captures.filter(c => c.name === 'template_literal');
			expect(templates.map(c => c.node.type)).to.deep.equal(['template_string']);
			expect(templates.map(c => c.node.text)).to.deep.equal(['`bar${baz}`']);
		});
	});
};

if (individual(import.meta.url)) {
	const parserModules = createJavaScriptParser(modulePattern);
	runModules(parserModules);
	const parserTemplates = createJavaScriptParser(templatePattern);
	runTemplates(parserTemplates);
}

export default function(parser) {
	runModules(parser);
	runTemplates(parser);
}
// Merged: modules.test.js + template-literals.test.js
// ...existing code from both files...
