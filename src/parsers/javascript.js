import Parser from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';

export const jsQuery = `
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
        declaration: (variable_declaration) @export_variable) @export_var`;

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
