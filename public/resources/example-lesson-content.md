# Example Markdown Lesson Content

This document shows you how to format lesson content for **reading** type courses.

## Text Formatting

You can use **bold text** and *italic text* or even `inline code`.

## Code Blocks

Here are simple examples to demonstrate the use of `rowspan` and `colspan` in HTML tables.

### Example for Colspan:

```html
<table border="1">
  <tr>
    <td colspan="2">Merged Columns</td>
  </tr>
  <tr>
    <td>Column 1</td>
    <td>Column 2</td>
  </tr>
</table>
```

### Example for Rowspan:

```html
<table border="1">
  <tr>
    <td>Row 1, Column 1</td>
    <td rowspan="2">Merged Rows</td>
  </tr>
  <tr>
    <td>Row 2, Column 1</td>
  </tr>
</table>
```

## JavaScript Example

```javascript
// Function to create a greeting
function greet(name) {
  return `Hello, ${name}!`;
}

// Using the function
const message = greet('World');
console.log(message); // Output: Hello, World!
```

## CSS Example

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card {
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

## Python Example

```python
# Define a class
class Calculator:
    def __init__(self):
        self.result = 0
    
    def add(self, x, y):
        return x + y
    
    def multiply(self, x, y):
        return x * y

# Usage
calc = Calculator()
print(calc.add(5, 3))      # Output: 8
print(calc.multiply(4, 2)) # Output: 8
```

## Lists

- Item 1
- Item 2
- Item 3

1. First step
2. Second step
3. Third step

## Blockquotes

> This is a blockquote. It can be used to highlight important information or quotes from other sources.

## Links

Visit [MDN Web Docs](https://developer.mozilla.org) for more HTML documentation.

---

## Summary

With reading courses, you can:
- Write content in Markdown format
- Include syntax-highlighted code blocks
- Use various formatting options
- Create comprehensive documentation-style lessons
