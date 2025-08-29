// src/utils.js
import { parser, embedder } from './globals.js';
import Parser from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';

export async function extractCodeContext(code, filePath = 'untitled.js') {
    const tree = parser.parse(code);
    const contexts = [];
    let idCounter = 0;

    const query = new Parser.Query(JavaScript, `
        ; Functions and Classes
        (function_declaration 
            name: (identifier) @name
            body: (statement_block) @body) @function

        (class_declaration 
            name: (identifier) @name
            body: (class_body) @body) @class

        (method_definition
            name: (property_identifier) @name) @method

        ; Variables
        (variable_declarator
            name: (identifier) @name
            value: (_) @value) @variable

        ; Comments
        (comment) @comment

        ; Function Calls
        (call_expression
            function: (identifier) @called_function) @call

        (call_expression
            function: (member_expression 
                object: (identifier) @object
                property: (property_identifier) @property)) @method_call

        ; Error Handling
        (try_statement
            handler: (catch_clause 
                parameter: (identifier) @error_param)) @error_handling

        ; Control Flow
        (if_statement
            condition: (_) @if_condition) @control_flow

        ; Imports and Exports
        (import_statement
            source: (string) @import_source) @import

        (named_imports
            (import_specifier
                name: (identifier) @import_name))

        (import_clause
            (identifier) @default_import)

        (export_statement 
            declaration: (function_declaration) @export_function) @export_func

        (export_statement 
            declaration: (class_declaration) @export_class) @export_class

        (export_statement 
            declaration: (variable_declaration) @export_variable) @export_var
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
        // Track parent-child relationships and build a context tree
        const contextTree = new Map();
        const rootNode = tree.rootNode;
        
        function findParentContext(node) {
            let parent = node.parent;
            while (parent) {
                if (parent.type === 'function_declaration' || 
                    parent.type === 'class_declaration' ||
                    parent.type === 'method_definition') {
                    return parent;
                }
                parent = parent.parent;
            }
            return null;
        }

        if (type === 'function' || type === 'class' || type === 'method') {
            const functionCalls = new Set();
            const controlFlow = new Set();
            const errorHandling = new Set();
            const parent = findParentContext(node);

            // Get all relevant patterns in the body
            for (const match of query.matches(bodyNode)) {
                // Track function calls
                if (match.captures.find(c => c.name === 'called_function')) {
                    const calledFunction = match.captures.find(c => c.name === 'called_function').node.text;
                    functionCalls.add(calledFunction);
                }
                
                const object = match.captures.find(c => c.name === 'object')?.node?.text;
                const property = match.captures.find(c => c.name === 'property')?.node?.text;
                if (object && property) {
                    functionCalls.add(`${object}.${property}`);
                }

                // Track control flow
                const ifCondition = match.captures.find(c => c.name === 'if_condition')?.node;
                if (ifCondition) {
                    controlFlow.add(`if (${ifCondition.text})`);
                }

                // Track error handling
                const errorParam = match.captures.find(c => c.name === 'error_param')?.node;
                if (errorParam) {
                    errorHandling.add(`try/catch(${errorParam.text})`);
                }
            }

            // Add function call context
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

            // Add control flow context
            if (controlFlow.size > 0) {
                const flowContext = `Function ${identifier} control flow: ${Array.from(controlFlow).join('; ')}`;
                contexts.push({
                    id: `${filePath}::${identifier}_flow::${idCounter++}`,
                    text: flowContext,
                    path: filePath,
                    start_line: startLine,
                    end_line: endLine,
                    type: 'control_flow'
                });
            }

            // Add error handling context
            if (errorHandling.size > 0) {
                const errorContext = `Function ${identifier} error handling: ${Array.from(errorHandling).join('; ')}`;
                contexts.push({
                    id: `${filePath}::${identifier}_errors::${idCounter++}`,
                    text: errorContext,
                    path: filePath,
                    start_line: startLine,
                    end_line: endLine,
                    type: 'error_handling'
                });
            }

            // Add hierarchical context
            if (parent) {
                const parentName = parent.childForFieldName('name')?.text || 'anonymous';
                const hierarchyContext = `${type} ${identifier} is defined in ${parent.type.replace('_', ' ')} ${parentName}`;
                contexts.push({
                    id: `${filePath}::${identifier}_hierarchy::${idCounter++}`,
                    text: hierarchyContext,
                    path: filePath,
                    start_line: startLine,
                    end_line: endLine,
                    type: 'hierarchy'
                });
            }

            // Track imports and exports
            const imports = new Set();
            const exports = new Set();

            for (const match of query.matches(rootNode)) {
                // Track imports
                const importSource = match.captures.find(c => c.name === 'import_source')?.node;
                const importName = match.captures.find(c => c.name === 'import_name')?.node;
                const defaultImport = match.captures.find(c => c.name === 'default_import')?.node;
                
                if (importSource) {
                    const source = importSource.text.slice(1, -1); // Remove quotes
                    if (defaultImport) {
                        imports.add(`default ${defaultImport.text} from ${source}`);
                    }
                    if (importName) {
                        imports.add(`${importName.text} from ${source}`);
                    }
                }

                // Track exports
                const exportFunction = match.captures.find(c => c.name === 'export_function')?.node;
                const exportClass = match.captures.find(c => c.name === 'export_class')?.node;
                const exportVariable = match.captures.find(c => c.name === 'export_variable')?.node;

                if (exportFunction || exportClass || exportVariable) {
                    const exportNode = exportFunction || exportClass || exportVariable;
                    const exportName = exportNode.childForFieldName('name')?.text;
                    if (exportName) {
                        exports.add(`exports ${exportNode.type.split('_')[0]} ${exportName}`);
                    }
                }
            }

            // Add import context
            if (imports.size > 0) {
                const importContext = `Module ${filePath} imports: ${Array.from(imports).join(', ')}`;
                contexts.push({
                    id: `${filePath}::imports::${idCounter++}`,
                    text: importContext,
                    path: filePath,
                    start_line: 0,
                    end_line: 0,
                    type: 'imports'
                });
            }

            // Add export context
            if (exports.size > 0) {
                const exportContext = `Module ${filePath} ${Array.from(exports).join(', ')}`;
                contexts.push({
                    id: `${filePath}::exports::${idCounter++}`,
                    text: exportContext,
                    path: filePath,
                    start_line: 0,
                    end_line: 0,
                    type: 'exports'
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
