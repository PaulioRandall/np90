# P69

**P69** provides a means for adding compile time variables to CSS within Node based projects.

**P69** scans CSS files for **P69** tokens which are substituted with user defined token values. It's really just an enhanced `string.replace`.

This tool is straight up optimised for my tastes. This means taking the light touch. In general, the design trade-offs lean towards simplicity, flexibility, and changability more than writability.

See [sveltekit-minimalist-template](https://github.com/PaulioRandall/sveltekit-minimalist-template) for an example in a runnable project.

## Import

```json
{
	"devDependencies": {
		"p69": "2.0.0"
	}
}
```

### `tokens.js`

First you'll need to create a map of your tokens in JavaScript. I recommend creating a file and exporting. Nowdays I call the file `tokens.js` but call it whatever you want.

There are no standards or conventions on how one should organise their maps. Do what works, not what happens to be trending. Personally, I try to keep it simple, readable, and changable to best support lean means such as CI/CD.

```js
// tokens.js

import colors from './colors.js'

export default {
	token_name: 'token value',

	// Used for creating string literals containg $
	toString: (s = '') => s.toString(),

	// Don't be scared to split out parts into meaningfully named files if things
	// start to get unruly.
	color: colors,

	// Create hierarchies to meaningfully structure your CSS tokens so your
	// resultant P69 enhanced CSS is easy to comprehend. If you employ a design
	// system or design tokens then you should probably derive your structure
	// from there.
	//
	// I aim for a structure where people reading my tokens within CSS can
	// understand what my tokens mean. They will then look here if they need
	// to know the what the actual values are or how they are generated.
	//
	// Sounds obvious but it's still very common for people to code based on
	// ideological theories with no concern for real world effectiveness or
	// fitness for purpose.
	font: {
		family: {
			helvetica: ['Helvetica', 'Arial', 'Verdana'],
			verdana: ['Verdana', 'Arial', 'Helvetica'],
		},
		size: {
			sm: 12,
			md: 16,
			lg: 20,
			xl: 24,
		},
	},
}
```

**Rules for token maps:**

1. There are no standards or conventions on how one should organise their maps. Do what works, not what hapens to be trending.
2. Any value type is allowed except undefined or object.
3. Functions are invoked and the result returned as the token value.
4. But a function cannot return any of the disallowed types or another function of any kind; recursion is not allowed because it's just not needed.
5. And async functions are not allowed; fetch any external data before you start processing.
6. Nulls are resolved to empty strings, discarding any suffix.
7. It's possible to pass an array of token maps `p69([...])`. Each map is checked in turn when attempting to resolve a token.

**Rules for token usage:**

1. All tokens must be prefixed with `$`.
2. Functions can have arguments, e.g. `$func(1, 2, 3)`.
3. A function that has no arguments needs no parenthesis, e.g. `$func` == `$func()`.
4. String arguments to functions do not require quotation but single or double quotes will be needed to escape some characters.
5. There is no special escape character, instead create a mapping to handle escaping (some possibilities below).
6. Avoid making changes to token maps in the middle of processing if you value your sanity. They're are not cloned before use because I see no unavoidable use case for the fly changes.

**Interesting useless side effect:** you can pass arguments to a non-function; it's pointless however since they're not used in processing.

**Build your own escape**

There's no escape character for the `$` symbol because it's easy enough to write a token mapping for it. Here are a few possibilities:

```js
export const escapeMethods = {
	// The simplest approach is to just to use $$, $$$, $$$$, etc.
	// Add more as you need.
	$: '$',
	$$: '$$',
	$$$: '$$$',

	// We can make this for all unbroken series of $ using a single function.
	//
	// $$ => $
	// $$(2) => $$
	// $$(3) => $$$
	$: (n = 1) => '$'.repeat(n),

	// toString accepts a value and returns it. This allows values containing $
	// anywhere within to be escaped easily.
	//
	// $toString("$$$") => $$$
	// $toString("$ one $$ two $$$ three") => $ one $$ two $$$ three
	toString: (s = '') => s.toString(),

	// The world's your Mollusc. You can create any kind of function to escape
	// however you please. Here's a quotation function.
	//
	// $quote('Lots of $$$') => "Lots of $$$"
	// $quote('Lots of $$$', '`') => `Lots of $$$`
	quote: (s = '', glyph = '"') => glyph + s.toString() + glyph,
}
```

### Usage & Options

**CSS as a string:**

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
const after = p69(
	tokenMap,
	before,
	(options = {
		/* See below for options */
	})
)

// After: "main { font-family: Verdana, Arial, Helvetica; }"
```

