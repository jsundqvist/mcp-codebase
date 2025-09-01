import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    classFieldPattern
} from '../../../src/parsers/javascript.js';
import { query, individual } from '../test-utils.js';

// Combine patterns for this group
const classFieldsQuery = [
    classFieldPattern
].join('\n');

const run = function(parser) {
    describe('Class Fields', () => {
        describe('Public Fields', () => {
            it('captures public class fields', () => {
                const code = `class User {
    name;
    age = 25;
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only class field captures
                const fieldCaptures = captures.filter(c => 
                    ['field', 'field_name', 'private_name', 'static_field', 'static_method', 'getter_method', 'setter_method'].includes(c.name)
                );
                expect(fieldCaptures.map(c => c.name)).to.deep.equal(['field', 'field_name', 'field', 'field_name']);

                // Check field captures
                const fieldOnlyCaptures = fieldCaptures.filter(c => c.name === 'field');
                expect(fieldOnlyCaptures.map(c => c.node.type)).to.deep.equal(['field_definition', 'field_definition']);
            });
        });

        describe('Private Fields', () => {
            it('captures private identifiers', () => {
                const code = `class User {
    #name;
    #age;
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only class field captures
                const fieldCaptures = captures.filter(c => 
                    ['field', 'field_name', 'private_name', 'static_field', 'static_method', 'getter_method', 'setter_method'].includes(c.name)
                );
                expect(fieldCaptures.map(c => c.name)).to.deep.equal(['private_name', 'private_name']);

                // Check private identifier captures
                const privateCaptures = fieldCaptures.filter(c => c.name === 'private_name');
                expect(privateCaptures.map(c => c.node.type)).to.deep.equal(['private_property_identifier', 'private_property_identifier']);
            });
        });

        describe('Static Members', () => {
            it('captures static fields and methods', () => {
                const code = `class Calculator {
    static PI = 3.14;
    static add(a, b) {
        return a + b;
    }
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only class field captures
                const fieldCaptures = captures.filter(c => 
                    ['field', 'field_name', 'private_name', 'static_field', 'static_method', 'getter_method', 'setter_method'].includes(c.name)
                );
                expect(fieldCaptures.map(c => c.name)).to.deep.equal(['field', 'field_name']);
            });
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(classFieldsQuery);
    run(parser);
}

export default run;
