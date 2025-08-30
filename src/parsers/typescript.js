import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';
import { tsQuery } from './typescript-query.js';

export function createTypeScriptParser() {
    const parser = new Parser();
    parser.setLanguage(TypeScript.typescript);
    return {
        language: 'typescript',
        query: new Parser.Query(TypeScript.typescript, tsQuery),
        parser,
        getNodeName: (node) => {
            // Handle both JavaScript identifiers and TypeScript type_identifiers
            const nameNode = node.childForFieldName('name');
            return nameNode?.text || 'anonymous';
        },
        isExportable: (node) => [
            // Include JavaScript exportable types
            'function_declaration',
            'class_declaration',
            'variable_declaration',
            // Add TypeScript-specific types
            'interface_declaration',
            'type_alias_declaration'
        ].includes(node.type)
    };
}

export function isTypeScriptFile(filePath) {
    return /\.(ts|tsx)$/.test(filePath);
}
