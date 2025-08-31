import { parseAndQuery } from './test-utils.js';

describe('Class Fields', () => {
    // const jsParser = createTestParser();

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
        const captures = parseAndQuery(code);
        expect(captures).to.be.ok;

        // Check public fields
        const fields = captures.filter(c => c.name === 'field_name');
        expect(fields.length).to.equal(2);  // name and count
        expect(fields.map(c => c.node.text)).to.include('name');
        expect(fields.map(c => c.node.text)).to.include('count');

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
        expect(staticFields.length).to.equal(1);  // #instances

        const staticMethods = captures.filter(c => c.name === 'static_method');
        expect(staticMethods.length).to.equal(1);  // #createInstance

        const getters = captures.filter(c => c.name === 'getter_method');
        expect(getters.length).to.equal(1);  // #secretValue getter

        const setters = captures.filter(c => c.name === 'setter_method');
        expect(setters.length).to.equal(1);  // #secretValue setter
    });
});
