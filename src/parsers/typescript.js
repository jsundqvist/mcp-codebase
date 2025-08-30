import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';
import { jsQuery } from './javascript.js';

// TypeScript-specific query that extends JavaScript query
const tsExtensions = `
    ; Class Implementation
    (implements_clause
        value: (type_reference
            name: (type_identifier) @interface_name)) @implements

    ; TypeScript-specific declarations
    (type_alias_declaration
        name: (type_identifier) @name
        type_parameters: (type_parameter_declaration)? @type_params
        value: (
            (union_type
                ((string | number | true | false | null | undefined)+ @literal_values |
                 (type_identifier)* @type_values |
                 (template_type)* @template_values)
            ) @union_type |
            (intersection_type
                (type_identifier | generic_type)+ @intersection_members
            ) @intersection_type |
            (conditional_type
                check_type: ((type_identifier | generic_type) @condition_check)
                extends_type: ((type_identifier | generic_type) @condition_extends)
                true_type: ((type_identifier | generic_type | union_type) @condition_true)
                false_type: ((type_identifier | generic_type | union_type) @condition_false)
            ) @conditional_type |
            (mapped_type
                readonly: "readonly"? @mapped_readonly
                parameter: (type_parameter
                    name: (type_identifier) @mapped_param
                    constraint: (type_constraint
                        (union_type | type_identifier | generic_type) @mapped_constraint)?)
                optional: "?"? @mapped_optional
                type: (type_identifier | generic_type) @mapped_type
                value: (
                    (union_type
                        ((type_identifier | generic_type)+ @mapped_union_types |
                         (literal_type)* @mapped_union_literals)) |
                    (type_identifier) |
                    (generic_type
                        name: (type_identifier)
                        type_arguments: (type_arguments)*) |
                    (object_type
                        (property_signature |
                         index_signature)*)) @mapped_value) |
            (object_type
                (property_signature |
                 index_signature)+ @object_members)
        ) @type

    (interface_declaration
        name: (type_identifier) @name
        type_parameters: (type_parameter_declaration
            (type_parameter
                name: (type_identifier) @type_param_name
                constraint: (type_constraint
                    (type_identifier | generic_type | object_type) @type_param_constraint)?)*)? @type_params
        extends: (extends_clause
            (type_reference
                name: (type_identifier) @extends_name
                type_arguments: (type_arguments
                    (type_identifier | generic_type | union_type)* @extends_args)?)*)? @extends
        body: (object_type 
            ((property_signature 
                readonly: "readonly"? @prop_readonly
                name: (property_identifier) @prop_name
                optional: "?"? @optional
                type: (type_annotation (
                    (type_identifier) @prop_type |
                    (union_type (
                        (type_identifier | generic_type | literal_type |
                         template_type)* @union_members) @union_type |
                    (intersection_type
                        (type_identifier | generic_type)+ @intersection_members) @intersection_type |
                    (generic_type
                        name: (type_identifier) @generic_name
                        type_arguments: (type_arguments
                            (type_identifier |
                             union_type |
                             generic_type |
                             literal_type |
                             template_type)* @generic_arg_types)?) @generic_type |
                    (array_type
                        element: (
                            (type_identifier) |
                            (union_type) |
                            (generic_type) |
                            (template_type)
                        ) @array_element_type) @array_type |
                    (tuple_type
                        (type_identifier |
                         union_type |
                         generic_type |
                         template_type |
                         rest_type)* @tuple_types) @tuple |
                    (template_type
                        head: (template_literal) @template_head
                        spans: (template_literal_type
                            type: (type_identifier | union_type) @template_span_type)* @template_spans) @template
                    ))) |
             (index_signature
                key: (property_signature
                    name: (property_identifier) @index_key_name
                    type: (type_annotation
                        (type_identifier) @index_key_type)) @index_key
                type: (type_annotation
                    (type_identifier | union_type | generic_type) @index_value_type)) |
             (call_signature
                type_parameters: (type_parameter_declaration)? @call_type_params
                parameters: (formal_parameters)? @call_params
                type: (type_annotation)? @call_return_type) |
             (construct_signature
                type_parameters: (type_parameter_declaration)? @construct_type_params
                parameters: (formal_parameters)? @construct_params
                type: (type_annotation)? @construct_return_type))*) @interface

    ; Type Annotations with Complex Types
    (property_signature
        name: (property_identifier) @prop_name
        type: (type_annotation 
            (generic_type
                name: (type_identifier) @generic_type_name
                type_arguments: (type_arguments 
                    (union_type
                        (type_identifier) @union_member_type
                        (literal_type)? @literal_type)?)))) @property

    ; Method Signatures with Return Types
    (method_signature
        name: (property_identifier) @method_name
        type_parameters: (type_parameter_declaration
            (type_parameter
                name: (type_identifier) @method_type_param
                constraint: (type_constraint
                    (type_identifier | generic_type | object_type) @type_constraint)?)*)? @method_type_params
        parameters: (formal_parameters
            ((required_parameter |
              optional_parameter |
              rest_parameter)
                readonly: "readonly"? @param_readonly
                name: (identifier) @param_name
                optional: "?"? @param_optional
                type: (type_annotation (
                    (type_identifier) @param_type |
                    (generic_type
                        name: (type_identifier) @param_generic_name
                        type_arguments: (type_arguments
                            (type_identifier |
                             union_type |
                             generic_type |
                             template_type |
                             literal_type)* @param_generic_args)) @param_generic_type |
                    (union_type
                        (type_identifier |
                         generic_type |
                         template_type |
                         literal_type)* @param_union_types) @param_union |
                    (intersection_type
                        (type_identifier |
                         generic_type)+ @param_intersection_types) @param_intersection))*)
            default: (expression)? @param_default) @parameters
        return_type: (type_annotation (
            (type_identifier) @return_type |
            (generic_type
                name: (type_identifier) @return_type_name
                type_arguments: (type_arguments
                    (type_identifier |
                     literal_type |
                     template_type |
                     (union_type
                        (type_identifier |
                         literal_type |
                         generic_type |
                         template_type)* @union_members) @union_type |
                     (intersection_type
                        (type_identifier |
                         generic_type)+ @intersection_members) @intersection_type |
                     (generic_type
                        name: (type_identifier) @inner_type_name
                        type_arguments: (type_arguments
                            (type_identifier |
                             union_type |
                             generic_type |
                             template_type |
                             literal_type)* @inner_args)?)* @inner_generics)* @return_args)) @return_type |
            (union_type
                (type_identifier |
                 generic_type |
                 template_type |
                 literal_type)* @return_union_types) @return_union |
            (intersection_type
                (type_identifier |
                 generic_type)+ @return_intersection_types) @return_intersection)?) @method

    ; Advanced Utility Types
    (generic_type
        name: ((type_identifier) @utility_type (#match? @utility_type "^(Partial|Readonly|Pick|Record|Exclude|Extract|NonNullable|Parameters|ConstructorParameters|ReturnType|InstanceType|Required|ThisParameterType|OmitThisParameter|ThisType|Uppercase|Lowercase|Capitalize|Uncapitalize)$"))
        type_arguments: (type_arguments
            ((type_identifier | generic_type) @utility_target_type |
             (union_type) @utility_union_type |
             (literal_type) @utility_key_type |
             (template_type) @utility_template_type)*)) @utility

    ; Generic Types with Complex Arguments
    (generic_type
        name: (type_identifier) @generic_name
        type_arguments: (type_arguments
            (union_type
                (type_identifier)+ @union_member_type
                (literal_type 
                    (string) @literal_value)*)
            (type_reference)* @type_ref)) @generic

    ; Utility Types (like Omit<T, K>)
    (generic_type
        name: (type_identifier) @utility_type
        type_arguments: (type_arguments
            (type_identifier) @target_type
            (string) @omitted_prop)) @utility

    ; Type Parameters (for generics) with constraints
    (type_parameter_declaration
        (type_parameter
            name: (type_identifier) @type_param_name
            constraint: (type_constraint 
                (object_type
                    (property_signature
                        name: (property_identifier) @constraint_prop_name
                        type: (type_annotation (\n                            (type_identifier) @constraint_prop_type |\n                            (string_type) |\n                            (number_type) |\n                            (boolean_type) |\n                            (array_type) |\n                            (generic_type) |\n                            (literal_type) |\n                            (object_type\n                                (property_signature)*) @nested_constraint_object\n                        )))*)? @constraint_object
                (type_identifier)? @constraint_type
                (generic_type)? @constraint_generic)) @type_param) @type_params

    ; TypeScript-specific exports
    (export_statement 
        declaration: (interface_declaration) @export_interface) @export_interface

    (export_statement 
        declaration: (type_alias_declaration) @export_type) @export_type`;

// Combine JavaScript and TypeScript queries, ensuring proper spacing
export const tsQuery = jsQuery.trimEnd() + '\n\n' + tsExtensions;

export function createTypeScriptParser() {
    const parser = new Parser();
    parser.setLanguage(TypeScript.typescript);
    return {
        language: 'typescript',
        query: new Parser.Query(TypeScript.typescript, tsQuery),
        parser,
        getNodeName: (node) => {
            // Handle both JavaScript identifiers and TypeScript type_identifiers
            const nameNode = node.childForFieldName('name');
            return nameNode?.text || 'anonymous';
        },
        isExportable: (node) => [
            // Include JavaScript exportable types
            'function_declaration',
            'class_declaration',
            'variable_declaration',
            // Add TypeScript-specific types
            'interface_declaration',
            'type_alias_declaration'
        ].includes(node.type)
    };
}

export function isTypeScriptFile(filePath) {
    return /\.(ts|tsx)$/.test(filePath);
}
