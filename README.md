# NP90

I just needed a bit of sugar upon my CSS.

**NP90** builds upon [P90](https://github.com/PaulioRandall/p90) for Node projects. It adds support for:

- \[**TODO**\] Processing `.p90` files into `.css` files.
- Svelte preprocessing.

A minimalist value replacement processor for CSS. Let plain JavaScript handle preprocessing logic, not a CSS mutant.

Honestly, this tool is straight up optimised for my tastes. The design trade-offs lean towards simplicity, readability, and flexibility more than writability. Complexity of mapping values is almost entirely in the user's court.

**P90** scans CSS for **P90** tokens which are substituted with user defined values. It's really just an enhanced `string.replace`.

## Import for Svelte

```json
{
	"devDependencies": {
		"np90": "v0.23.0"
	}
}
```

### p90-styles.js

Rename, move, and reorganise as you see fit. See [P90](https://github.com/PaulioRandall/p90) for the value mapping rules.

> I've made so many changes to this example that it probably contains a few errors. The rewrite is in my TODO list so will probably never get done.

```js
// ./src/p90-styles.js
import { rgbsToColors, themeVariables, colorSchemes } from 'np90/util'

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

Add **np90** to the _preprocess_ array in your _svelte.config.js_. Import and pass your styles to it.

```js
// svelte.config.js
import np90 from 'np90/svelte'
import styles from './src/p90-styles.js'

export default {
  ...,
  preprocess: [np90(styles)],
  ...,
}
```

```js
// svelte.config.js
import np90 from 'np90/svelte'
import styles from './src/p90-styles.js'

// Config and options with their defaults.
const config = {
	stdout: console.log,
	stderr: console.error,

	// If true, errors will be thrown immediately ending the processing.
	// Default is off beccause Svelte and various CSS checkers will usually tell
	// you where the errors are. They're better at it too.
	throwOnError: false,

	// Prints file name and token info when an error is encountered.
	printErrors: true,

	// List of accepted lang attibute values.
	// import { defaultMimeTypes } from 'p90'
	mimeTypes: [
		'', // Undefined, null, or empty lang attribute.
		'text/css',
		'text/p90',
	],
}

export default {
  ...,
  preprocess: [np90(styles, config)],
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
		It took me about an hour to learn and write my first Svelte CSS
		pre-processor after deciding existing tooling was too obese for my needs.
		Refactoring reduced my solution to about 20 lines of code. It simply
		substituted named values like `$green` with whatever I configured `rgb(10,
		240, 10)`. I moved it to it's own repository, enhanced it a little, and
		added a handful of utility functions for common use cases.
	</p>

	<p>
		It was so simple that I started wondering why we drag around a plethora of
		CSS like languages with needless diabolical syntax. Because it's easier to
		use a cumbersome tool you know than invest effort in adapting to the new
		environment.
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
