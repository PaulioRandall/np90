![Made to be Plundered](https://img.shields.io/badge/Made%20to%20be%20Plundered-royalblue)
[![Latest version](https://img.shields.io/github/v/release/PaulioRandall/p69)](https://github.com/PaulioRandall/p69/releases)
[![Release date](https://img.shields.io/github/release-date/PaulioRandall/p69)](https://github.com/PaulioRandall/p69/releases)

# P69

**P69** enables use of compile time tokens within CSS for Node based projects.

It's just a glorified `string.replace`, i.e. it scans CSS for placeholder tokens which are substituted for user defined values.

Just create an object containing your tokens. You can nest as you please. There are no standards or conventions on how one should organise their tokens. Just keep it simple and do what works, not what everyone else is doing!

## For example

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
- [Token Maps](#token-maps)
  - [Rules for Token Mappings](#rules-for-token-mappings)
  - [Escaping the prefix](#escaping-the-prefix)
- [Parsing CSS Strings](#parsing-css-strings)
  - [Options](#options)
- [Parsing P69 Files](#parsing-p69-files)
  - [Options](#options-1)
  - [Example P69 File](#example-p69-file)
- [Watching P69 Files](#watching-p69-files)
  - [Options](#options-2)
- [Svelte](#svelte)
  - [Options](#options-3)
  - [Example Svelte Component](#example-svelte-component)

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

## Parsing CSS Strings

```js
import P69 from 'p69'

const tokens = {
	font: {
		family: {
			verdana: ['Verdana', 'Arial', 'Helvetica'],
		},
	},
}

const before = 'main { font-family: $font.family.verdana; }'
const after = P69.compileString(tokens, before)
// after: "main { font-family: Verdana,Arial,Helvetica; }"
```

### Options

```js
P69.compileString(tokens, cssString, {
	// onError is called when an error occurs.
	//
	// If the error isn't thrown then processing will
	// continue for the remaining tokens.
	//
	// By default, logs the error and carries on.
	onError: (err, token, options) => {},
})
```

[^Back to menu](#explore)

## Parsing P69 Files

**P69** files are CSS files containing P69 tokens.

```js
import P69 from 'p69'

const tokens = {
	theme: {
		strong: 'burlywood',
	},
	font: {
		family: {
			verdana: ['Verdana', 'Arial', 'Helvetica'],
		},
	},
}

await P69.compileFiles(tokens)
```

### Options

```js
await P69.compileFiles(tokens, {
	// Extends P69.compileString options.

	// src directory containing .p69 files that need
	// to be converted to CSS. If null then .p69 file
	// processing is skipped.
	src: './src',

	// dst is the file path to merge all processed .p69
	// files into. This does not include style content from
	// framework files. If null, a .css file will be
	// created for each .p69 file in its directory.
	//
	// There are virtues and vices to each approach but
	// amalgamation works better for smaller projects while
	// big projects usually benefit from more rigorous
	// modularisation.
	dst: './src/app.css',
})
```

### Example P69 File

```css
/* styles.p69 */

.text-strong {
	color: $theme.strong;
	font-weight: bold;
}

.text-fancy {
	font-family: $font.family.spectral;
	font-style: italic;
}
```

[^Back to menu](#explore)

## Watching P69 Files

Unfortunatly, I've had little success in getting a JavaScript token file **and its dependencies** to reload on change. I can get a single file and I can reload a whole directory, albeit a little leaky. ECMAScript modules were designed to load once and once only.

```js
import P69 from 'p69'

const tokens = {
	theme: {
		strong: 'burlywood',
	},
	font: {
		family: {
			verdana: ['Verdana', 'Arial', 'Helvetica'],
		},
	},
}

// Does not block.
// Currently uses chokidar.
const terminateWatcher = P69.watchFiles(tokens)

await terminateWatcher()
```

### Options

```js
P69.watchFiles(tokens, {
	// Extends P69.compileFiles options.

	// chokidar is passed to chokidar as options.
	// See https://github.com/paulmillr/chokidar.
	chokidar: {},
})
```

[^Back to menu](#explore)

## Svelte

```js
// svelte.config.js

import P69 from 'p69'
import tokens from './src/tokens.js'

// This first be is only needed if you're using .p69 files.
// Compiles all into ./src/app.css by default.
if (process.env.NODE_ENV === 'development') {
	P69.watchFiles(tokens)
} else {
	await P69.compileFiles(tokens)
}

export default {
	...,
	preprocess: [P69.createSvelteCompiler(tokens)],
	...,
}
```

### Options

```js
P69.createSvelteCompiler(tokens, {
	// Extends P69.watchFiles options.

	// langs is a list of accepted lang attibute values.
	// Undefined means any style tag with no lang set
	// will assumed to be P69 parsable.
	langs: [undefined, 'p69', 'text/p69'],
})
```

### Example Svelte Component

```html
<!-- StyledSection.svelte -->

<script>
	export let title
</script>

<section>
	<h2>{title}</h2>
	<slot />
</section>

<style>
	section {
		background: $color.base;
		border-radius: 4px;
		overflow: hidden;
	}

	section h2 {
		font-size: $font.size.lg.rem;
		color: $color.strong;
	}

	@media $screen.larger_devices {
		section h2 {
			font-size: $font.size.xl.rem;
		}
	}

	section :global(p) {
		font-family: $font.family.helvetica;
		font-size: $font.size.md.rem;
		color: $color.text;
		margin-top: $space.md.em;
	}

	section :global(strong) {
		color: $color.strong;
	}
</style>
```

[^Back to menu](#explore)
