import { parseAndQuery } from './test-utils.js';

describe('JavaScript Modules', () => {
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
        const captures = parseAndQuery(code);
        expect(captures).toBeTruthy();
        // Check static imports and their sources
        const staticSources = new Set(
            captures
                .filter(c => c.name === 'module_source')
                .map(c => c.node.text)
        );
        expect(staticSources).toEqual(new Set([
            '\'react\'',
            '\'./types\''
        ]));
        // Check import specifiers
        const importNames = new Set(
            captures
                .filter(c => c.name === 'import_name')
                .map(c => c.node.text)
        );
        expect(importNames).toEqual(new Set([
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
        expect(dynamicSources).toEqual(new Set([
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
        expect(importFuncs).toEqual(new Set(['import']));
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
        const captures = parseAndQuery(code);
        expect(captures).toBeTruthy();
        // Verify top-level await expressions
        const topLevelAwaits = captures.filter(c => c.name === 'top_level_await');
        // Each should be under lexical declarations (const/let)
        expect(new Set(topLevelAwaits.map(c => c.node.parent?.parent?.type)))
            .toEqual(new Set(['lexical_declaration']));
        // Should include all actual top-level awaits from the code
        expect(new Set(topLevelAwaits.map(c => c.node.text))).toEqual(new Set([
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
        const captures = parseAndQuery(code);
        expect(captures).toBeTruthy();
        // Check function export
        const functionExport = captures.find(c => c.name === 'export_function');
        expect(functionExport).toBeTruthy();
        // Check class export
        const classExport = captures.find(c => c.name === 'export_class');
        expect(classExport).toBeTruthy();
        // Check variable export
        const varExport = captures.find(c => c.name === 'export_var');
        expect(varExport).toBeTruthy();
        // Check declarations
        const declCaptures = captures.filter(c => c.name === 'export_decl');
        expect(declCaptures.length).toBe(4);  // function, class, const, var
        const types = declCaptures.map(c => c.node.type);
        expect(types).toContain('function_declaration');
        expect(types).toContain('class_declaration');
        expect(types).toContain('lexical_declaration');
        expect(types).toContain('variable_declaration');
    });
});
