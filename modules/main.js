'use strict'

import {assignIf, checkMobile, DynamicColor, onKeyDown, openInNewTab, phi, phi2, tau, toggleFullscreen} from './util.js'
import {Application, Assets, Container, FillGradient, Graphics, RenderTexture, Sprite, SCALE_MODES, Text, Texture} from './pixi.min.js'
import {AdvancedBloomFilter, AsciiFilter, BevelFilter, DropShadowFilter, GlowFilter, OutlineFilter} from './pixi-filters.js'

async function init() {
	const app = new Application()
		
    await app.init({
		background: '#000000',
        resizeTo: window,
		preference: 'webgpu',
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
		powerPreference: 'high-performance'
    })

    document.body.appendChild(app.view)
	app.renderer.background.color = 0x000000
	
	const isMobile = checkMobile()
	const textures = {}
	
	const loadTextures = async (...keys) => {
		for (const key of keys) {
			textures[key] = await Assets.load('media/' + key + '.png')
		}
	}
	
	const add = (child) => app.stage.addChild(child)
	
	const newSprite = (key, filters) => {
		const result = new Sprite(textures[key])
		
		result.anchor = 0.5
		
		if (filters != null) {
			result.filters = filters
		}
		
		return add(result)
	}
	
	const newText = (text, font) => {
		const result = new Text({text: text})
		result.style.fill = 0xFFFFFF
		return add(result)
	}
	
	const newGraphics = () => {
		const result = new Graphics()
		return add(result)
	}
	
	const onClick = (displayObject, callback) => {
		displayObject.eventMode = 'static'
		displayObject.cursor = 'pointer'
		displayObject.on('pointerdown', callback)
	}
	
	await loadTextures('codeOnBleuShadow', 'codeOnBleu', 'faceShadow', 'face', 'delicious', 'youtube',
		'github', 'expand', 'unexpand')
	
	const glow2 = new GlowFilter()
	glow2.resolution = window.devicePixelRatio
	
	const glow1 = new GlowFilter()
	glow1.resolution = window.devicePixelRatio
	
	const backgroundRectangle = newGraphics()
	const codeOnBleuShadow = newSprite('codeOnBleuShadow')
	const codeOnBleu = newSprite('codeOnBleu', [glow1])
	const faceShadow = newSprite('faceShadow')
	const face = newSprite('face', [glow2])
	const delicious = newSprite('delicious')
	const deliciousText = newText('Delicious')
	const tasks = newGraphics()
	const timeText = newText()
	const expand = newSprite('expand')
	const unexpand = newSprite('unexpand')
	const youtube = newSprite('youtube')
	const github = newSprite('github')
	
	onClick(delicious, () => openInNewTab('https://github.com/codeonbleu/Delicious'))
	onClick(deliciousText, () => openInNewTab('https://github.com/codeonbleu/Delicious'))
	onClick(github, () => openInNewTab('https://github.com/codeonbleu'))
	onClick(youtube, () => openInNewTab('https://www.youtube.com/@CodeOnBleu'))
	onClick(expand, toggleFullscreen)
	onClick(unexpand, toggleFullscreen)
	
	const dc1 = new DynamicColor({
		r: {velocity: 1.5},
		g: {velocity: 4 / 3},
		b: {velocity: 1},
		elapse: 8
	})
	
	const dc2 = new DynamicColor({
		r: {velocity: 1},
		g: {velocity: 1.5},
		b: {velocity: 4 / 3},
		elapse: 8
	})
	
	const dc3 = new DynamicColor({
		r: {velocity: 9 / 7},
		g: {velocity: 13 / 9},
		b: {velocity: 139 / 126},
		elapse: 8
	})

    function handleResize() {
		const screenWidth = app.screen.width
		const screenHeight = app.screen.height
		const isHorizontalDisplay = screenWidth >= screenHeight
		const scale = isHorizontalDisplay ? screenWidth / 2048 : 0.85 * screenHeight / 2103
		const shadow = 2
		const faceScale = isMobile ? scale : scale / 2
		//const codeOnBleusScale = isMobile ? scale * 0.7 : scale / 2
		const codeOnBleusScale = scale / 2
		const iconScale = isMobile ? scale / 2 : scale / 3
		const iconLeft = 40 * scale
		const iconTextLeft = 20 * scale
		let iconTop = 20 * scale
		
        codeOnBleuShadow.position.set(screenWidth / 2 + shadow * scale, screenHeight * (1 - phi2) + shadow * scale)
		codeOnBleuShadow.scale = codeOnBleusScale
        codeOnBleu.position.set(screenWidth / 2, screenHeight * (1 - phi2))
		codeOnBleu.scale = codeOnBleusScale
		
        faceShadow.position.set(screenWidth / 2 + shadow * scale, screenHeight / 2 + shadow * scale)
		faceShadow.scale = faceScale
        face.position.set(screenWidth / 2, screenHeight / 2)
		face.scale = faceScale
		
		glow2.outerStrength = 2 * scale
		glow1.outerStrength = 2 * scale
		
		delicious.position.set(iconLeft, iconTop)
		delicious.scale = iconScale
		delicious.anchor = 0
		deliciousText.position.set(iconTextLeft, delicious.y + 225 * iconScale)
		deliciousText.scale = iconScale * 3.2
		
		const tasksGradient = new FillGradient(0, 0, screenWidth, screenHeight)
		tasksGradient.addColorStop(0, 0x000000)
		tasksGradient.addColorStop(1, 0x112266)
		tasks.clear().rect(0, 0.95 * screenHeight, screenWidth, screenHeight).fill(tasksGradient)
		
		timeText.anchor.x = 1
		timeText.anchor.y = 0.5
		timeText.position.set(screenWidth - iconTextLeft, 0.975 * screenHeight)
		timeText.scale = iconScale * 3.2
		
		;[expand, unexpand].forEach(expander => {
			expander.scale = isMobile ? scale / 5 : scale / 10
			expander.position.set(screenWidth - iconTextLeft - 1000 * expander.scale.x, 0.975 * screenHeight)
		})
		
		youtube.position.set(screenWidth / 2, 0.975 * screenHeight)
		youtube.scale = isMobile ? scale / 2 : scale / 4
		
		github.scale = isMobile ? scale / 3.5 : scale / 7
		github.position.set(youtube.position.x - 400 * github.scale.x, youtube.position.y)
    }

    app.renderer.on('resize', handleResize)
	handleResize()
	
	let totalTime = 0
	
	app.ticker.add((time) => {
		const dt = time.deltaTime
		const screenWidth = app.screen.width
		const screenHeight = app.screen.height
		const isFullscreen = document.fullscreen
		const now = new Date()
		
		totalTime += dt
		
		dc1.update(dt / 100)
		dc2.update(dt / 100)
		dc3.update(dt / 200)
		
		glow1.color = dc1.getInt()
		glow2.color = dc2.getInt()
		
		const backgroundGradient = new FillGradient(0, 0, screenWidth, screenHeight)
		backgroundGradient.addColorStop(0, 0x000000)
		backgroundGradient.addColorStop(1, dc3.getInt())
		backgroundRectangle.clear()
		backgroundRectangle.rect(0, 0, screenWidth, screenHeight).fill(backgroundGradient)
		
		timeText.text = '' + now.getHours() + (now.getHours() < 10 ? ' ' : '') + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes()
		
		expand.visible = !isFullscreen
		unexpand.visible = isFullscreen
	})
}

init()
