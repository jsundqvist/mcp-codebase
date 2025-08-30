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
    ; Static imports
    (import_statement
        source: (string) @module_source) @static_import
    (import_specifier
        name: (identifier) @import_name)

    ; Dynamic imports - match the import() calls
    (await_expression
        (call_expression
            function: (identifier) @import_function
            arguments: (arguments
                (string) @dynamic_source))) @dynamic_import

    ; Top-level await - only in variable declarations
    (variable_declarator
        value: (await_expression)) @top_level_await

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

    ; Re-exports
    (export_statement
        source: (string) @re_export_source) @re_export
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
    ; Public class fields
    (field_definition
        (property_identifier) @field_name) @field

    ; Private identifiers in different contexts
    (private_property_identifier) @private_name

    ; Static fields
    (field_definition
        "static"
        . (private_property_identifier)) @static_field

    ; Static methods
    (method_definition
        "static"
        . (private_property_identifier)) @static_method

    ; Private accessors
    (method_definition
        "get"
        . (private_property_identifier)) @getter_method

    (method_definition
        "set"
        . (private_property_identifier)) @setter_method
`;

export const operatorPattern = `
    ; Basic member access and binary expressions
    (member_expression) @member
    (binary_expression) @binary
`;

export const logicalAssignmentPattern = `
    ; Logical assignment operators
    (augmented_assignment_expression
        operator: [
            "??="  ; Nullish coalescing assignment
            "&&="  ; Logical AND assignment
            "||="  ; Logical OR assignment
        ] @logical_operator) @logical_assignment
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
    optionalPattern,
    logicalAssignmentPattern
].join('\n');
