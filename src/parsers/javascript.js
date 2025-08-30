import Parser from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';
import { jsQuery } from './javascript-query.js';

export function createJavaScriptParser() {
    const parser = new Parser();
    parser.setLanguage(JavaScript);
    return {
        language: 'javascript',
        query: new Parser.Query(JavaScript, jsQuery),
        parser,
        getNodeName: (node) => node.childForFieldName('name')?.text || 'anonymous',
        isExportable: (node) => ['function_declaration', 'class_declaration', 'variable_declaration'].includes(node.type)
    };
}

export function isJavaScriptFile(filePath) {
    return /\.(js|jsx|mjs)$/.test(filePath);
}
