import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    modulePattern
} from '../../../src/parsers/javascript.js';
import { query, individual } from '../test-utils.js';

// Combine patterns for this group
const es6ModulesQuery = [
    modulePattern
].join('\n');

const run = function(parser) {
    describe('ES6 Modules', () => {
        describe('Import Statements', () => {
            it('captures static imports', () => {
                const code = `import { add, multiply } from './math.js';
import defaultExport from './utils.js';
import * as helpers from './helpers.js';`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check import captures
                const staticImports = captures.filter(c => c.name === 'static_import');
                expect(staticImports).to.have.lengthOf(3);
                expect(staticImports.map(c => c.node.type)).to.deep.equal(['import_statement', 'import_statement', 'import_statement']);

                // Check import specifiers
                const importNames = captures.filter(c => c.name === 'import_name');
                expect(importNames).to.have.lengthOf(2);  // add, multiply
            });
        });

        describe('Export Statements', () => {
            it('captures function and class exports', () => {
                const code = `export function add(a, b) {
    return a + b;
}

export class Calculator {
    add(a, b) {
        return a + b;
    }
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check export captures
                const functionExports = captures.filter(c => c.name === 'export_function');
                expect(functionExports).to.have.lengthOf(1);

                const classExports = captures.filter(c => c.name === 'export_class');
                expect(classExports).to.have.lengthOf(1);
            });

            it('captures variable exports', () => {
                const code = `export const PI = 3.14;
export let version = '1.0.0';`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check variable export captures
                const varExports = captures.filter(c => c.name === 'export_var');
                expect(varExports).to.have.lengthOf(2);
            });
        });

        describe('Dynamic Imports', () => {
            it('captures dynamic import expressions', () => {
                const code = `const module = import('./dynamic.js');
const asyncLoad = async () => {
    const mod = await import('./async-module.js');
    return mod;
};`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check dynamic import captures
                const dynamicImports = captures.filter(c => c.name === 'dynamic_import');
                expect(dynamicImports).to.have.lengthOf(2);
                expect(dynamicImports.map(c => c.node.type)).to.deep.equal(['call_expression', 'call_expression']);
            });
        });

        describe('Re-exports', () => {
            it('captures re-export statements', () => {
                const code = `export { add, multiply } from './math.js';
export * from './utils.js';`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check re-export captures
                const reExports = captures.filter(c => c.name === 're_export');
                expect(reExports).to.have.lengthOf(2);
                expect(reExports.map(c => c.node.type)).to.deep.equal(['export_statement', 'export_statement']);
            });
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(es6ModulesQuery);
    run(parser);
}

export default run;
