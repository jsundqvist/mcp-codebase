import { createJavaScriptParser } from '../src/parsers/javascript.js';

describe('JavaScript Parser Tests', () => {
    const jsParser = createJavaScriptParser();

    function parseAndQuery(code) {
        const tree = jsParser.parser.parse(code);
        return jsParser.query.captures(tree.rootNode);
    }

    describe('Functions', () => {
        it('captures arrow functions', () => {
            const code = `
const simple = () => {};
const withParam = (x) => x * 2;
const withBlock = (value) => {
    return value * 2;
};`;
            const captures = parseAndQuery(code);
            expect(captures).toBeTruthy();
            
            // Check arrow function captures
            const arrowCaptures = captures.filter(c => c.name === 'arrow_function');
            expect(arrowCaptures.length).toBe(3);
            
            // Check parameter captures
            const paramCaptures = captures.filter(c => c.name === 'param_name');
            expect(paramCaptures.length).toBe(2);
            expect(paramCaptures.map(c => c.node.text)).toEqual(['x', 'value']);
        });

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

    describe('Member Access and Operators', () => {
        it('captures basic member access and binary expressions', () => {
            const code = `
const obj = {
    x: 1,
    y: 2
};
const value = obj.x;
const sum = a + b;
const product = x * y;`;
            const captures = parseAndQuery(code);
            expect(captures).toBeTruthy();
            
            // Check member expressions
            const memberAccess = captures.filter(c => c.name === 'member');
            expect(memberAccess.length).toBe(1);  // obj.x
            
            // Check binary expressions
            const binaryOps = captures.filter(c => c.name === 'binary');
            expect(binaryOps.length).toBe(2);  // + and * operations
        });

        it('captures logical assignment operators', () => {
            const code = `
// Nullish coalescing assignment
let settings = {};
settings.timeout ??= 5000;  // Set if undefined/null
settings.retries ??= 3;     // Set if undefined/null

// Logical AND assignment
let config = { debug: true };
config.verbose &&= isDevMode;  // Set only if config.verbose is truthy
permissions.write &&= userHasAccess;  // Set only if permissions.write is truthy

// Logical OR assignment
let headers = {};
headers.contentType ||= 'application/json';  // Set if falsy
cache.maxSize ||= 1000;  // Set if falsy`;
            const captures = parseAndQuery(code);
            expect(captures).toBeTruthy();

            // Check logical assignments
            const logicalOps = captures.filter(c => c.name === 'logical_operator');
            expect(logicalOps.length).toBe(6);  // 2 of each operator type

            // Group by operator type
            const operators = logicalOps.map(c => c.node.text);
            const nullishAssigns = operators.filter(op => op === '??=');
            const andAssigns = operators.filter(op => op === '&&=');
            const orAssigns = operators.filter(op => op === '||=');

            // Check counts of each type
            expect(nullishAssigns.length).toBe(2);  // timeout and retries
            expect(andAssigns.length).toBe(2);      // verbose and write
            expect(orAssigns.length).toBe(2);       // contentType and maxSize

            // Check full assignments
            const assignments = captures.filter(c => c.name === 'logical_assignment');
            expect(assignments.length).toBe(6);  // All logical assignments
            
            // Verify we captured some specific assignments
            const assignmentTexts = assignments.map(c => c.node.text);
            expect(assignmentTexts.some(t => t.includes('settings.timeout ??= 5000'))).toBe(true);
            expect(assignmentTexts.some(t => t.includes('config.verbose &&= isDevMode'))).toBe(true);
            expect(assignmentTexts.some(t => t.includes('headers.contentType ||= '))).toBe(true);
        });

        it('captures optional chaining and nullish coalescing expressions', () => {
            const code = `
// Basic optional chaining
const name = user?.profile?.name;
const items = response?.data?.items;

// Nullish coalescing
const value = data?.value ?? defaultValue;
const config = settings?.timeout ?? 5000;

// Complex nested optional chaining
const nested = obj?.foo?.bar?.baz?.qux;
const method = instance?.compute?.()?.result;

// Multiple nullish coalescing
const fallback = value ?? backup ?? default ?? null;

// Combined optional chaining and nullish coalescing
const complex = user?.settings?.theme?.color ?? defaultTheme?.color ?? '#000000';`;
            const captures = parseAndQuery(code);
            expect(captures).toBeTruthy();
            
            // Check optional chain expressions
            const optionalChains = captures.filter(c => c.name === 'optional_chain');
            expect(optionalChains.length).toBe(17);  // All ?. operators
            
            // Check nullish coalescing expressions
            const nullishCoalesce = captures.filter(c => c.name === 'nullish_coalesce');
            expect(nullishCoalesce.length).toBe(7);  // All ?? operators

            // Add array access case
const code2 = `
const item = array?.[0]?.name;
const element = list?.[index]?.value;`;
            const arrayCaptures = parseAndQuery(code2);
            const arrayOptionalChains = arrayCaptures.filter(c => c.name === 'optional_chain');
            expect(arrayOptionalChains.length).toBe(4);  // array?.[0], [0]?.name, list?.[index], [index]?.value

            // Verify specific pattern types exist
            const hasMethodChain = optionalChains.some(c => 
                c.node.text?.includes('compute') || 
                c.node.parent?.text?.includes('compute?.'));
            expect(hasMethodChain).toBe(true, 'Should find optional chaining with compute method');

            // Verify multiple nullish coalescing
            const hasMultipleNullish = nullishCoalesce.some(c => 
                c.node.text?.includes('??') && 
                (c.node.parent?.text?.includes('backup') || c.node.text?.includes('backup')));
            expect(hasMultipleNullish).toBe(true, 'Should find nullish coalescing with backup value');
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

    describe('Rest and Spread', () => {
        it('captures rest parameters and spread elements', () => {
            const code = `
function sum(...numbers) {
    return numbers.reduce((a, b) => a + b, 0);
}
const array = [1, 2, 3];
const combined = [...array, 4, 5];`;
            const captures = parseAndQuery(code);
            expect(captures).toBeTruthy();
            
            // Check rest parameter
            const restParams = captures.filter(c => c.name === 'rest_param');
            expect(restParams.length).toBe(1);
            expect(restParams[0].node.text).toBe('numbers');
            
            // Check spread element
            const spreadVars = captures.filter(c => c.name === 'spread_var');
            expect(spreadVars.length).toBe(1);
            expect(spreadVars[0].node.text).toBe('array');
        });
    });

    describe('Template Literals', () => {
        it('captures template strings and expressions', () => {
            const code = `
const name = "world";
const greeting = \`Hello \${name}!\`;
const multiline = \`
    line 1
    \${value}
    line 2
\`;`;
            const captures = parseAndQuery(code);
            expect(captures).toBeTruthy();
            
            // Check template strings
            const templates = captures.filter(c => c.name === 'template');
            expect(templates.length).toBe(2);
            
            // Check template expressions
            const expressions = captures.filter(c => c.name === 'template_expr');
            expect(expressions.length).toBe(2);
            
            // Check template variables
            const vars = captures.filter(c => c.name === 'template_var');
            expect(vars.length).toBe(2);
            expect(vars.map(c => c.node.text)).toEqual(['name', 'value']);
        });
    });

    describe('Async/Await', () => {
        it('captures async functions and await expressions', () => {
            const code = `
async function fetchData() {
    const result = await fetch('/api');
    return result;
}`;
            const captures = parseAndQuery(code);
            expect(captures).toBeTruthy();
            
            // Check async function
            const asyncFuncs = captures.filter(c => c.name === 'async_function');
            expect(asyncFuncs.length).toBe(1);
            
            const asyncNames = captures.filter(c => c.name === 'async_name');
            expect(asyncNames.length).toBe(1);
            expect(asyncNames[0].node.text).toBe('fetchData');
            
            // Check await expression
            const awaits = captures.filter(c => c.name === 'await_expr');
            expect(awaits.length).toBe(1);
        });
    });

    describe('Destructuring', () => {
        it('captures object and array destructuring', () => {
            const code = `
const { x, y } = point;
const [first, second] = array;`;
            const captures = parseAndQuery(code);
            expect(captures).toBeTruthy();
            
            // Check object and array destructuring patterns exist
            const objDestructures = captures.filter(c => c.name === 'obj_destruct');
            expect(objDestructures.length).toBe(1);
            expect(objDestructures[0].node.type).toBe('object_pattern');
            
            const arrayDestructures = captures.filter(c => c.name === 'array_destruct');
            expect(arrayDestructures.length).toBe(1);
            expect(arrayDestructures[0].node.type).toBe('array_pattern');
        });
    });

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
            const captures = parseAndQuery(code);
            expect(captures).toBeTruthy();
            
            // Check property captures
            const propCaptures = captures.filter(c => c.name === 'prop_name');
            expect(propCaptures.length).toBe(2); // name and value
            expect(propCaptures.map(c => c.node.text)).toEqual(['name', 'value']);
            
            // Check method capture
            const methodCapture = captures.find(c => c.name === 'method_name');
            expect(methodCapture).toBeTruthy();
            expect(methodCapture.node.text).toBe('method');
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
            
            // Check static imports
            const staticImports = captures.filter(c => c.name === 'static_import');
            expect(staticImports.length).toBe(2);  // react and types imports

            // Check static import sources
            const staticSources = captures.filter(c => c.name === 'module_source');
            expect(staticSources.map(c => c.node.text))
                .toEqual(expect.arrayContaining(['\'react\'', '\'./types\'']));
            
            // Check import specifiers
            const importNames = captures.filter(c => c.name === 'import_name');
            expect(importNames.map(c => c.node.text))
                .toEqual(expect.arrayContaining(['useState', 'useEffect', 'Config']));

            // Check dynamic imports and their parts
            const dynamicImports = captures.filter(c => c.name === 'dynamic_import');
            expect(dynamicImports.length).toBe(4);  // All import() calls
            
            // Verify import function names
            const importFuncs = captures.filter(c => c.name === 'import_function');
            expect(importFuncs.length).toBe(4);
            expect(importFuncs.every(c => c.node.text === 'import')).toBe(true);

            // Verify source strings with their quotes
            const sources = captures.filter(c => c.name === 'dynamic_source');
            expect(sources.length).toBe(4);
            expect(sources.map(c => c.node.text).sort())
                .toEqual([
                    '\'./components/LazyComponent\'',
                    '\'./feature-module\'',
                    '\'./locales/en.json\'',
                    '\'./module\''
                ].sort());
        });

        it('captures top-level await expressions', () => {
            const code = `
// Top-level await expressions
const db = await initDatabase();
const cache = await setupCache();

// Multiple awaits in sequence
const [users, products] = await Promise.all([
    fetchUsers(),
    fetchProducts()
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
            expect(topLevelAwaits.length).toBe(4);  // db, cache, Promise.all, data
            
            // Each should be under a proper declaration or statement
            topLevelAwaits.forEach(c => {
                const parent = c.node.parent?.parent?.type;
                expect(
                    parent === 'variable_declaration' ||
                    parent === 'lexical_declaration' ||
                    parent === 'expression_statement'
                ).toBe(true);
            });
            
            // Should not capture awaits inside functions
            const awaitTexts = topLevelAwaits.map(c => c.node.text);
            expect(awaitTexts.some(t => t.includes('fetchData'))).toBe(false);
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
