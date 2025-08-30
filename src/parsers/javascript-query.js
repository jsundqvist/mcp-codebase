// Individual patterns for different code constructs
export const functionPattern = `
    ; Function declarations
    (function_declaration
        name: (identifier) @name) @function
`;

export const classPattern = `
    ; Class declarations
    (class_declaration
        name: (identifier) @class_name) @class

    ; Class methods
    (method_definition
        name: (property_identifier) @method_name) @method
`;

export const variablePattern = `
    ; Variable declarations
    (variable_declarator
        name: (identifier) @var_name) @variable
`;

export const callPattern = `
    ; Function calls
    (call_expression
        function: (identifier) @function_name) @function_call

    ; Method calls
    (call_expression
        function: (member_expression
            object: (identifier) @object
            property: (property_identifier) @property)) @method_call
`;

export const errorHandlingPattern = `
    ; Error handling
    (try_statement
        body: (statement_block) @try_body
        handler: (catch_clause
            parameter: (identifier) @error_param
            body: (statement_block) @catch_body)) @error_handling
`;

export const modulePattern = `
    ; Imports
    (import_statement
        source: (string) @module_source) @import

    ; Import specifiers
    (import_specifier
        name: (identifier) @import_name) @import_spec

    ; Function exports
    (export_statement
        declaration: (function_declaration) @export_decl) @export_function

    ; Class exports
    (export_statement
        declaration: (class_declaration) @export_decl) @export_class

    ; Variable exports
    (export_statement
        declaration: [
            (lexical_declaration) @export_decl
            (variable_declaration) @export_decl
        ]) @export_var
`;

// The full query combines all patterns
export const jsQuery = [
    functionPattern,
    classPattern,
    variablePattern,
    callPattern,
    errorHandlingPattern,
    modulePattern
].join('\n');
