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

export const arrowFunctionPattern = `
    ; Arrow Functions
    (arrow_function 
        parameters: (formal_parameters 
            (identifier) @param_name)? 
        body: (_)) @arrow_function
`;

export const objectPattern = `
    ; Object properties and methods
    (pair
        key: (property_identifier) @prop_name) @object_prop

    (method_definition
        name: (property_identifier) @method_name) @object_method
`;

export const destructurePattern = `
    ; Destructuring patterns
    (object_pattern) @obj_destruct
    (array_pattern) @array_destruct
`;

export const asyncPattern = `
    ; Async/Await patterns
    (function_declaration
        ["async"] @async_keyword
        name: (identifier) @async_name) @async_function

    (await_expression) @await_expr
`;

export const templatePattern = `
    ; Template literals
    (template_string) @template
    (template_substitution
        (identifier) @template_var) @template_expr
`;

export const spreadPattern = `
    ; Rest/Spread operators
    (rest_pattern
        (identifier) @rest_param) @rest

    (spread_element
        (identifier) @spread_var) @spread
`;

export const classFieldPattern = `
    ; Class fields and private members
    (field_definition
        (property_identifier) @field_name) @field

    (method_definition
        (private_property_identifier) @private_method) @private
`;

export const operatorPattern = `
    ; Basic member access and binary expressions
    (member_expression) @member
    (binary_expression) @binary
`;

export const optionalPattern = `
    ; Optional chaining and nullish coalescing
    (optional_chain) @optional_chain
    (binary_expression 
        operator: "??") @nullish_coalesce
`;

// The full query combines all patterns
export const jsQuery = [
    functionPattern,
    classPattern,
    variablePattern,
    callPattern,
    errorHandlingPattern,
    modulePattern,
    arrowFunctionPattern,
    objectPattern,
    destructurePattern,
    asyncPattern,
    templatePattern,
    spreadPattern,
    classFieldPattern,
    operatorPattern,
    optionalPattern
].join('\n');
