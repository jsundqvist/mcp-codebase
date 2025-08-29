// src/utils.js
import { parser, embedder } from './globals.js';
import Parser from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';

export async function extractCodeContext(code, filePath = 'untitled.js') {
    const tree = parser.parse(code);
    const contexts = [];
    let idCounter = 0;

    const query = new Parser.Query(JavaScript, `
        (function_declaration 
            name: (identifier) @name
            body: (statement_block) @body) @function

        (class_declaration 
            name: (identifier) @name
            body: (class_body) @body) @class

        (variable_declarator
            name: (identifier) @name
            value: (_) @value) @variable

        (comment) @comment

        (call_expression
            function: (identifier) @called_function) @call

        (call_expression
            function: (member_expression 
                object: (identifier) @object
                property: (property_identifier) @property)) @method_call
    `);

    // First, collect all comments to associate them with nearby declarations
    const comments = [];
    for (const match of query.matches(tree.rootNode)) {
        if (match.captures.find(c => c.name === 'comment')) {
            comments.push(match.captures[0].node);
        }
    }

    // Helper to find nearby comments
    function findNearbyComments(node, maxDistance = 2) {
        return comments.filter(comment => {
            const distance = node.startPosition.row - comment.endPosition.row;
            return distance > 0 && distance <= maxDistance;
        }).map(c => c.text).join('\n');
    }

    for (const match of query.matches(tree.rootNode)) {
        const nameNode = match.captures.find(c => c.name === 'name')?.node;
        const bodyNode = match.captures.find(c => c.name === 'body')?.node;
        const valueNode = match.captures.find(c => c.name === 'value')?.node;
        const exportNode = match.captures.find(c => c.name.startsWith('export_'))?.node;

        let snippetText = '';
        let type = 'unknown';
        let startLine = 0;
        let endLine = 0;
        let identifier = 'anonymous';
        
        const node = exportNode || nameNode?.parent;

        if (!node) continue;

        const nearbyComments = findNearbyComments(node);
        
        if (nameNode && bodyNode) {
            // Include the entire declaration and any nearby comments
            snippetText = nearbyComments + '\n' + node.text;
            type = nameNode.parent.type === 'function_declaration' ? 'function' : 'class';
            startLine = node.startPosition.row;
            endLine = node.endPosition.row;
            identifier = nameNode.text;
        } else if (nameNode && valueNode) {
            // Include variable declaration and any nearby comments
            snippetText = nearbyComments + '\n' + node.text;
            type = 'variable';
            startLine = node.startPosition.row;
            endLine = node.endPosition.row;
            identifier = nameNode.text;
        } else {
            continue;
        }

        // Extract function call relationships
        if (type === 'function' || type === 'class') {
            const functionCalls = new Set();

            // Get all function calls in the body
            for (const match of query.matches(bodyNode)) {
                if (match.captures.find(c => c.name === 'called_function')) {
                    const calledFunction = match.captures.find(c => c.name === 'called_function').node.text;
                    functionCalls.add(calledFunction);
                }
                
                const object = match.captures.find(c => c.name === 'object')?.node?.text;
                const property = match.captures.find(c => c.name === 'property')?.node?.text;
                if (object && property) {
                    functionCalls.add(`${object}.${property}`);
                }
            }

            if (functionCalls.size > 0) {
                const callContext = `Function ${identifier} calls: ${Array.from(functionCalls).join(', ')}`;
                contexts.push({
                    id: `${filePath}::${identifier}_calls::${idCounter++}`,
                    text: callContext,
                    path: filePath,
                    start_line: startLine,
                    end_line: endLine,
                    type: 'function_calls'
                });
            }
        }

        // Extract file-level context for larger functions/classes
        if ((type === 'function' || type === 'class') && snippetText.split('\n').length > 10) {
            const surroundingContext = code.split('\n')
                .slice(Math.max(0, startLine - 5), endLine + 5)
                .join('\n');
            
            contexts.push({
                id: `${filePath}::${identifier}_context::${idCounter++}`,
                text: surroundingContext,
                path: filePath,
                start_line: Math.max(0, startLine - 5),
                end_line: endLine + 5,
                type: `${type}_context`
            });
        }

        contexts.push({
            id: `${filePath}::${identifier}::${idCounter++}`,
            text: snippetText,
            path: filePath,
            start_line: startLine,
            end_line: endLine,
            type: type,
            identifier: identifier
        });
    }

    contexts.push({
        id: `${filePath}::full_file`,
        text: code,
        path: filePath,
        start_line: 0,
        end_line: code.split('\n').length - 1,
        type: 'file',
        identifier: 'full_file'
    });

    return contexts;
}

export async function generateEmbedding(text) {
    const output = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}
