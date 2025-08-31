import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { jsQuery } from '../../../src/parsers/javascript-query.js';

// Create a single global parser and query instance
const globalParser = createJavaScriptParser(jsQuery);

export function parseAndQuery(code) {
    const tree = globalParser.parser.parse(code);
    return globalParser.query.captures(tree.rootNode);
}
