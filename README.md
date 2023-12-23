[![Version](https://img.shields.io/packagist/v/PaulioRandall/p69?label=version)](https://github.com/PaulioRandall/p69/releases)
[![Release date](https://img.shields.io/github/release-date/PaulioRandall/p69)](https://github.com/PaulioRandall/p69/releases)
[![Node](https://img.shields.io/node/v/PaulioRandall/p69)](https://github.com/PaulioRandall/p69/blob/trunk/package.json)
[![License](https://img.shields.io/packagist/l/PaulioRandall/p69)](https://github.com/PaulioRandall/p69/blob/trunk/LICENSE)

# P69

**P69** enables compile time tokens for CSS within Node based projects.

It scans CSS for **P69** tokens which are substituted with user defined token values. It's just an enhanced `string.replace` to be honest.

This tool is straight up optimised for my tastes which means taking the light touch. In general, the design trade-offs lean towards simplicity, readability, and changability.

See [sveltekit-minimalist-template](https://github.com/PaulioRandall/sveltekit-minimalist-template) for an example in a runnable project.

## Explore

- [Import](#import)
- [Token Maps](#token-maps)
  - [Rules for Token Maps](#rules-for-token-maps)
  - [Escaping the prefix](#escaping-the-prefix)
- [Parsing CSS Strings](#parsing-css-strings)
  - [Options](#options)
- [Parsing P69 Files](#parsing-p69-files)
  - [Options](#options-1)
  - [Example P69 File](#example-p69-file)
- [Svelte](#svelte)
  - [Options](#options-2)
  - [Example Svelte Component](#example-svelte-component)
- [Utility Functions](#utility-functions)
  - [rgbsToColors](#rgbstocolors): Converts a map of RGB and RGBA arrays to CSS RGB and RGBA values.
  - [colorSchemes](#colorschemes): Generates CSS color scheme media queries from a set of themes with CSS variables as values; goes hand-in-hand with [themeVariables](#themevariables).
  - [themeVariables](#themevariables): Generates a **set** of CSS variables from a set of themes; goes hand-in-hand with [colorSchemes](#colorschemes)
  - [sizer](#sizer): Generates a set of size functions.

## Import

```json
{
	"devDependencies": {
		"p69": "2.x.x"
	}
}
```

[^Back to menu](#explore)

### Token Maps

First create a map of your tokens in JavaScript. I recommend creating a file and exportin. Call it what you want.

There are no standards or conventions on how one should organise their token maps. Do what works, not what happens to be trending!

Here's a rough example:

```js
// tokens.js

import colors from './colors.js'

export default {
	// Used for creating string literals such as those
	// containing '$'.
	toString: (s = '') => s.toString(),

	// Don't be scared to split out parts into meaningfully
	// named files if things start to get unruly.
	color: colors,

	// Create hierarchies to meaningfully structure your CSS.
	//
	// However, if you employ a design system or design tokens
	// then you should probably derive your structure from there.
	font: {
		family: {
			helvetica: ['Helvetica', 'Arial', 'Verdana'], // $font.family.helvetica;
			verdana: ['Verdana', 'Arial', 'Helvetica'], // $font.family.verdana;
		},
		size: {
			sm: 12, // $font.size.sm;
			md: 16, // $font.size.md;
			lg: 20, // $font.size.lg;
			xl: 24, // $font.size.xl;
		},
	},
}
```

### Rules for Token Maps

**Definition:**

1. There are no standards or conventions on how one should organise their maps. Do what works, not what happens to be trending.
2. Any value type is allowed except undefined and object.
3. Functions are invoked and the result returned as the token value.
4. But a function cannot return any of the disallowed types or another function of any kind; the best way to avoid recursion errors is not to allow recursion.
5. And async functions are not allowed; fetch any external data before you start processing.
6. Nulls are resolved to empty strings, discarding any suffix.
7. It's possible to pass an array of token maps `p69([...])`. Each map is checked in turn when attempting to resolve a token.

**Usage:**

1. All tokens must be prefixed with `$`.
2. Functions can have arguments, e.g. `$func(1, 2, 3)`.
3. A function that has no arguments needs no parenthesis, e.g. `$func` == `$func()`.
4. String arguments to functions do not require quotation but single or double quotes are needed to escape some characters.
5. There is no special escape character, instead create a mapping to handle escaping (some possibilities below).

**Interesting useless side effect:** you can pass arguments to a non-function; it's pointless however since they're not used in processing.

### Escaping the prefix

There's no escape character for the `$` symbol because it's easy enough to write a token for it. Here are a few possibilities:

```js
export const escapeMethods = {
	// The simplest approach is to just to use $$, $$$, $$$$, etc.
	// Add more as you need.
	$: '$',
	$$: '$$',
	$$$: '$$$',

	// We can create a single function that handles all unbroken
	// series of $.
	//
	// $$ => $
	// $$(2) => $$
	// $$(3) => $$$
	$: (n = 1) => '$'.repeat(n),

	// literal accepts a value and returns it. This allows values
	// containing $ anywhere within to be escaped easily.
	//
	// $literal("$$$") => $$$
	// $literal("$ one $$ two $$$ three") => $ one $$ two $$$ three
	literal: (v = '') => v.toString(),

	// The world's your Mollusc. You can create any kind of
	// function to escape however you please. Here's a quotation
	// function.
	//
	// $quote('Lots of $$$') => "Lots of $$$"
	// $quote('Lots of $$$', '`') => `Lots of $$$`
	quote: (v, glyph = '"') => glyph + v.toString() + glyph,
}
```

[^Back to menu](#explore)

## Parsing CSS Strings

```js
import p69 from 'p69'

const tokens = {
	font: {
		family: {
			verdana: ['Verdana', 'Arial', 'Helvetica'],
		},
	},
}

const before = 'main { font-family: $font.family.verdana; }'
const after = p69(tokens, before)

// after: "main { font-family: Verdana, Arial, Helvetica; }"
```

### Options

```js
p69(tokens, css, {
	// P69_String_Options

	// reference is a useful identifer for when onError
	// is called. The default onError will print it out.
	// Typically a filename but any identifer you find
	// meaningful will do.
	reference: '¯\\_(ツ)_/¯',

	// errorIfMissing determines if onError should be
	// called if a style token can't be found in the
	// provided mappings. Note that this will need to
	// be false when using multiple style maps.
	errorIfMissing: true,

	// onError is called when an error occurs.
	// If the error isn't thrown then processing will
	// continue for the remaining tokens.
	// By default, logs the error and carries on.
	onError: (err, token, options) => {},
})
```

[^Back to menu](#explore)

## Parsing P69 Files

**P69** files are CSS files containing P69 tokens.

```js
import p69Files from 'p69/files'

const tokens = {
	font: {
		family: {
			verdana: ['Verdana', 'Arial', 'Helvetica'],
		},
	},
}

p69Files(tokens)
```

### Options

```js
p69Files(tokens, {
	...P69_String_Options,

	// P69_File_Options

	// root directory containing .p69 files that need
	// to be converted to CSS. If null then .p69 file
	// processing is skipped.
	root: './src',

	// output is the file path to merge all processed .p69
	// files into. This does not include style content from
	// framework files. If null, a .css file will be
	// created for each .p69 file in the same directory as it.
	//
	// There are virtues and vices to each approach but
	// amalgamation works better for smaller projects while
	// big projects usually benefit from more rigorous
	// modularisation.
	output: './src/app.css',
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

## Svelte

```js
// svelte.config.js

import p69Svelte from 'p69/svelte'
import tokens from './src/tokens.js'

export default {
  ...,
	preprocess: [
		p69Svelte(tokens)
	],
  ...,
}
```

### Options

```js
p69Svelte(tokens, {
	...P69_File_Options,

	// List of accepted lang attibute values. Undefined
	// Undefined means a style tag with no lang set will
	// be included in processing.
	mimeTypes: [undefined, 'p69', 'text/p69'],
})
```

### Example Svelte Component

```html
<!-- StyledSection.svelte -->

<section>
	<slot />
</section>

<style>
	section {
		background: $color.base;
		border-radius: 4px;
		overflow: hidden;
	}

	section :global(p) {
		font-family: $font.family.helvetica;
		font-size: $font.size.md;
		color: $color.text;
		margin-top: $space.md(em);
	}

	section :global(h1) {
		font-size: $font.size.lg;
		color: $color.strong;
	}

	@media $screen.larger_devices {
		section :global(h1) {
			font-size: $font.size.xl;
		}
	}

	section :global(strong) {
		color: $color.strong;
	}
</style>
```

[^Back to menu](#explore)

## Utility Functions

Optional utility functions to use in your token maps. Don't be limited by what I've done. Write your own if you want.

```js
import { rgbsToColors, themeVariables, colorSchemes, sizer } from 'p69/util'
```

[^Back to menu](#explore)

### rgbsToColors

Converts a map of RGB and RGBA arrays to CSS RGB and RGBA values.

**`rgbsToColors(rgbMap) cssColorMap`**

- **rgbMap**: map of token names to RGB and RGBA arrays.
- **cssColorMap**: map of token names to RGB and RGBA CSS strings.

```js
import { rgbsToColors } from 'p90/util'

const colors = rgbsToColors({
	burly_wood: [222, 184, 135],
	burly_wood_lucid: [222, 184, 135, 0.5],
	ice_cream: [250, 250, 250],
	jet_blue: [30, 85, 175],
	dark_navy_grey: [5, 10, 60],
	dark_navy_grey_lucid: [5, 10, 60, 0.5],
})

console.log(colors) // Use console.table for easy reading
/*
{
	burly_wood: "rgb(222, 184, 135)",
	burly_wood_lucid: "rgba(222, 184, 135, 0.5)",
	ice_cream: "rgb(250, 250, 250)",
	jet_blue: "rgb(30, 85, 175)",
	dark_navy_grey: "rgb(5, 10, 60)",
	dark_navy_grey_lucid: "rgba(5, 10, 60, 0.5)",
}
*/
```

[^Back to menu](#explore)

### colorSchemes

Generates CSS color scheme media queries from a set of themes; goes hand-in-hand with [themeVariables](#themeVariables).

**`themeVariables(themes, prefix) mediaQueries`**

- **themes**: map of colour schemes containing token names to CSS values (themes).
- **prefix**: string to prefix the variable name to avoid name clashes.
- **mediaQueries**: media queries as a CSS string.

```js
import { colorSchemes } from 'p90/util'

const themes = {
	// P69 doesn't care what the theme names are but browsers do!
	light: {
		base: [250, 250, 250],
		text: [5, 10, 60],
	},
	dark: {
		base: [5, 10, 35],
		text: [231, 245, 255],
	},
}

const scheme = colorSchemes(themes, 'theme-primary')
console.log(scheme)
/*
`@media (prefers-color-scheme: light) {
	:root {
		--theme-primary-base: rgb(250, 250, 250);
		--theme-primary-text: rgb(5, 10, 60);
	}
}

@media (prefers-color-scheme: dark) {
	:root {
		--theme-primary-base: rgb(5, 10, 35);
		--theme-primary-text: rgb(231, 245, 255);
	}
}`
*/
```

[^Back to menu](#explore)

### themeVariables

Generates a **set** of CSS variables from a set of themes; goes hand-in-hand with [colorSchemes](#colorschemes).

**`colorSchemes(themes, prefix) varMap`**

- **themes**: map of colour schemes containing token names to CSS values (themes).
- **prefix**: string to prefix the variable name to avoid name clashes.
- **varMap**: map of token names to CSS variable strings.

```js
import { themeVariables } from 'p90/util'

const themes = {
	// P69 doesn't care what the theme names are but browsers do!
	light: {
		base: [250, 250, 250],
		text: [5, 10, 60],
	},
	dark: {
		base: [5, 10, 35],
		text: [231, 245, 255],
		meh: [0, 0, 0],
	},
}

const theme = themeVariables(themes, 'theme-primary')
console.log(theme)
/*
{
	base: "var(--theme-primary-base)",
	text: "var(--theme-primary-text)",
	meh: "var(--theme-primary-meh)",
}
*/
```

[^Back to menu](#explore)

### sizer

Generates a set of size maps mapping a pixel value to other units.

**`sizer(tokens, base) sizeFuncMap`**

- **tokens**: map of token names to pixel amounts.
- **base**: pixels per REM. This is not necessarily the users font size, just a way to adjust EM and REM if needed (default=16)
- **sizeMap**: map of token names to a map of the token value in different size units.

Everything is in reference to 96 DPI. **sizeMap** schema:

```js
{
	token_name: {
		px,  // 1dp
		em,  // 2dp
		rem, // 2dp
		pt,  // 2dp
		pc,  // 1dp
		in,  // 3dp
		cm,  // 2dp
		mm,  // 1dp
	}
}
```

```js
import { sizer } from 'p69/util'

const tokens = {
	width: sizer(
		{
			min: 320,
			sm: 720,
			md: 920,
			lg: 1200,
			xl: 1600,
		}
		// base: 16,
	),
}

const css = `
main {
	/* width: 45rem (720px at 16px per rem) */
	width: $width.sm.rem;
}

/* min-width: 920px */
@media (min-width: $width.md.px) {
	main {
		/* max-width: 1600px */
		max-width: $width.xl.px; 
	}
}
`
```

[^Back to menu](#explore)
