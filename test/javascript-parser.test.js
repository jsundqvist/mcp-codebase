import { createJavaScriptParser } from '../src/parsers/javascript.js';

describe('JavaScript Parser Tests', () => {
    const jsParser = createJavaScriptParser();

    function parseAndQuery(code) {
        const tree = jsParser.parser.parse(code);
        return jsParser.query.captures(tree.rootNode);
    }

    describe('Functions', () => {
        it('captures function declaration', () => {
            const code = `function add(a, b) {
    return a + b;
}`;
            const captures = parseAndQuery(code);
            expect(captures).toBeTruthy();
            expect(captures.length).toBeGreaterThan(0);
            
            // Check that we have both the function and name captures
            const functionCapture = captures.find(c => c.name === 'function');
            expect(functionCapture).toBeTruthy();
            expect(functionCapture.node.type).toBe('function_declaration');
            
            const nameCapture = captures.find(c => c.name === 'name');
            expect(nameCapture).toBeTruthy();
            expect(nameCapture.node.text).toBe('add');
        });
    });

    describe('Classes', () => {
        it('captures class declaration', () => {
            const code = `class User {
    constructor(name) {
        this.name = name;
    }
}`;
            const captures = parseAndQuery(code);
            expect(captures).toBeTruthy();
            expect(captures.length).toBeGreaterThan(0);
            
            // Check that we have both the class and name captures
            const classCapture = captures.find(c => c.name === 'class');
            expect(classCapture).toBeTruthy();
            expect(classCapture.node.type).toBe('class_declaration');
            
            const nameCapture = captures.find(c => c.name === 'class_name');
            expect(nameCapture).toBeTruthy();
            expect(nameCapture.node.text).toBe('User');
        });

        it('captures class method', () => {
            const code = `class Calculator {
    add(a, b) {
        return a + b;
    }
}`;
            const captures = parseAndQuery(code);
            expect(captures).toBeTruthy();
            expect(captures.length).toBeGreaterThan(0);
            
            // Check for method capture
            const methodCapture = captures.find(c => c.name === 'method');
            expect(methodCapture).toBeTruthy();
            expect(methodCapture.node.type).toBe('method_definition');
            
            // Check for method name capture
            const nameCapture = captures.find(c => c.name === 'method_name');
            expect(nameCapture).toBeTruthy();
            expect(nameCapture.node.text).toBe('add');
        });
    });

    describe('Variables', () => {
        it('captures variable declarations', () => {
            const code = `const answer = 42;
let count = 0;
var legacy = true;`;
            const captures = parseAndQuery(code);
            expect(captures).toBeTruthy();
            expect(captures.length).toBeGreaterThan(0);
            
            // Should find all three variable declarations
            const varCaptures = captures.filter(c => c.name === 'variable');
            expect(varCaptures.length).toBe(3);
            
            // Check the variable names
            const nameCaptures = captures.filter(c => c.name === 'var_name');
            expect(nameCaptures.length).toBe(3);
            expect(nameCaptures.map(c => c.node.text)).toEqual(['answer', 'count', 'legacy']);
        });
    });

    describe('Function Calls', () => {
        it('captures direct function calls', () => {
            const code = `calculate();
doSomething(arg1, arg2);`;
            const captures = parseAndQuery(code);
            expect(captures).toBeTruthy();
            
            // Check function call captures
            const callCaptures = captures.filter(c => c.name === 'function_call');
            expect(callCaptures.length).toBe(2);
            
            // Check function names
            const nameCaptures = captures.filter(c => c.name === 'function_name');
            expect(nameCaptures.length).toBe(2);
            expect(nameCaptures.map(c => c.node.text)).toEqual(['calculate', 'doSomething']);
        });

        it('captures method calls', () => {
            const code = `console.log("test");
object.method(arg);`;
            const captures = parseAndQuery(code);
            expect(captures).toBeTruthy();
            
            // Check method call captures
            const callCaptures = captures.filter(c => c.name === 'method_call');
            expect(callCaptures.length).toBe(2);
            
            // Check object and property names
            const objectCaptures = captures.filter(c => c.name === 'object');
            expect(objectCaptures.length).toBe(2);
            expect(objectCaptures.map(c => c.node.text)).toEqual(['console', 'object']);
            
            const propertyCaptures = captures.filter(c => c.name === 'property');
            expect(propertyCaptures.length).toBe(2);
            expect(propertyCaptures.map(c => c.node.text)).toEqual(['log', 'method']);
        });
    });

    describe('Error Handling', () => {
        it('captures try-catch blocks', () => {
            const code = `try {
    riskyOperation();
} catch (error) {
    console.error(error);
}`;
            const captures = parseAndQuery(code);
            expect(captures).toBeTruthy();
            
            // Check error handling structure
            const errorCapture = captures.find(c => c.name === 'error_handling');
            expect(errorCapture).toBeTruthy();
            expect(errorCapture.node.type).toBe('try_statement');
            
            // Check try block capture
            const tryCapture = captures.find(c => c.name === 'try_body');
            expect(tryCapture).toBeTruthy();
            
            // Check catch parameter and body
            const errorParamCapture = captures.find(c => c.name === 'error_param');
            expect(errorParamCapture).toBeTruthy();
            expect(errorParamCapture.node.text).toBe('error');
            
            const catchBodyCapture = captures.find(c => c.name === 'catch_body');
            expect(catchBodyCapture).toBeTruthy();
        });
    });

    describe('Modules', () => {
        it('captures named imports', () => {
            const code = `import { useState } from 'react';`;
            const captures = parseAndQuery(code);
            expect(captures).toBeTruthy();
            
            // Check import statement and source
            const importCapture = captures.find(c => c.name === 'import');
            expect(importCapture).toBeTruthy();
            
            const sourceCapture = captures.find(c => c.name === 'module_source');
            expect(sourceCapture).toBeTruthy();
            expect(sourceCapture.node.text).toBe('\'react\'');
            
            // Check import specifier
            const specifierCapture = captures.find(c => c.name === 'import_spec');
            expect(specifierCapture).toBeTruthy();
            
            const nameCapture = captures.find(c => c.name === 'import_name');
            expect(nameCapture).toBeTruthy();
            expect(nameCapture.node.text).toBe('useState');
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
});
