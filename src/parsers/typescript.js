import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';

export const tsQuery = `
    ; Functions and Classes
    (function_declaration 
        name: (identifier) @name
        body: (statement_block) @body) @function

    (class_declaration 
        name: (type_identifier) @name
        body: (class_body) @body) @class

    (method_definition
        name: (property_identifier) @name) @method

    ; Variables and Types
    (variable_declarator
        name: (identifier) @name
        value: (_) @value) @variable

    (type_alias_declaration
        name: (type_identifier) @name) @type

    (interface_declaration
        name: (type_identifier) @name) @interface

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

    (export_statement 
        declaration: (interface_declaration) @export_interface) @export_interface

    (export_statement 
        declaration: (type_alias_declaration) @export_type) @export_type`;

export function createTypeScriptParser() {
    const parser = new Parser();
    parser.setLanguage(TypeScript.typescript);
    return {
        language: 'typescript',
        query: new Parser.Query(TypeScript.typescript, tsQuery),
        parser,
        getNodeName: (node) => {
            const nameNode = node.childForFieldName('name');
            return nameNode?.text || 'anonymous';
        },
        isExportable: (node) => [
            'function_declaration',
            'class_declaration',
            'variable_declaration',
            'interface_declaration',
            'type_alias_declaration'
        ].includes(node.type)
    };
}

export function isTypeScriptFile(filePath) {
    return /\.(ts|tsx)$/.test(filePath);
}
