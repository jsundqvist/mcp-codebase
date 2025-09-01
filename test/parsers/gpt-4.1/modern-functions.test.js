import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { arrowFunctionPattern, asyncPattern } from '../../../src/parsers/javascript.js';
import { individual, query } from '../test-utils.js';

const runArrow = function(parser) {
	describe('Arrow Functions', () => {
		it('captures arrow functions', () => {
			const code = `
const simple = () => {};
const withParam = (x) => x * 2;
const withBlock = (value) => {
	return value * 2;
};`;
			const captures = query(parser, code);
			expect(captures).to.be.ok;

			// Check arrow function captures
			const arrowCaptures = captures.filter(c => c.name === 'arrow_function');
			// Normalize whitespace for comparison
			const normalize = s => s.replace(/\s+/g, ' ').trim();
			const expected = ['() => {}', '(x) => x * 2', '(value) => { return value * 2; }'];
			expect(arrowCaptures.map(c => normalize(c.node.text))).to.deep.equal(expected.map(normalize));

			// Check parameter captures
			const paramCaptures = captures.filter(c => c.name === 'param_name');
			expect(paramCaptures.length).to.equal(2);
			expect(paramCaptures.map(c => c.node.text)).to.deep.equal(['x', 'value']);
		});
	});
};

const runAsync = function(parser) {
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
	const parserArrow = createJavaScriptParser(arrowFunctionPattern);
	runArrow(parserArrow);
	const parserAsync = createJavaScriptParser(asyncPattern);
	runAsync(parserAsync);
}

export default function(parser) {
	runArrow(parser);
	runAsync(parser);
}
