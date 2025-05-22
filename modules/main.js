'use strict'

import {assignIf, checkMobile, DynamicColor, onKeyDown, openInNewTab, phi, tau, toggleFullscreen} from './util.js'
import {Application, Assets, Container, FillGradient, Graphics, RenderTexture, Sprite, SCALE_MODES, Text, Texture} from './pixi.min.js'
import {AdvancedBloomFilter, AsciiFilter, BevelFilter, DropShadowFilter, GlowFilter, OutlineFilter} from './pixi-filters.js'

async function init() {
	const app = new Application()
		
    await app.init({
        resizeTo: window,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
    })

    document.body.appendChild(app.view)
	app.renderer.background.color = 0x222222

	const codeOnBleuTexture = await Assets.load('media/face.png')
	
	const glow = new GlowFilter()
	glow.resolution = window.devicePixelRatio
	
    const codeOnBleu = new Sprite(codeOnBleuTexture)
	codeOnBleu.anchor = 0.5
	codeOnBleu.filters = glow
	app.stage.addChild(codeOnBleu)
	
	const dc1 = new DynamicColor({
		r: {velocity: 1},
		g: {velocity: 1.5},
		b: {velocity: 4 / 3},
		elapse: 8
	})

    function handleResize() {
		const screenWidth = app.screen.width
		const screenHeight = app.screen.height
		const isHorizontalDisplay = screenWidth >= screenHeight
		const scale = isHorizontalDisplay ? screenWidth / 2048 : 0.85 * screenHeight / 2103
		
        codeOnBleu.x = screenWidth / 2
        codeOnBleu.y = screenHeight / 2
		codeOnBleu.scale = scale / 2
		glow.outerStrength = 2 * scale
    }

    app.renderer.on('resize', handleResize)
	handleResize()
	
	app.ticker.add((time) => {
		const dt = time.deltaTime
		dc1.update(dt / 100)
		glow.color = dc1.getInt()
	})
}

init()
