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

## Test Refactoring Guidelines

When refactoring tests in this codebase, follow these critical guidelines:

### Never Change Behavior
- **DO NOT** modify the code under test when refactoring tests
- **DO NOT** change parser patterns, capture names, or expected behavior
- **DO NOT** alter test expectations to match new implementations
- Only change test structure (file organization, runner code, etc.)
- If tests are failing after refactoring, restore the original code and expectations

### Test Structure Changes Only
- Add individual test runners (`if (individual(import.meta.url))`) to enable isolated testing
- Reorganize test files and imports
- Update test file paths and references
- Modify test setup and configuration
- Change test descriptions and organization

### Debugging Failing Tests
- If tests fail after refactoring, check that the code under test is unchanged
- Verify that parser patterns and capture names match the original implementation
- Ensure test expectations align with the original behavior
- Restore original patterns and expectations if they were accidentally modified

## Parser Development

When developing or modifying Tree-sitter parsers in this project, follow these patterns. These align with the Solution Design Principles, particularly modularity (for query organization) and testability (for parser configuration and testing).

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
- Test patterns in isolation using the pattern injection feature
- Write focused test cases with minimal code examples
- Include positive test cases for all supported variations
- Use descriptive test names that match the pattern being tested
- **Prefer deep equality assertions on captured content (e.g., `captures.map(c => c.node.text)`) over simple length checks** to ensure exact matches and catch regressions
- **Replace length assertions with deep equal assertions** to show actual vs expected results when tests fail, making debugging much easier
- Verify that combined patterns still work as expected

#### Query Pattern Development
- Keep patterns simple and focused
- Use proper Tree-sitter field captures (e.g., `name:`, `body:`)
- Consider common variations of the syntax
- Document pattern assumptions and limitations
- Group related patterns that are commonly used together

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

#### Practical Examples and Findings

**Valid Syntax:**
- Node types in parentheses: `(function_declaration)`, `(string)`, `(identifier)`
- Field labels with colon: `name:`, `source:`, `value:`
- Captures with @: `@name`, `@function_name`
- Nesting for parent-child relationships
- Comments starting with `;`

**Limitations Found:**
- No negation operators (tried `!` which doesn't work)
- No direct OR operator in patterns
- No regex-style pattern matching
- No direct parent/sibling references
- `#is-not-inside?` is not a valid predicate

**Working Pattern Examples:**
- Simple capture: `(identifier) @name`
- Named field: `name: (identifier) @name`
- Parent with field: `(function_declaration name: (identifier) @name)`
- Multiple captures: `(call_expression function: (identifier) @func arguments: (string) @arg)`

**Patterns That Failed:**
- Using `!` for negation: `(variable_declarator !function_declaration)`
- Alternative syntax with `[]`: `pattern: [(array_pattern) (object_pattern)]`
- Using `#is-not-inside?` predicate
- Direct `(import)` node type
- Trying to match `'import'` identifier directly

**Current Understanding:**
- Patterns must match exact AST structure
- Need proper nesting for complex matches
- Field labels are required for named nodes
- Captures can be on any level of nesting
- Each pattern stands alone (no cross-pattern references)

## Tool Usage Guidelines

When using terminal and output retrieval tools, follow these patterns:

### Reliable Terminal Output Reading
For consistent terminal output capture, follow this workflow:

1. **Run initial command in background** to get a UUID:
   ```javascript
   run_in_terminal("your_command", isBackground=true)
   // Returns: ID=uuid-here
   ```

2. **Run additional commands in foreground** (they use the active terminal):
   ```javascript
   run_in_terminal("clear && npx mocha <test-file>", isBackground=false)
   ```

3. **Retrieve accumulated output** using the UUID:
   ```javascript
   get_terminal_output("uuid-here")
   // Returns: Complete output from all commands in the session
   ```

### Key Points
- **Background execution** creates persistent terminal with retrievable UUID
- **Foreground execution** uses currently active terminal (no new UUID)
- **Commands accumulate** in the same terminal session
- **UUID enables reliable output access** throughout the session
- **Context IDs are invalid** - only use tool-returned UUIDs
