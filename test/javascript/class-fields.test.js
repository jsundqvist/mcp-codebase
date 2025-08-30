import { parseAndQuery } from './test-utils.js';

describe('JavaScript Class Fields', () => {
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
        expect(captures).toBeTruthy();
        
        // Check public fields
        const fields = captures.filter(c => c.name === 'field_name');
        expect(fields.length).toBe(2);  // name and count
        expect(fields.map(c => c.node.text)).toContain('name');
        expect(fields.map(c => c.node.text)).toContain('count');
        
        // Check private identifiers
        const privateNames = captures.filter(c => c.name === 'private_name');
        const privateTexts = privateNames.map(c => c.node.text);

        // Verify each private member exists
        expect(privateTexts).toContain('#private');  // instance field
        expect(privateTexts).toContain('#instances');  // static field
        expect(privateTexts).toContain('#privateMethod');  // instance method
        expect(privateTexts).toContain('#createInstance');  // static method
        expect(privateTexts).toContain('#secretValue');  // accessor property

        // Check typed captures
        const staticFields = captures.filter(c => c.name === 'static_field');
        expect(staticFields.length).toBe(1);  // #instances

        const staticMethods = captures.filter(c => c.name === 'static_method');
        expect(staticMethods.length).toBe(1);  // #createInstance

        const getters = captures.filter(c => c.name === 'getter_method');
        expect(getters.length).toBe(1);  // #secretValue getter

        const setters = captures.filter(c => c.name === 'setter_method');
        expect(setters.length).toBe(1);  // #secretValue setter
    });
});
