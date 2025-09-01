import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { functionPattern, callPattern } from '../../../src/parsers/javascript.js';
import { individual, query } from '../test-utils.js';

const runFunctions = function(parser) {
	describe('Functions', () => {
		it('captures function declaration', () => {
			const code = `function add(a, b) {
  return a + b;
}`;
			const captures = query(parser, code);
			expect(captures).to.be.ok;
			expect(captures.length).to.be.greaterThan(0);

			// Check that we have both the function and name captures
			const functionCapture = captures.find(c => c.name === 'function');
			expect(functionCapture).to.be.ok;
			expect(functionCapture.node.type).to.equal('function_declaration');

			const nameCapture = captures.find(c => c.name === 'name');
			expect(nameCapture).to.be.ok;
			expect(nameCapture.node.text).to.equal('add');
		});
	});
};

const runCalls = function(parser) {
	describe('Function Calls', () => {
		it('captures direct function calls', () => {
			const code = `calculate(1, 2);
console.log('Hello');`;
			const captures = query(parser, code);
			expect(captures).to.be.ok;
			expect(captures.length).to.be.greaterThan(0);

			// Check for direct function call captures
			const callCaptures = captures.filter(c => c.name === 'function_call');
			expect(callCaptures.length).to.be.greaterThan(0);
		});

		it('captures method calls', () => {
			const code = `obj.method(arg1, arg2);
array.push(item);`;
			const captures = query(parser, code);
			expect(captures).to.be.ok;
			expect(captures.length).to.be.greaterThan(0);

			// Check for method call captures
			const methodCaptures = captures.filter(c => c.name === 'method_call');
			expect(methodCaptures.length).to.be.greaterThan(0);
		});
	});
};

if (individual(import.meta.url)) {
	const parserFunctions = createJavaScriptParser(functionPattern);
	runFunctions(parserFunctions);
	const parserCalls = createJavaScriptParser(callPattern);
	runCalls(parserCalls);
}

export default function(parser) {
	runFunctions(parser);
	runCalls(parser);
}
