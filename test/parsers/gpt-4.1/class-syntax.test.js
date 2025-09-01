import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { classPattern, classFieldPattern } from '../../../src/parsers/javascript.js';
import { individual, query } from '../test-utils.js';

const runClasses = function(parser) {
	describe('Classes', () => {
		it('captures class declarations', () => {
			const code = `class User {
	constructor(name) {
		this.name = name;
	}
}`;
			const captures = query(parser, code);
			expect(captures).to.be.ok;
			expect(captures.length).to.be.greaterThan(0);

			// Check that we have both the class and name captures
			const classCapture = captures.find(c => c.name === 'class');
			expect(classCapture).to.be.ok;
			expect(classCapture.node.type).to.equal('class_declaration');

			const nameCapture = captures.find(c => c.name === 'class_name');
			expect(nameCapture).to.be.ok;
			expect(nameCapture.node.text).to.equal('User');
		});

		it('captures class method', () => {
			const code = `class Calculator {
	add(a, b) {
		return a + b;
	}
}`;
			const captures = query(parser, code);
			expect(captures).to.be.ok;
			expect(captures.length).to.be.greaterThan(0);

			// Check for method capture
			const methodCapture = captures.find(c => c.name === 'method');
			expect(methodCapture).to.be.ok;
			expect(methodCapture.node.type).to.equal('method_definition');

			// Check for method name capture
			const nameCapture = captures.find(c => c.name === 'method_name');
			expect(nameCapture).to.be.ok;
			expect(nameCapture.node.text).to.equal('add');
		});
	});
};

const runClassFields = function(parser) {
	describe('Class Fields', () => {
		it('captures class fields and private members', () => {
			const code = `
class Example {
	// Public fields
	name = "test";
	static count = 0;

	// Private fields
	#private = 123;
	static #instances = 0;

	// Private methods
	#privateMethod() {
		return this.#private;
	}
	static #createInstance() {
		this.#instances++;
		return new Example();
	}

	// Private accessors
	get #secretValue() {
		return this.#private * 2;
	}
	set #secretValue(value) {
		this.#private = value / 2;
	}

	// Usage in public methods
	getValue() {
		return this.#secretValue;
	}
	static getInstance() {
		return Example.#createInstance();
	}
}`;
			const captures = query(parser, code);
			expect(captures).to.be.ok;

			// Check public fields
			const fields = captures.filter(c => c.name === 'field_name');
			expect(fields.map(c => c.node.text)).to.deep.equal(['name', 'count']);

			// Check private identifiers
			const privateNames = captures.filter(c => c.name === 'private_name');
			const privateTexts = privateNames.map(c => c.node.text);

			// Verify each private member exists
			expect(privateTexts).to.include('#private');  // instance field
			expect(privateTexts).to.include('#instances');  // static field
			expect(privateTexts).to.include('#privateMethod');  // instance method
			expect(privateTexts).to.include('#createInstance');  // static method
			expect(privateTexts).to.include('#secretValue');  // accessor property
		});
	});
};

if (individual(import.meta.url)) {
	const parserClasses = createJavaScriptParser(classPattern);
	runClasses(parserClasses);
	const parserClassFields = createJavaScriptParser(classFieldPattern);
	runClassFields(parserClassFields);
}

export default function(parser) {
	runClasses(parser);
	runClassFields(parser);
}
