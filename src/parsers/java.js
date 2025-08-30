import Parser from 'tree-sitter';
import Java from 'tree-sitter-java';

export const javaQuery = `
    ; Classes and Methods
    (class_declaration 
        name: (identifier) @name
        body: (class_body) @body) @class

    (method_declaration
        name: (identifier) @name
        body: (block) @body) @method

    (constructor_declaration
        name: (identifier) @name
        body: (block) @body) @constructor

    ; Variables and Fields
    (field_declaration
        declarator: (variable_declarator
            name: (identifier) @name
            value: (_) @value)) @field

    (local_variable_declaration
        declarator: (variable_declarator
            name: (identifier) @name
            value: (_) @value)) @variable

    ; Comments
    (line_comment) @comment
    (block_comment) @comment

    ; Method Calls
    (method_invocation
        name: (identifier) @called_method) @call

    (method_invocation
        object: (identifier) @object
        name: (identifier) @method) @method_call

    ; Error Handling
    (try_statement
        catches: (catch_clause
            parameter: (catch_formal_parameter) @error_param)) @error_handling

    ; Control Flow
    (if_statement
        condition: (_) @if_condition) @control_flow

    ; Imports
    (import_declaration
        name: (identifier) @import_name) @import

    ; Package
    (package_declaration
        name: (identifier) @package_name) @package`;

export function createJavaParser() {
    const parser = new Parser();
    parser.setLanguage(Java);
    return {
        language: 'java',
        query: new Parser.Query(Java, javaQuery),
        parser,
        getNodeName: (node) => node.childForFieldName('name')?.text || 'anonymous',
        isExportable: (node) => ['class_declaration', 'interface_declaration'].includes(node.type)
    };
}

export function isJavaFile(filePath) {
    return /\.java$/.test(filePath);
}
