import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { destructurePattern, spreadPattern, objectPattern } from '../../../src/parsers/javascript.js';
import { individual, query } from '../test-utils.js';

const runDestructuring = function(parser) {
	describe('Destructuring', () => {
		it('captures object and array destructuring', () => {
			const code = `
const { x, y } = point;
const [first, second] = array;`;
			const captures = query(parser, code);
			expect(captures).to.be.ok;

			// Check object and array destructuring patterns exist
			const objDestructures = captures.filter(c => c.name === 'obj_destruct');
			expect(objDestructures.map(c => c.node.type)).to.deep.equal(['object_pattern']);

			const arrayDestructures = captures.filter(c => c.name === 'array_destruct');
			expect(arrayDestructures.map(c => c.node.type)).to.deep.equal(['array_pattern']);
		});
	});
};

const runRestSpread = function(parser) {
	describe('Rest and Spread', () => {
		it('captures rest parameters and spread elements', () => {
			const code = `
function sum(...numbers) {
	return numbers.reduce((a, b) => a + b, 0);
}
const array = [1, 2, 3];
const combined = [...array, 4, 5];`;
			const captures = query(parser, code);
			expect(captures).to.be.ok;

			// Check rest parameter
			const restParams = captures.filter(c => c.name === 'rest_param');
			expect(restParams.length).to.equal(1);
			expect(restParams[0].node.text).to.equal('numbers');

			// Check spread element
			const spreadVars = captures.filter(c => c.name === 'spread_var');
			expect(spreadVars.length).to.equal(1);
			expect(spreadVars[0].node.text).to.equal('array');
		});
	});
};

const runObjects = function(parser) {
	describe('Objects', () => {
		it('captures object properties and methods', () => {
			const code = `
const obj = {
	name: "test",
	value: 42,
	method() {
		return this.value;
	}
};`;
			const captures = query(parser, code);
			expect(captures).to.be.ok;

			// Check property captures
			const propCaptures = captures.filter(c => c.name === 'prop_name');
			expect(propCaptures.length).to.equal(2); // name and value
			expect(propCaptures.map(c => c.node.text)).to.deep.equal(['name', 'value']);

			// Check method capture
			const methodCapture = captures.find(c => c.name === 'method_name');
			expect(methodCapture).to.be.ok;
			expect(methodCapture.node.text).to.equal('method');
		});
	});
};

if (individual(import.meta.url)) {
	const parserDestructuring = createJavaScriptParser(destructurePattern);
	runDestructuring(parserDestructuring);
	const parserRestSpread = createJavaScriptParser(spreadPattern);
	runRestSpread(parserRestSpread);
	const parserObjects = createJavaScriptParser(objectPattern);
	runObjects(parserObjects);
}

export default function(parser) {
	runDestructuring(parser);
	runRestSpread(parser);
	runObjects(parser);
}
