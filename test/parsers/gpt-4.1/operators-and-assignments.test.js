import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { operatorPattern, logicalAssignmentPattern } from '../../../src/parsers/javascript.js';
import { individual, query } from '../test-utils.js';

const runOperators = function(parser) {
	describe('Operators', () => {
		it('captures binary operators', () => {
			const code = 'a + b - c * d / e % f';
			const captures = query(parser, code);
			expect(captures).to.be.ok;
			const ops = captures.filter(c => c.name === 'binary_operator');
			expect(ops.map(c => c.node.type)).to.deep.equal(['binary_expression','binary_expression','binary_expression','binary_expression','binary_expression']);
		});
		it('captures logical operators', () => {
			const code = 'a && b || c ?? d';
			const captures = query(parser, code);
			expect(captures).to.be.ok;
			const ops = captures.filter(c => c.name === 'logical_operator');
			expect(ops.map(c => c.node.type)).to.deep.equal([
				'binary_expression', 'binary_expression', 'binary_expression', '&&', '||', '??'
			]);
		});
		it('captures unary operators', () => {
			const code = '!a ~b +c -d';
			const captures = query(parser, code);
			expect(captures).to.be.ok;
			const ops = captures.filter(c => c.node.type === 'unary_expression');
			expect(ops.map(c => c.node.type)).to.deep.equal(['unary_expression','unary_expression']);
		});
	});
};

const runAssignments = function(parser) {
	describe('Logical Assignments', () => {
		it('captures logical assignments', () => {
			const code = 'a ??= 1; b &&= 2; c ||= 3;';
			const captures = query(parser, code);
			expect(captures).to.be.ok;
			const assigns = captures.filter(c => c.name === 'logical_assignment');
			expect(assigns.map(c => c.node.type)).to.deep.equal(['augmented_assignment_expression','augmented_assignment_expression','augmented_assignment_expression']);
		});
	});
};

if (individual(import.meta.url)) {
	const parserOperators = createJavaScriptParser(operatorPattern);
	runOperators(parserOperators);
	const parserAssignments = createJavaScriptParser(logicalAssignmentPattern);
	runAssignments(parserAssignments);
}

export default function(parser) {
	runOperators(parser);
	runAssignments(parser);
}
// Merged: operators.test.js + logical-assignments.test.js
// ...existing code from both files...
