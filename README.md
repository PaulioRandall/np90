![Made to be Plundered](https://img.shields.io/badge/Made%20to%20be%20Plundered-royalblue)
[![Latest version](https://img.shields.io/github/v/release/PaulioRandall/p69)](https://github.com/PaulioRandall/p69/releases)
[![Release date](https://img.shields.io/github/release-date/PaulioRandall/p69)](https://github.com/PaulioRandall/p69/releases)

# P69

**P69** enables use of compile time tokens within CSS for Node based projects.

It's just a glorified fiind and replace, i.e. it scans CSS for placeholder tokens which are substituted for user defined values.

Just create an object containing your tokens. There are no standards or conventions on how one should name and organise their tokens. Just keep it simple and do what works, not what everyone else is doing!

## Example

```js
export default {
	color: {
		normal: 'burlywood',
		highlight: 'crimson ',
	},
	font: {
		size: {
			sm: '0.8rem',
			md: '1rem',
			lg: '1.2rem',
		},
	},
	width: (size = 'md') => {
		const sizes = [
			'xs': '5rem',
			'sm': '10rem',
			'md': '15rem',
			'lg': '20rem',
			'xl': '25rem',
		]

		return sizes[md]
	},
}
```

```css
.my-class {
	color: $color.normal;
	font-weight: bold;

	font-size: $font.size.md;
	width: $width('lg');
}

.my-class:hover {
	color: &color.highlight;
}
```

**Compiles into:**

```css
.my-class {
	color: burlywood;
	font-size: 1rem;
	width: 20rem;
}

.my-class:hover {
	color: crimson;
}
```

## Explore

- [Import](#import)
- [Options](#options)
- [Token Maps](#token-maps)
  - [Rules for Token Mappings](#rules-for-token-mappings)
  - [Escaping the prefix](#escaping-the-prefix)
- [Compiling](#compiling)
  - [Multiple Mappings](#multiple-mappings)

## Import

<div>
	<a href="https://www.npmjs.com/package/p69">
		<img src="/scripts/npm.svg" width="50" height="50" />
	</a>
	<a href="https://github.com/PaulioRandall/p69">
		<picture>
		  <source media="(prefers-color-scheme: dark)" srcset="/scripts/github-dark.png" />
		  <source media="(prefers-color-scheme: light)" srcset="/scripts/github-light.png" />
		  <img alt="Github Logo" src="/scripts/github-dark.png" width="50" height="50" />
		</picture>
	</a>
</div>

```json
{
	"devDependencies": {
		"p69": "4.x.x"
	}
}
```

[^Back to menu](#explore)

## Options

```js
P69(
	mappings,
	cssWithTokens,
	options: {
		// onError is called when an error occurs.
		//
		// If the error isn't thrown then processing will
		// continue for the remaining tokens.
		//
		// By default, logs the error and carries on.
		onError: (err, token) => {},
	}
)
```

[^Back to menu](#explore)

### Rules for Token Mappings

1. All tokens must be prefixed with `$`.
2. Functions can have arguments, e.g. `$func(1, 2, 3)`.
3. A function with no arguments needs no parenthesis, e.g. `$func` == `$func()`.
4. String arguments to functions do not require quotation but single or double quotes may be used for escaping characters.
5. There is no special escape character, instead create a mapping to handle escaping.
6. Any value type is allowed as token value except undefined and object.
7. Functions are invoked and the result returned as the token value.
8. But a function cannot return undefined, object, or another function (because recursion is unnecessary and would just cause problems).
9. Async functions are not allowed either; fetch any external data before you start processing.
10. Nulls are resolved to empty strings, discarding any suffix.

**Harmless bug:** you can pass arguments to a non-function but they're ignored. I may fix this in future.

### Escaping the prefix

There's no escape character for the `$` symbol, but it's easy to write your own. A few possibilities:

```js
export const escapeMethods = {
	// Simplest approach is to use $$, $$$, $$$$, etc.
	// Add more as you need.
	$: '$',
	$$: '$$',
	$$$: '$$$',

	// We can create a single function that handles an unbroken
	// series of $.
	//
	// $$ => $
	// $$(2) => $$
	// $$(3) => $$$
	$: (n = 1) => '$'.repeat(n),

	// Create a 'literal' function that returns its first argument.
	//
	// $literal("$$$") => $$$
	// $literal("$ one $$ two $$$ three") => $ one $$ two $$$ three
	literal: (v = '') => v.toString(),

	// The world's your Mollusc. Here's a quotation function.
	//
	// $quote('Lots of $$$') => "Lots of $$$"
	// $quote('Lots of $$$', '`') => `Lots of $$$`
	quote: (v, glyph = '"') => glyph + v.toString() + glyph,
}
```

[^Back to menu](#explore)

## Compiling

```js
import P69 from 'p69'

const mappings = {
	font: {
		family: {
			verdana: ['Verdana', 'Arial', 'Helvetica'],
		},
	},
	colors: {
		primary: '#3333FF',
		secondary: '#FF3333',
	},
}

const cssWithTokens = `main {
	font-family: $font.family.verdana;
	color: $colors.primary;
}`

const css = P69(mappings, cssWithTokens)

console.log(css)
// main {
//   font-family: Verdana,Arial,Helvetica;
//   color: #3333FF;
// }
```

### Multiple Mappings

```js
import P69 from 'p69'

const fonts = {
	font: {
		family: {
			verdana: ['Verdana', 'Arial', 'Helvetica'],
			Arial: ['Arial', 'Verdana', 'Helvetica'],
		},
	},
}

const colors = {
	colors: {
		primary: '#3333FF',
		secondary: '#FF3333',
	},
}

const cssWithTokens = `main {
	font-family: $font.family.verdana;
	color: $colors.primary;
}`

// Each map is checked for the value in array order.
const css = P69([fonts, colors], cssWithTokens)

console.log(css)
// main {
//   font-family: Verdana,Arial,Helvetica;
//   color: #3333FF;
// }
```

[^Back to menu](#explore)
