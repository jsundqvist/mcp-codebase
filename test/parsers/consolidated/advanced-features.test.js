import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    modulePattern,
    classFieldPattern
} from '../../../src/parsers/javascript.js';
import { query, individual } from '../test-utils.js';

// Combine patterns for this group
const advancedFeaturesQuery = [
    modulePattern,
    classFieldPattern
].join('\n');

const run = function(parser) {
    describe('Advanced Features', () => {
        describe('Modules', () => {
            it('captures static and dynamic imports', () => {
                const code = `
// Static imports
import { useState, useEffect } from 'react';
import type { Config } from './types';

// Dynamic imports
const Component = await import('./components/LazyComponent');
const localeData = await import('./locales/en.json');

// Conditional dynamic imports
if (feature.enabled) {
    const module = await import('./feature-module');
}

// Dynamic imports with destructuring
const { default: DefaultComponent, utils } = await import('./module');`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Check static imports and their sources
                const staticSources = new Set(
                    captures
                        .filter(c => c.name === 'module_source')
                        .map(c => c.node.text)
                );
                expect(staticSources).to.deep.equal(new Set([
                    '\'react\'',
                    '\'./types\''
                ]));
                // Check import specifiers
                const importNames = new Set(
                    captures
                        .filter(c => c.name === 'import_name')
                        .map(c => c.node.text)
                );
                expect(importNames).to.deep.equal(new Set([
                    'useState',
                    'useEffect',
                    'Config'
                ]));
                // Check dynamic imports
                const dynamicSources = new Set(
                    captures
                        .filter(c => c.name === 'dynamic_source')
                        .map(c => c.node.text)
                );
                expect(dynamicSources).to.deep.equal(new Set([
                    '\'./components/LazyComponent\'',
                    '\'./feature-module\'',
                    '\'./locales/en.json\'',
                    '\'./module\''
                ]));
                // Verify all import function calls are actually 'import'
                const importFuncs = new Set(
                    captures
                        .filter(c => c.name === 'import_function')
                        .map(c => c.node.text)
                );
                expect(importFuncs).to.deep.equal(new Set(['import']));
            });

            it('captures top-level await expressions', () => {
                const code = `
// Top-level await expressions
const db = await initDatabase();
const cache = await setupCache();

// Multiple awaits in sequence
const [users, products] = await Promise.all([
    Promise.resolve(123),
    Promise.resolve(456)
]);

// Top-level await with dynamic import
const { data } = await import('./data.json');
const api = await import('./api.js');

// Not a top-level await (inside function)
async function loadData() {
    const result = await fetchData();
    const mod = await import('./internal.js');
    return { result, mod };
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Verify top-level await expressions
                const topLevelAwaits = captures.filter(c => c.name === 'top_level_await');
                // Each should be under lexical declarations (const/let)
                expect(new Set(topLevelAwaits.map(c => c.node.parent?.parent?.type)))
                    .to.deep.equal(new Set(['lexical_declaration']));
                // Should include all actual top-level awaits from the code
                expect(new Set(topLevelAwaits.map(c => c.node.text))).to.deep.equal(new Set([
                    'await initDatabase()',
                    'await setupCache()',
                    'await Promise.all([\n    Promise.resolve(123),\n    Promise.resolve(456)\n])',
                    'await import(\'./data.json\')',
                    'await import(\'./api.js\')'
                ]));
            });

            it('captures different types of exports', () => {
                const code = `
export function getData() {
    return [];
}

export class Service {
    method() {}
}

export const config = {
    enabled: true
};

export var legacy = false;`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Check function export
                const functionExport = captures.find(c => c.name === 'export_function');
                expect(functionExport).to.be.ok;
                // Check class export
                const classExport = captures.find(c => c.name === 'export_class');
                expect(classExport).to.be.ok;
                // Check variable export
                const varExport = captures.find(c => c.name === 'export_var');
                expect(varExport).to.be.ok;
                // Check declarations
                const declCaptures = captures.filter(c => c.name === 'export_decl');
                expect(declCaptures.length).to.equal(4);  // function, class, const, var
                const types = declCaptures.map(c => c.node.type);
                expect(types).to.include('function_declaration');
                expect(types).to.include('class_declaration');
                expect(types).to.include('lexical_declaration');
                expect(types).to.include('variable_declaration');
            });
        });

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
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(advancedFeaturesQuery);
    run(parser);
}

export default run;
