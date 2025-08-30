import { embedder } from './globals.js';
import { getParserForFile } from './parsers/index.js';

export async function extractCodeContext(code, filePath = 'untitled.js') {
    const languageParser = getParserForFile(filePath);
    const tree = languageParser.parser.parse(code);
    const contexts = [];
    let idCounter = 0;
    const query = languageParser.query;

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
            snippetText = nearbyComments + '\n' + node.text;
            type = nameNode.parent.type.replace('_declaration', '');
            startLine = node.startPosition.row;
            endLine = node.endPosition.row;
            identifier = languageParser.getNodeName(node);
        } else if (nameNode && valueNode) {
            snippetText = nearbyComments + '\n' + node.text;
            type = 'variable';
            startLine = node.startPosition.row;
            endLine = node.endPosition.row;
            identifier = languageParser.getNodeName(node);
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
                if (parent.type.includes('function') || 
                    parent.type.includes('class') ||
                    parent.type.includes('method')) {
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
                contexts.push({
                    id: `${filePath}::${identifier}_calls::${idCounter++}`,
                    text: `Function ${identifier} calls: ${Array.from(functionCalls).join(', ')}`,
                    path: filePath,
                    start_line: startLine,
                    end_line: endLine,
                    type: 'function_calls'
                });
            }

            // Add control flow context
            if (controlFlow.size > 0) {
                contexts.push({
                    id: `${filePath}::${identifier}_flow::${idCounter++}`,
                    text: `Function ${identifier} control flow: ${Array.from(controlFlow).join('; ')}`,
                    path: filePath,
                    start_line: startLine,
                    end_line: endLine,
                    type: 'control_flow'
                });
            }

            // Add error handling context
            if (errorHandling.size > 0) {
                contexts.push({
                    id: `${filePath}::${identifier}_errors::${idCounter++}`,
                    text: `Function ${identifier} error handling: ${Array.from(errorHandling).join('; ')}`,
                    path: filePath,
                    start_line: startLine,
                    end_line: endLine,
                    type: 'error_handling'
                });
            }

            // Add hierarchical context
            if (parent) {
                const parentName = languageParser.getNodeName(parent);
                contexts.push({
                    id: `${filePath}::${identifier}_hierarchy::${idCounter++}`,
                    text: `${type} ${identifier} is defined in ${parent.type.replace('_', ' ')} ${parentName}`,
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
                for (const capture of match.captures) {
                    if (capture.name.startsWith('export_') && languageParser.isExportable(capture.node)) {
                        const exportName = languageParser.getNodeName(capture.node);
                        if (exportName) {
                            exports.add(`exports ${capture.node.type.split('_')[0]} ${exportName}`);
                        }
                    }
                }
            }

            // Add import context
            if (imports.size > 0) {
                contexts.push({
                    id: `${filePath}::imports::${idCounter++}`,
                    text: `Module ${filePath} imports: ${Array.from(imports).join(', ')}`,
                    path: filePath,
                    start_line: 0,
                    end_line: 0,
                    type: 'imports'
                });
            }

            // Add export context
            if (exports.size > 0) {
                contexts.push({
                    id: `${filePath}::exports::${idCounter++}`,
                    text: `Module ${filePath} ${Array.from(exports).join(', ')}`,
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
