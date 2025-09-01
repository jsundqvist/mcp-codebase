import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    arrowFunctionPattern,
    objectPattern,
    destructurePattern,
    templatePattern
} from '../../../src/parsers/javascript.js';
import { query, individual } from '../test-utils.js';

// Combine patterns for this group
const es6ObjectFeaturesQuery = [
    arrowFunctionPattern,
    objectPattern,
    destructurePattern,
    templatePattern
].join('\n');

const run = function(parser) {
    describe('ES6 Object Features (Combined)', () => {
        it('captures all ES6 object features - updated', () => {
            const code = `const add = (a, b) => a + b;
const obj = {
    name: 'John',
    greet() {
        return \`Hello, \${this.name}!\`;
    }
};
const { name } = obj;
const [first] = array;`;
            const captures = query(parser, code);
            expect(captures).to.be.ok;
            // Filter to only ES6 object features captures - exclude overlapping patterns from other groups
            const es6Captures = captures.filter(c =>
                ['param_name', 'prop_name', 'object_prop', 'method_name', 'object_method', 'obj_destruct', 'array_destruct', 'template', 'template_var', 'template_expr'].includes(c.name)
            );
            expect(es6Captures.map(c => c.name)).to.deep.equal(['param_name', 'param_name', 'object_prop', 'prop_name', 'object_method', 'method_name', 'template', 'obj_destruct', 'array_destruct']);

            // Check that we have the main ES6 features
            const objDestruct = captures.find(c => c.name === 'obj_destruct');
            expect(objDestruct).to.be.ok;
            expect(objDestruct.node.type).to.equal('object_pattern');

            const templateCapture = captures.find(c => c.name === 'template');
            expect(templateCapture).to.be.ok;
            expect(templateCapture.node.type).to.equal('template_string');
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(es6ObjectFeaturesQuery);
    run(parser);
}

export default run;
