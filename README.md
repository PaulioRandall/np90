# P69

**P69** builds upon [P90](https://github.com/PaulioRandall/p90) to provide CSS preprocessing for Node projects.

**P90** scans CSS for **P90** tokens which are substituted with user defined values. It's really just an enhanced `string.replace`. **P69** adds value by introducing:

- Svelte preprocessing.
- File processing: `.p69` to `.css`.

This tool is straight up optimised for me and my tastes. The design trade-offs lean towards simplicity and flexibility more than writability.

See [sveltekit-minimalist-template](https://github.com/PaulioRandall/sveltekit-minimalist-template) for an example in a runnable project.

### styles.js

Rename, move, and reorganise as you see fit. See [P90](https://github.com/PaulioRandall/p90) for value mapping rules.

```js
// src/styles.js

import { spacings } from 'p69/util'

// You can configure this how you like.
// There's no convention, just do what works for you.
export default {
	$: (n = 1) => '$'.repeat(n), // Used for escaping the prefix
	text: {
		family: {
			helvetica: ['Helvetica', 'Arial', 'Verdana'],
		},
		size: {
			// https://utopia.fyi/
			md: 'clamp(1.06rem, calc(0.98rem + 0.39vw), 1.38rem)',
			lg: 'clamp(1.95rem, calc(1.73rem + 0.95vw), 2.91rem)',
			xl: 'clamp(2.59rem, calc(2.32rem + 1.34vw), 3.66rem)',
		},
	},
	color: {
		base: 'rgb(255, 255, 255)',
		text: 'rgb(11, 19, 43)',
		link: 'rgb(20, 20, 255)',
		strong: 'Navy',
	},
	space: spacings(
		{
			sm: 8,
			md: 16,
			lg: 32,
		},
		{
			defaultUnit: 'rem',
		}
	),
	screen: {
		larger_devices: '(min-width: 1200px)',
	},
}
```

### svelte.config.js

Add **p69** to the _preprocess_ array in your _svelte.config.js_. Import and pass your styles to it.

**Quick start:**

```js
// svelte.config.js
import p69 from 'p69/svelte'
import styles from './src/styles.js'

export default {
  ...,
  preprocess: [p69(styles)],
  ...,
}
```

**With options:**

```js
// svelte.config.js
import p69 from 'p69/svelte'
import styles from './src/styles.js'

// Options showing defaults.
const options = {

	// root directory containing .p69 files that need
	// to be converted to CSS. If null then .p69 file
	// processing is skipped.
	root: './src',

	// amalgamate file path. The file path to merge all
	// processed .p69 files into. If null, a .css file will
	// be created for each .p69 file in the same directory.
	// There are virtues and vices to each approach but
	// amalgamation works better for smaller projects while
	// big projects benefit from more rigorous separation of
	// concerns.
	amalgamate: './src/routes/styles.css',

	// watch determines if P69 should reprocess everytime a
	// P69 file changes during development. Must be set to
	// true and not just truthy!
	watch: process?.env?.NODE_ENV === 'development',

	// List of accepted lang attibute values.
	// import { defaultMimeTypes } from 'p90'
	// Use [undefined, ...defaultMimeTypes] to
	// allow style tags without a lang attribute.
	mimeTypes: [
		'p90',
		'text/p90',
	],

	// Prefix character
	prefix: '$',

	// Logger for informational messages.
	stdout: console.log,

	// Logger for error messages.
	stderr: console.error,

	// If true, errors will be thrown rather than ignored.
	// This will immediately end processing. Default is
	// false because I use Svelte and it's good at tell
	// me where the errors are.
	throwOnError: false,

	// Print file name and token information when an error
	// is encountered.
	printErrors: true,

	// A note when printing errors, usually a filename or
	// some identifier that may aid you in debugging.
	errorNote: '¯\\_(ツ)_/¯',
}

export default {
  ...,
  preprocess: [p69(styles, options)],
  ...,
}
```

### +layout.svelte

```html
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

### +page.svelte

```html
<main>
	<h1>A Bohemian quest for simplicity</h1>

	<p>
		It took me about an hour to learn and write my first Svelte CSS preprocessor
		after deciding existing tooling was just unnecessary verbose. Refactoring
		reduced my solution to about 20 lines of code. It simply substituted named
		values like `$green` with whatever I configured, e.g. `rgb(10, 240, 10)`.
	</p>

	<p>
		I moved it to it's own repository (<b>P90</b>), enhanced it a little, and
		added a handful of utility functions for common use cases. Then I moved the
		CSS and Svelte specific stuff to <b>P69</b> so <b>P90</b> could be come a
		generic search and replace package.
	</p>

	<p>
		It was so simple that I started wondering why we drag around a plethora of
		CSS like languages and frameworks with needless diabolical syntax nd
		configuration. Because it's easier to use a cumbersome tool you know than
		invest effort in adapting to the new environment. Simplicity is hard, and as
		Dijkstra repeatedly notes
		<q>complexity sells better</q>.
	</p>

	<p>
		And why do slow complex transpiling when fast and simple value substitution
		can do the job. Let JavaScript handle logic, not a CSS mutant. That's what
		JavaScript is designed to do. You know, making use of languages we already
		know and hate.
	</p>
</main>
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
  - **base**: Pixels per REM. This is **not** the users font size, just a way to adjust EM and REM if needed (default=16)
  - **defaultUnit**: Default size unit when not passing any parameters when referenced within CSS (default='px')
  - **custom**: Any custom key-value pairs to append to the resultant object (default={})

Everything is in reference to 96 DPI. Supported size units:

- px
- em
- rem
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
			defaultUnit: 'rem',
			custom: {
				max: '100%',
			},
		}
	),
}

const css = `
main {
	max-width: $width.max; /* 100%  */
	width: $width.sm;      /* 45rem */
}

@media (min-width: $width.md(px)) { /* 920px  */
	main {
		max-width: $width.xl(px); /* 1600px */
	}
}
`
```
