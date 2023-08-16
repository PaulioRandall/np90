# P69

**P69** builds upon [P90](https://github.com/PaulioRandall/p90) to provide CSS preprocessing for Node projects. It adds support for:

- Processing `.p69` files into `.css` files.
- Svelte preprocessing.

Honestly, this tool is straight up optimised for me and my tastes. The design trade-offs lean towards simplicity, readability, and flexibility more than writability. Complexity of mapping values is almost entirely in the user's court.

**P90** scans CSS for **P90** tokens which are substituted with user defined values. It's really just an enhanced GREP using `string.replace`.

### styles.js

Rename, move, and reorganise as you see fit. See [P90](https://github.com/PaulioRandall/p90) for value mapping rules.

> I've made so many changes to this example that it probably contains a few errors. The rewrite is in my TODO list so will probably never get done.

```js
// ./src/styles.js
import { rgbsToColors, themeVariables, colorSchemes } from 'p69/p90/css'

const rgbs = {
	burly_wood: [222, 184, 135],
	ice_cream: [250, 250, 250],
	very_light_sky_blue: [231, 245, 255],
	jet_blue: [30, 85, 175],
	dark_navy_grey: [5, 10, 60],
	very_dark_navy: [5, 10, 35],
}

const colors = rgbsToColors(rgbs)

const themes = {
	// P90 doesn't care what the theme names are but browsers do!
	light: {
		base: colors.ice_cream,
		text: colors.dark_navy_grey,
		strong: colors.jet_blue,
	},
	dark: {
		base: colors.very_dark_navy,
		text: colors.very_light_sky_blue,
		strong: colors.burly_wood,
	},
}

export default {
	rgb: rgbs,
	color: colors,

	color_schemes: colorSchemes(themes),
	theme: themeVariables(themes),

	// The function is called for each instance.
	// There is no caching unless you implement it.
	colorWithAlpha: (color, alpha) => {
		const rgb = rgbs[color]

		// Function arguments are always strings.
		// Parse them as you see fit.
		const a = parseFloat(alpha)

		const result = [...rgb]

		if (rgb.length === 3) {
			result.push(a)
		} else {
			result[3] = a
		}

		return result
	},

	font: {
		family: {
			sans_serif: ['sans-serif', 'Helvetica', 'Arial', 'Verdana'],
		},
		size: {
			// Constructed using utopia.fyi... Could these be constructed in code?
			md: 'clamp(1.06rem, calc(0.98rem + 0.39vw), 1.38rem)',
			lg: 'clamp(1.25rem, calc(1.19rem + 0.31vw), 1.5rem)',
			xl: 'clamp(1.5rem, calc(1.41rem + 0.47vw), 1.88rem)',
		},
	},

	screen: {
		larger_devices: `(min-width: 900px)`,
	},
}
```

### svelte.config.js

Add **p69** to the _preprocess_ array in your _svelte.config.js_. Import and pass your styles to it.

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

**Options:**

```js
// svelte.config.js
import p69 from 'p69/svelte'
import styles from './src/styles.js'

// Options with their defaults.
const options = {

	// root directory containing .p69 files that need to be converted to CSS.
	// If null then .p69 file processing is skipped.
	root: './src',

	// amalgamate file path. The file path to merge all processed .p69 files
	// into. If null, a .css file will be created for each .p69 file in
	// the same directory. There are virtues and vices to each approach but
	// amalgamation works better for smaller projects while big projects
	// benefit from more rigorous separation of concerns.
	amalgamate: './src/routes/styles.css',

	// watch determines if P69 should reprocess everytime a P69 file changes
	// during development. Must be set to true and not just truthy!
	watch: process?.env?.NODE_ENV === 'development',

	// List of accepted lang attibute values.
	// import { defaultMimeTypes } from 'p90'
	mimeTypes: [
		'', // Undefined, null, or empty lang attribute.
		'text/css',
		'text/p90',
	],

	// The following are P90 options.

	// Logger for informational messages.
	stdout: console.log,

	// Logger for error messages.
	stderr: console.error,

	// If true, errors will be thrown immediately ending the processing.
	// Default is false because I use Svelte and it will tell me where the
	// errors are.
	throwOnError: false,

	// Prints file name and token info when an error is encountered.
	printErrors: true,
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
	/* prettier-ignore */
	$color_schemes

	:global(body) {
		background: $theme.base;
		color: $theme.text;
		font-family: $font.family.sans_serif;
		font-size: $font.size.md;
	}
</style>
```

### +page.svelte

```html
<page>
	<h1>A Bohemian quest for simplicity</h1>

	<p>
		It took me about an hour to learn and write my first Svelte CSS preprocessor
		after deciding existing tooling was too obese for my needs. Refactoring
		reduced my solution to about 20 lines of code. It simply substituted named
		values like `$green` with whatever I configured `rgb(10, 240, 10)`. I moved
		it to it's own repository, enhanced it a little, and added a handful of
		utility functions for common use cases.
	</p>

	<p>
		It was so simple that I started wondering why we drag around a plethora of
		CSS like languages with needless diabolical syntax. Because it's easier to
		use a cumbersome tool you know than invest effort in adapting to the new
		environment. Also, as Dijkstra repeatedly notes, complexity sells better.
	</p>

	<p>
		And why do slow complex transpiling when fast and simple value substitution
		can do the job. Let JavaScript handle logic, not a CSS mutant. That's what
		JavaScript is designed to do. You know, making use of languages we already
		know and hate.
	</p>
</page>

<style>
	h1 {
		color: $theme.strong;
		font-size: $font.size.lg;

		/* You don't have to put single or double quotes around arguments. */
		/* But it helps */
		background-color: $colorWithAlpha('burly_wood', 0.2);
	}

	@media $screen.larger_devices {
		h1 {
			font-size: $font.size.xl;
		}
	}
</style>
```

## CSS Utility Functions

A utility functions to use in your style files. Entirely optional; write your own if you want.

```js
import { themeVariables, colorSchemes, rgbsToColors, spacings } from 'p69/css'
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
import { rgbsToColors } from 'p90/css'

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
import { colorSchemes } from 'p90/css'

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
	:global(:root) {
		--theme-base: rgb(250, 250, 250);
		--theme-text: rgb(5, 10, 60);
	}
}

@media (prefers-color-scheme: dark) {
	:global(:root) {
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
import { themeVariables } from 'p90/css'

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

> TODO.

## Markdown Processor

> Planned.
