import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { classFieldPattern } from '../../../src/parsers/javascript.js';
import { individual } from './test-utils.js';

function query(parser, code) {
    const tree = parser.parser.parse(code);
    return parser.query.captures(tree.rootNode);
}

const run = function(parser) {
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

            // Check typed captures
            const staticFields = captures.filter(c => c.name === 'static_field');
            expect(staticFields.map(c => c.node.text)).to.deep.equal(['static #instances = 0']);

            const staticMethods = captures.filter(c => c.name === 'static_method');
            expect(staticMethods.map(c => c.node.text)).to.deep.equal(['static #createInstance() {\n        this.#instances++;\n        return new Example();\n    }']);

            const getters = captures.filter(c => c.name === 'getter_method');
            expect(getters.map(c => c.node.text)).to.deep.equal(['get #secretValue() {\n        return this.#private * 2;\n    }']);

            const setters = captures.filter(c => c.name === 'setter_method');
            expect(setters.map(c => c.node.text)).to.deep.equal(['set #secretValue(value) {\n        this.#private = value / 2;\n    }']);
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(classFieldPattern);
    run(parser);
}

export default run;