```js
const options = {
	// If true, errors will be thrown after being printed.
	// This will immediately end processing. Default is false.
	throwOnError: false,
}
```

**P69 enhanced CSS files:**

```js
import p69Files from 'p69/files'

const tokens = {
	font: {
		family: {
			verdana: ['Verdana', 'Arial', 'Helvetica'],
		},
	},
}

p69Files(
	tokenMap,
	(options = {
		/* See below for options */
	})
)
```

```js
const options = {
	// If true, errors will be thrown after being printed.
	// This will immediately end processing. Default is
	// false as I use Svelte which is better at telling me
	// where the errors are.
	throwOnError: false,

	// root directory containing .p69 files that need
	// to be converted to CSS. If null then .p69 file
	// processing is skipped.
	root: './src',

	// output is the file path to merge all processed .p69
	// files into. This does not include style content from
	// Svelte files or anyother framework. If null, a .css
	// file will be created for each .p69 file in the same
	// directory as it.
	//
	// There are virtues and vices to each approach but
	// amalgamation works better for smaller projects while
	// big projects often benefit from more rigorous
	// modularisation.
	output: './src/global.css',
}
```

## Svelte Usage

### `svelte.config.js`

```js
// svelte.config.js
import p69Svelte from 'p69/svelte'
import tokens from './src/tokens.js'

export default {
  ...,
  preprocess: [p69Svelte(tokens, options = {/* See below for options */})],
  ...,
}
```

```js
const options = {
	// If true, errors will be thrown after being printed.
	// This will immediately end processing. Default is
	// false as I use Svelte which is better at telling me
	// where the errors are.
	throwOnError: false,

	// root directory containing .p69 files that need
	// to be converted to CSS. If null then .p69 file
	// processing is skipped.
	root: './src',

	// output is the file path to merge all processed .p69
	// files into. This does not include style content from
	// Svelte files or anyother framework. If null, a .css
	// file will be created for each .p69 file in the same
	// directory as it.
	//
	// There are virtues and vices to each approach but
	// amalgamation works better for smaller projects while
	// big projects often benefit from more rigorous
	// modularisation.
	output: './src/global.css',

	// List of accepted lang attibute values. Import
	// defaultMimeTypes from 'p69' if you need to know them
	// in code. Undefined means that a style tag with no
	// lang set will be included in P69 processing.
	mimeTypes: [undefined, 'p69', 'text/p69'],

	// watch determines if P69 should reprocess everytime a
	// P69 file or any of the watchToken files change during
	// development. This only makes sense when using the
	// framework's developer mode. Must be set to true and
	// not just truthy!
	watch: process?.env?.NODE_ENV === 'development',

	// watchTokens contains a set of globs for specifying
	// files and folders which, on change, should trigger
	// a reloading of token mappings. The watch option must
	// be true to enable this option.
	//
	// By default this is every JavaScript file in the src
	// folder. For small projects this is fine but when a
	// project contains a lot of JavaScript files most of
	// the reprocessing is redundant. Setting the specific
	// token file or files reduces pointless reloading.
	watchTokens: ['./src/**/*.js'],
}
```

### Example `+layout.svelte`

```html
<!-- +layout.svelte -->
<slot />

<style>
	:global(body) {
		background: $color.base;
	}

	:global(p) {
		font-family: $text.family.helvetica;
		font-size: $text.size.md;
		color: $color.text;
		margin-top: $space.md(em);
	}

	:global(h1) {
		font-size: $text.size.lg;
		color: $color.strong;
	}

	@media $screen.larger_devices {
		:global(h1) {
			font-size: $font.size.xl;
		}
	}

	:global(strong) {
		color: $color.strong;
	}
</style>
```

