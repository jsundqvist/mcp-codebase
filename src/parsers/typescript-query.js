export const tsQuery = `
    ; Interface Declarations
    (interface_declaration
        name: (type_identifier) @name
        body: (object_type) @interface_body) @interface

    ; Type Alias Declarations
    (type_alias_declaration
        name: (type_identifier) @name
        value: (_) @type_value) @type_alias

    ; Generic Types
    (generic_type
        name: (type_identifier) @generic_name
        type_arguments: (type_arguments) @generic_args) @generic

    ; TypeScript-specific Exports
    (export_statement
        declaration: (interface_declaration) @export_interface) @interface_export

    (export_statement
        declaration: (type_alias_declaration) @export_type) @type_export

    ; Comments and Documentation
    (comment) @comment
`;
