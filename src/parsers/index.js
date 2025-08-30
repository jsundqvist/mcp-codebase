import { createJavaScriptParser, isJavaScriptFile } from './javascript.js';
import { createTypeScriptParser, isTypeScriptFile } from './typescript.js';
import { createJavaParser, isJavaFile } from './java.js';

const parsers = new Map();

function getParserForFile(filePath) {
    if (isJavaScriptFile(filePath)) {
        if (!parsers.has('javascript')) {
            parsers.set('javascript', createJavaScriptParser());
        }
        return parsers.get('javascript');
    }
    
    if (isTypeScriptFile(filePath)) {
        if (!parsers.has('typescript')) {
            parsers.set('typescript', createTypeScriptParser());
        }
        return parsers.get('typescript');
    }
    
    if (isJavaFile(filePath)) {
        if (!parsers.has('java')) {
            parsers.set('java', createJavaParser());
        }
        return parsers.get('java');
    }

    // Default to JavaScript parser for unknown file types
    if (!parsers.has('javascript')) {
        parsers.set('javascript', createJavaScriptParser());
    }
    return parsers.get('javascript');
}

export { getParserForFile };
