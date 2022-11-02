import React from 'react'
import {
	Animated,
	Image,
	Dimensions,
	PanResponder,
	StyleSheet,
	TouchableWithoutFeedback,
	View,
	Text,
} from 'react-native'

import srcWheel from './assets/graphics/ui/color-wheel.png'
import srcSlider from './assets/graphics/ui/black-gradient.png'
import srcSliderRotated from './assets/graphics/ui/black-gradient-rotated.png'

const Elevations = require('react-native-elevation')

const styles = StyleSheet.create({
	root: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'space-between',
		overflow: 'visible',
	},
	wheel: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
		overflow: 'visible',
		width: '100%',
		minWidth: 200,
		minHeight: 200,
	},
	wheelWrap: {
		width: '100%',
		height: '100%',
	},
	wheelImg: {
		width: '100%',
		height: '100%',
	},
	wheelThumb: {
		position: 'absolute',
		backgroundColor: '#EEEEEE',
		borderWidth: 3,
		borderColor: '#EEEEEE',
		elevation: 4,
		shadowColor: 'rgb(46, 48, 58)',
		shadowOffset: {width: 0, height: 2},
		shadowOpacity: 0.8,
		shadowRadius: 2,
	},
	cover: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
	},
	slider: {
		width: '100%',
		marginTop: 16,
		flexDirection: 'column-reverse',
	},
	sliderImg: {
		width: '100%',
		height: '100%',
	},
	sliderThumb: {
		position: 'absolute',
		top: 0,
		left: 0,
		borderWidth: 2,
		borderColor: '#EEEEEE',
		elevation: 4,
	},
	grad: {
		borderRadius: 100,
		overflow: "hidden",
		height: '100%',
	},
	swatches: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 16,
	},
	swatch: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderColor: '#8884',
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'visible',
	},
	swatchTouch: {
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: '#f004',
		overflow: 'hidden',
	},
})

const PALETTE = [
	'#000000',
	'#888888',
	'#ed1c24',
	'#d11cd5',
	'#1633e6',
	'#00aeef',
	'#00c85d',
	'#57ff0a',
	'#ffde17',
	'#f26522',
]

const RGB_MAX = 255
const HUE_MAX = 360
const SV_MAX = 100

const normalize = (degrees: number) => ((degrees % 360 + 360) % 360)

const rgb2Hsv = (r: any, g: number, b: number) => {
	if (typeof r === 'object') {
		const args = r
		r = args.r; g = args.g; b = args.b;
	}

	// It converts [0,255] format, to [0,1]
	r = (r === RGB_MAX) ? 1 : (r % RGB_MAX / parseFloat((RGB_MAX as unknown) as string))
	g = (g === RGB_MAX) ? 1 : (g % RGB_MAX / parseFloat((RGB_MAX as unknown) as string))
	b = (b === RGB_MAX) ? 1 : (b % RGB_MAX / parseFloat((RGB_MAX as unknown) as string))

	let max = Math.max(r, g, b)
	let min = Math.min(r, g, b)
	let h, s, v = max

	let d = max - min

	s = max === 0 ? 0 : d / max

	if (max === min) {
		h = 0 // achromatic
	} else {
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0)
				break
			case g:
				h = (b - r) / d + 2
				break
			case b:
				h = (r - g) / d + 4
				break
		}
		h = h as number / 6
	}

	return {
		h: Math.round(h * HUE_MAX),
		s: Math.round(s * SV_MAX),
		v: Math.round(v * SV_MAX)
	}
}

const hsv2Rgb = (h: any, s: number, v: number) => {
	if (typeof h === 'object') {
		const args = h
		h = args.h; s = args.s; v = args.v;
	}

	h = normalize(h)
	h = (h === HUE_MAX) ? 1 : (h % HUE_MAX / parseFloat((HUE_MAX as unknown) as string) * 6)
	s = (s === SV_MAX) ? 1 : (s % SV_MAX / parseFloat((SV_MAX as unknown) as string))
	v = (v === SV_MAX) ? 1 : (v % SV_MAX / parseFloat((SV_MAX as unknown) as string))

	let i = Math.floor(h)
	let f = h - i
	let p = v * (1 - s)
	let q = v * (1 - f * s)
	let t = v * (1 - (1 - f) * s)
	let mod = i % 6
	let r = [v, q, p, p, t, v][mod]
	let g = [t, v, v, q, p, p][mod]
	let b = [p, p, t, v, v, q][mod]

	return {
		r: Math.floor(r * RGB_MAX),
		g: Math.floor(g * RGB_MAX),
		b: Math.floor(b * RGB_MAX),
	}
}

const rgb2Hex = (r: any, g: string, b: string) => {
	if (typeof r === 'object') {
		const args = r
		r = args.r; g = args.g; b = args.b;
	}
	r = Math.round(r).toString(16)
	g = Math.round((g as unknown) as number).toString(16)
	b = Math.round((b as unknown) as number).toString(16)

	r = r.length === 1 ? '0' + r : r
	g = g.length === 1 ? '0' + g : g
	b = b.length === 1 ? '0' + b : b

	return '#' + r + g + b
}

const hex2Rgb = (hex: string) => {
	let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null
}

const hsv2Hex = (h: string, s: number, v: number) => {
	let rgb = hsv2Rgb(h, s, v)
	return rgb2Hex(rgb.r, (rgb.g as unknown) as string, (rgb.b as unknown) as string)
}

const hex2Hsv = (hex: string) => {
	let rgb = hex2Rgb(hex)
	return rgb2Hsv(rgb?.r, (rgb?.g as unknown) as number, (rgb?.b as unknown) as number)
}

// expands hex to full 6 chars (#fff -> #ffffff) if necessary
const expandColor = (color: string) => typeof color == 'string' && color.length === 4
	? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
	: color;


export const ColorPicker = () => {
  return ()
}