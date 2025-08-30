import { embedder } from './globals.js';
import crypto from 'crypto';

/**
 * Helper to find nearby comments for a given node
 */
export function findNearbyComments(node, comments, maxDistance = 2) {
    return comments.filter(comment => {
        const distance = node.startPosition.row - comment.endPosition.row;
        return distance > 0 && distance <= maxDistance;
    }).map(c => c.text).join('\n');
}

/**
 * Extract all comments from a syntax tree using the given query
 */
export function extractComments(query, tree) {
    const comments = [];
    for (const match of query.matches(tree.rootNode)) {
        if (match.captures.find(c => c.name === 'comment')) {
            comments.push(match.captures[0].node);
        }
    }
    return comments;
}

/**
 * Legacy function for the HTTP ingest endpoint
 * TODO: Update endpoint to specify parser type
 */
export async function extractCodeContext(code, filePath) {
    // Default to JavaScript parser for now
    const { createJavaScriptParser } = await import('./parsers/javascript.js');
    const parser = createJavaScriptParser();
    const tree = parser.parser.parse(code);
    const comments = extractComments(parser.query, tree);
    const captures = parser.query.captures(tree.rootNode);

    const contexts = [];
    for (const capture of captures) {
        const extracted = await extractContextFromCapture(capture, code, filePath, parser, comments);
        contexts.push(...extracted);
    }

    return contexts.map(ctx => ({
        ...ctx,
        id: crypto.randomBytes(16).toString('hex'),
        path: filePath
    }));
}

/**
 * Extract all relevant contexts from a capture node
 */
export async function extractContextFromCapture(capture, code, filePath, parser, comments) {
    const node = capture.node;
    const nameNode = node.childForFieldName('name');
    const bodyNode = node.childForFieldName('body');
    const valueNode = node.childForFieldName('value');
    
    const startLine = node.startPosition.row + 1;
    const endLine = node.endPosition.row + 1;
    const identifier = nameNode?.text || 'anonymous';
    const type = node.type.replace('_declaration', '');
    
    const nearbyComments = findNearbyComments(node, comments);
    const nodeText = (nearbyComments ? nearbyComments + '\n' : '') + code.slice(node.startIndex, node.endIndex).trim();
    
    const vector = await generateEmbedding(nodeText);
    
    let contexts = [{
        text: nodeText,
        type,
        start_line: startLine,
        end_line: endLine,
        vector
    }];
    
    // Extract additional contexts for functions and classes
    if (bodyNode && (type === 'function' || type === 'class' || type === 'method')) {
        const functionCalls = [];
        const controlFlow = [];
        const errorHandling = [];
        
        for (const match of parser.query.matches(bodyNode)) {
            // Track function calls
            const calledFunction = match.captures.find(c => c.name === 'called_function')?.node;
            if (calledFunction) {
                functionCalls.push(calledFunction.text);
            }
            
            const object = match.captures.find(c => c.name === 'object')?.node;
            const property = match.captures.find(c => c.name === 'property')?.node;
            if (object && property) {
                functionCalls.push(`${object.text}.${property.text}`);
            }
            
            // Track control flow
            const ifCondition = match.captures.find(c => c.name === 'if_condition')?.node;
            if (ifCondition) {
                controlFlow.push(`if (${ifCondition.text})`);
            }
            
            // Track error handling
            const errorParam = match.captures.find(c => c.name === 'error_param')?.node;
            if (errorParam) {
                errorHandling.push(`try/catch(${errorParam.text})`);
            }
        }
        
        if (functionCalls.length > 0) {
            const text = `Function ${identifier} calls: ${functionCalls.join(', ')}`;
            contexts.push({
                text,
                type: 'function_calls',
                start_line: startLine,
                end_line: endLine,
                vector: await generateEmbedding(text)
            });
        }
        
        if (controlFlow.length > 0) {
            const text = `Function ${identifier} control flow: ${controlFlow.join('; ')}`;
            contexts.push({
                text,
                type: 'control_flow',
                start_line: startLine,
                end_line: endLine,
                vector: await generateEmbedding(text)
            });
        }
        
        if (errorHandling.length > 0) {
            const text = `Function ${identifier} error handling: ${errorHandling.join('; ')}`;
            contexts.push({
                text,
                type: 'error_handling',
                start_line: startLine,
                end_line: endLine,
                vector: await generateEmbedding(text)
            });
        }
    }
    
    return contexts;
}

/**
 * Generate an embedding vector for the given text using the configured model
 */
export async function generateEmbedding(text) {
    const result = await embedder(text, {
        pooling: 'mean',
        normalize: true
    });
    return Array.from(result.data);
}
