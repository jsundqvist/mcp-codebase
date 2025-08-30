# Copilot Instructions

This document provides instructions for AI coding agents to effectively contribute to this codebase.

## Meta: Updating These Instructions

When updating these instructions:

- Focus on principles and patterns, not specific implementations
- Do not include code examples - refer to actual files in the codebase instead
- Add new patterns only after they've proven useful in practice
- Remove patterns that are no longer followed in the codebase
- Keep sections focused and concise
- When referring to files or code, use relative paths from the project root

## Solution Design Principles

When proposing solutions in this codebase, follow these principles:

### Keep It Simple
- Start with the simplest solution that solves the core problem
- Avoid premature abstraction and over-engineering
- Add complexity only when there's a clear, immediate need
- Focus on solving the current problem, not potential future needs (YAGNI)

### Testability
- Make code testable without complex setup or configuration
- If something needs to be configurable for testing, keep the configuration minimal
- Prefer simple parameterization over complex configuration objects
- Make test-specific features obvious and focused

### Modularity
- Break down complex features into smaller, focused pieces
- Make dependencies explicit and minimal
- Keep related code together
- Allow pieces to be tested in isolation when needed

## Parser Development

When developing or modifying Tree-sitter parsers in this project, follow these patterns:

#### Query Organization
- Break down large query patterns into separate, exported variables
- Export each pattern group (e.g., functionPattern, classPattern) individually
- Group related patterns together (e.g., class declarations with class methods)
- Add descriptive comments above each pattern group
- Use clear and consistent capture names (e.g., `@name`, `@class_name`, `@method_name`)
- Combine patterns into a single query using simple concatenation

#### Parser Configuration
- Keep parser configuration minimal and focused on essential needs
- Support testing individual patterns by allowing pattern injection

#### Testing Parser Changes
1. Test patterns in isolation using the pattern injection feature
2. Write focused test cases with minimal code examples
3. Include positive test cases for all supported variations
4. Use descriptive test names that match the pattern being tested
5. Verify that combined patterns still work as expected

#### Query Pattern Development
1. Keep patterns simple and focused
2. Use proper Tree-sitter field captures (e.g., `name:`, `body:`)
3. Consider common variations of the syntax
4. Document pattern assumptions and limitations
5. Group related patterns that are commonly used together

#### Tree-sitter Query Syntax Guidelines

##### Pattern Structure
- Start with the most specific patterns first
- Use explicit node types when possible (e.g., `method_definition`, `private_property_identifier`)
- Pattern matching is exact - whitespace and structure must match precisely
- Capture names use `@` prefix (e.g., `@name`, `@method_name`)

##### Field Captures
- Use `.` for field ordering when structure matters (e.g., `"static" . (private_property_identifier)`)
- Field names can be used to specify properties (e.g., `property:`, `operator:`)
- Multiple captures can reference the same node
- Parent nodes can be captured alongside their children

##### Supported Features
- String literals in quotes (e.g., `"static"`, `"get"`)
- Multiple alternatives in square brackets (e.g., `["get" "set"]`)
- Repeated patterns with quantifiers (`*`, `+`, `?`)
- Parent/child relationships with nesting
- Field captures with explicit names

##### Unsupported Features
- No direct negation patterns (no `!pattern` or `NOT`)
- No logical operators (AND, OR) in patterns
- No back-references or forward-references
- No regex-style pattern matching
- No direct parent/sibling references

##### Working with Limitations
- Order patterns from most specific to least specific
- Use separate captures instead of negations
- Split complex patterns into multiple simpler ones
- Use parent nodes to provide context
- Rely on post-processing for complex filtering

##### Testing Patterns
- Test with minimal, focused examples
- Include all variations you want to support
- Verify capture names and node types
- Check for unintended captures
- Use exact text matching in assertions
