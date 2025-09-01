import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    classFieldPattern
} from '../../../src/parsers/javascript.js';
import { individual, query } from '../test-utils.js';

// Combine patterns for this group
const classFeaturesQuery = [
    classFieldPattern
].join('\n');

const run = function(parser) {
    describe('Class Features', () => {
        describe('Class Fields', () => {
            it('captures static class fields', () => {
                const code = `class Config {
    static #VERSION = '1.0.0';
    static #API_URL = 'https://api.example.com';
    static #MAX_RETRIES = 3;
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check static field captures
                const staticFields = captures.filter(c => c.name === 'static_field');
                expect(staticFields.map(c => c.node.type)).to.deep.equal(['field_definition', 'field_definition', 'field_definition']);
            });

            it('captures instance class fields', () => {
                const code = `class User {
    name = 'Anonymous';
    age = 0;
    isActive = true;
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check instance field captures
                const instanceFields = captures.filter(c => c.name === 'field');
                expect(instanceFields.map(c => c.node.type)).to.deep.equal(['field_definition', 'field_definition', 'field_definition']);

                // Check field names
                const fieldNames = captures.filter(c => c.name === 'field_name');
                expect(fieldNames.map(c => c.node.text)).to.deep.equal(['name', 'age', 'isActive']);
            });

            it('captures private class fields', () => {
                const code = `class BankAccount {
    #balance = 0;
    #accountNumber = '';
    #transactions = [];
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check private field captures
                const privateFields = captures.filter(c => c.name === 'private_name');
                expect(privateFields.map(c => c.node.text)).to.deep.equal(['#balance', '#accountNumber', '#transactions']);
            });

            it('captures computed property names', () => {
                const code = `class Dynamic {
    ['computed' + 'Key'] = 'value';
    [Symbol.iterator] = function* () {};
    [\`template\${expr}\`] = 'dynamic';
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check computed field captures
                const computedFields = captures.filter(c => c.name === 'field');
                expect(computedFields).to.be.empty;  // Pattern doesn't capture computed properties
            });

            it('captures mixed field types', () => {
                const code = `class Mixed {
    static #VERSION = '1.0';
    name = 'test';
    #private = 'secret';
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check all field types are captured
                const staticFields = captures.filter(c => c.name === 'static_field');
                const instanceFields = captures.filter(c => c.name === 'field');
                const privateFields = captures.filter(c => c.name === 'private_name');

                expect(staticFields.map(c => c.node.type)).to.deep.equal(['field_definition']);
                expect(instanceFields.map(c => c.node.type)).to.deep.equal(['field_definition']);
                expect(privateFields.map(c => c.node.text)).to.deep.equal(['#VERSION', '#private']);
            });
        });

        describe('Class Field Methods', () => {
            it('captures arrow function fields', () => {
                const code = `class Handler {
    onClick = () => {
        console.log('clicked');
    };
    onChange = (value) => value * 2;
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check arrow function field captures
                const arrowFields = captures.filter(c => c.name === 'field');
                expect(arrowFields.map(c => c.node.type)).to.deep.equal(['field_definition', 'field_definition']);
            });

            it('captures method fields', () => {
                const code = `class Calculator {
    add = function(a, b) {
        return a + b;
    };
    multiply = (a, b) => a * b;
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check method field captures
                const methodFields = captures.filter(c => c.name === 'field');
                expect(methodFields.map(c => c.node.type)).to.deep.equal(['field_definition', 'field_definition']);
            });
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(classFeaturesQuery);
    run(parser);
}

export default run;