### Example `atomic-text-classes.p69`

```css
/* atomic-text-classes.p69 */
.g-text-strong {
	color: $theme.strong;
}

.g-text-spectral {
	font-family: $text.family.spectral;
}
```

## CSS Utility Functions

Optional utility functions to use in your style files. Perfectly acceptable to write your own if you don't like mine.

```js
import { themeVariables, colorSchemes, rgbsToColors, spacings } from 'p69/util'
```

| Name                              | Does what?                                                                                                                                            |
| :-------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| [rgbsToColors](#rgbstocolors)     | Converts a map of RGB and RGBA arrays to CSS RGB and RGBA values.                                                                                     |
| [colorSchemes](#colorschemes)     | Generates CSS color scheme media queries from a set of themes with CSS variables as values; goes hand-in-hand with [themeVariables](#themevariables). |
| [themeVariables](#themevariables) | Generates a **set** of CSS variables from a set of themes; goes hand-in-hand with [colorSchemes](#colorschemes).                                      |
| [spacings](#spacings)             | Generates a set of spacing functions.                                                                                                                 |

### rgbsToColors

Converts a map of RGB and RGBA arrays to CSS RGB and RGBA values.

**Parameters**:

- **rgbs**: map of RGB and RGBA arrays.

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

### colorSchemes

Generates CSS color scheme media queries from a set of themes; goes hand-in-hand with [themeVariables](#themeVariables)

**Parameters**:

- **themes**: map of CSS colour schemes (themes).

```js
import { colorSchemes } from 'p90/util'

const themes = {
	// P90 doesn't care what the theme names are but browsers do!
	light: {
		base: [250, 250, 250],
		text: [5, 10, 60],
	},
	dark: {
		base: [5, 10, 35],
		text: [231, 245, 255],
	},
}

const scheme = colorSchemes(themes)
console.log(scheme)
/*
`@media (prefers-color-scheme: light) {
	:root {
		--theme-base: rgb(250, 250, 250);
		--theme-text: rgb(5, 10, 60);
	}
}

@media (prefers-color-scheme: dark) {
	:root {
		--theme-base: rgb(5, 10, 35);
		--theme-text: rgb(231, 245, 255);
	}
}`
*/
```

### themeVariables

Generates a **set** of CSS variables from a set of themes; goes hand-in-hand with [colorSchemes](#colorschemes).

**Parameters**:

- **themes**: map of CSS colour schemes (themes).

```js
import { themeVariables } from 'p90/util'

const themes = {
	// P90 doesn't care what the theme names are but browsers do!
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

const theme = themeVariables(themes)
console.log(theme)
/*
{
	base: "var(--theme-base)",
	text: "var(--theme-text)",
	meh: "var(--theme-meh)",
}
*/
```

### spacings

Generates a set of spacings functions with support for most size units.

**Parameters**:

- **values**: map of names to pixel amounts.
- **options**:
  - **base**: Pixels per REM. This is not necessarily the users font size, just a way to adjust EM and REM if needed (default=16)
  - **defaultUnit**: Default size unit when not passing any parameters when referenced within CSS (default='rem')

Everything is in reference to 96 DPI. Supported size units:

- rem
- em
- px
- pt
- pc
- in
- cm
- mm

```js
import { spacings } from 'p69/util'

const styles = {
	width: spacings(
		{
			min: 320,
			sm: 720,
			md: 920,
			lg: 1200,
			xl: 1600,
		},
		{
			base: 16, // default: 16 (px)
			defaultUnit: 'rem', // default: 'rem'
		}
	),
}

const css = `
main {
	/* width: 45rem (720px at 16px per rem) */
	width: $width.sm;
}

/* min-width: 920px */
@media (min-width: $width.md(px)) {
	main {
		/* max-width: 1600px */
		max-width: $width.xl(px); 
	}
}
`
```
