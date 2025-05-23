'use strict'

import {checkMobile, DynamicColor, openInNewTab, phi2, tau, toggleFullscreen} from './util.js'
import {Application, Assets, FillGradient, Graphics, Sprite, SCALE_MODES, Text, Texture} from './pixi.min.js'
import {AsciiFilter, GlowFilter, DotFilter} from './pixi-filters.js'
import {JuliaFilter} from './shaders/julia.js'

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
			const texture = await Assets.load('media/' + key + '.png')
			texture.source.antialias = true
			texture.source.scaleMode = SCALE_MODES.LINEAR
			textures[key] = texture
		}
	}
	
	const add = (child) => app.stage.addChild(child)
	const newGraphics = () => add(new Graphics())
	
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
	
	const onClick = (displayObject, callback) => {
		displayObject.eventMode = 'static'
		displayObject.cursor = 'pointer'
		displayObject.on('pointerdown', callback)
	}
	
	const newFilter = (construct, args, mobileResolution) => {
		const result = new construct(args)
		result.resolution = mobileResolution != null && isMobile ? mobileResolution : window.devicePixelRatio
		return result
	}
	
	await loadTextures('codeOnBleu', 'face', 'delicious', 'github',
		'youtube', 'linkedin', 'expand', 'unexpand')
	
	const glow1 = newFilter(GlowFilter, {})
	const glow2 = newFilter(GlowFilter, {})
	const ascii1 = newFilter(AsciiFilter, {size: isMobile ? 8 : 8, replaceColor: true})
	const dot1 = newFilter(DotFilter, {grayscale: false, scale: 0.1}, 1)
	const julia1 = newFilter(JuliaFilter, {maxIterations: isMobile ? 5 : 5}, 1)
	const julia2 = newFilter(JuliaFilter, {maxIterations: isMobile ? 5 : 5}, 1)
	
	const rect1 = newGraphics()
	const rect2 = newGraphics()
	const rect3 = newGraphics()
	const codeOnBleu1 = newSprite('codeOnBleu', [glow1])
	const codeOnBleu2 = newSprite('codeOnBleu', [ascii1])
	const face = newSprite('face', [glow2])
	const delicious = newSprite('delicious')
	const deliciousText = newText('Delicious')
	const tasks = newGraphics()
	const timeText = newText()
	const expand = newSprite('expand')
	const unexpand = newSprite('unexpand')
	const github = newSprite('github')
	const youtube = newSprite('youtube')
	const linkedin = newSprite('linkedin')
	
	rect1.filters = [julia1, dot1]
	rect2.filters = [julia2, dot1]
	
	let colorAccel = 0
	
	onClick(face, () => colorAccel = 6)
	onClick(delicious, () => openInNewTab('https://github.com/codeonbleu/Delicious'))
	onClick(deliciousText, () => openInNewTab('https://github.com/codeonbleu/Delicious'))
	onClick(github, () => openInNewTab('https://github.com/codeonbleu'))
	onClick(youtube, () => openInNewTab('https://www.youtube.com/@CodeOnBleu'))
	onClick(linkedin, () => openInNewTab('https://www.linkedin.com/company/code-on-bleu'))
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
		const tasksMidY = 0.975 * screenHeight
		
		julia1.setScreenDimensions(screenWidth, screenHeight)
		julia2.setScreenDimensions(screenWidth, screenHeight)
		
		glow1.outerStrength = isMobile ? 8 * scale : 16 * scale
		glow2.outerStrength = isMobile ? 8 * scale : 4 * scale
		
		rect1.clear()
		rect1.rect(0, 0, screenWidth, screenHeight).fill(0xFFFFFF)
		
		rect2.clear()
		rect2.rect(0, 0, screenWidth, screenHeight).fill(0xFFFFFF)
		
		if (isMobile) {
			const codeOnBleuY = screenHeight * 0.1
			const codeOnBleusScale = scale / 1.75
			const faceX = screenWidth / 2
			const faceY = screenHeight / 2.5
			const faceScale = scale
			const iconScale = scale / 1.5
			const iconX = screenWidth / 4
			const iconY = screenHeight * 0.65
			const iconTextXOffset = -165 * iconScale
		
			codeOnBleu1.position.set(screenWidth / 2, codeOnBleuY)
			codeOnBleu1.scale = codeOnBleusScale
			codeOnBleu2.position.set(screenWidth / 2, codeOnBleuY)
			codeOnBleu2.scale = codeOnBleusScale
			
			face.position.set(faceX, faceY)
			face.scale = faceScale
			
			delicious.position.set(iconX, iconY)
			delicious.scale = iconScale
			delicious.anchor.x = 0.5
			delicious.anchor.y = 0
			deliciousText.position.set(iconX + iconTextXOffset, delicious.y + 225 * iconScale)
			deliciousText.scale = iconScale * 3.2
		} else {
			const codeOnBleuY = screenHeight * (1 - phi2)
			const codeOnBleusScale = scale / 2
			const faceX = screenWidth / 2
			const faceY = screenHeight / 2
			const faceScale = scale / 2
			const iconScale = scale / 3
			const iconLeft = 40 * scale
			const iconTextLeft = 20 * scale
			let iconTop = 20 * scale
		
			codeOnBleu1.position.set(screenWidth / 2, codeOnBleuY)
			codeOnBleu1.scale = codeOnBleusScale
			codeOnBleu2.position.set(screenWidth / 2, codeOnBleuY)
			codeOnBleu2.scale = codeOnBleusScale
			
			face.position.set(faceX, faceY)
			face.scale = faceScale
			
			delicious.position.set(iconLeft, iconTop)
			delicious.scale = iconScale
			delicious.anchor = 0
			deliciousText.position.set(iconTextLeft, delicious.y + 225 * iconScale)
			deliciousText.scale = iconScale * 3.2
		}
		
		const tasksGradient = new FillGradient(0, 0, screenWidth, screenHeight)
		tasksGradient.addColorStop(0, 0x000000)
		tasksGradient.addColorStop(1, 0x112266)
		tasks.clear().rect(0, 0.95 * screenHeight, screenWidth, screenHeight).fill(tasksGradient)
		
		const taskHeight = 0.05 * screenHeight
		const iconHeight = taskHeight * 0.7
		
		timeText.anchor.y = 0.5
		timeText.scale = 1
		timeText.scale = taskHeight * 0.5 / timeText.height
		timeText.position.set(screenWidth - (isMobile ? 80 : 85) * timeText.scale.x, tasksMidY)
		
		for (const expander of [expand, unexpand]) {
			expander.scale = taskHeight * 0.5 / expander.texture.height
			expander.anchor.x = 1
			expander.position.set(screenWidth - timeText.scale.x * 100, tasksMidY)
		}
		
		github.scale = iconHeight / github.texture.height
		github.position.set(screenWidth / 2 - 400 * github.scale.x, tasksMidY)
		
		youtube.scale = iconHeight / youtube.texture.height
		youtube.position.set(screenWidth / 2, tasksMidY)
		
		linkedin.scale = iconHeight / linkedin.texture.height
		linkedin.position.set(screenWidth / 2 + 200 * linkedin.scale.x, tasksMidY)
    }

    app.renderer.on('resize', handleResize)
	handleResize()
	
	let totalTime = 0
	let juliaTime = 0
	
	app.ticker.add((time) => {
		const dt = time.deltaTime
		const screenWidth = app.screen.width
		const screenHeight = app.screen.height
		const isFullscreen = document.fullscreen
		const now = new Date()
		const colorMul = 1 + colorAccel
		
		totalTime += dt
		colorAccel *= 0.99 - 0.001 * dt
		juliaTime += 0.04 * dt * colorMul
		
		dot1.angle = (juliaTime / -20) % tau
		
		julia1.time = juliaTime
		julia1.realC = Math.sin(juliaTime * 0.2)
		julia1.imagC = Math.cos(juliaTime * 1.3 * 0.2)
		
		const juliaTime2 = juliaTime * 1.3
		julia2.time = juliaTime2
		julia2.realC = Math.sin(juliaTime2 * 0.2)
		julia2.imagC = Math.cos(juliaTime2 * 1.3 * 0.2)
		
		dc1.update(colorMul * dt / 100)
		dc2.update(colorMul * dt / 100)
		dc3.update(colorMul * dt / 200)
		
		glow1.color = dc1.getInt()
		glow2.color = dc2.getInt()
		codeOnBleu2.tint = dc1.getInt()
		
		const backgroundGradient = new FillGradient(0, 0, screenWidth, screenHeight)
		backgroundGradient.addColorStop(0, 0x000000)
		backgroundGradient.addColorStop(1, dc3.getInt())
		rect3.clear().rect(0, 0, screenWidth, screenHeight).fill(backgroundGradient)
		rect3.alpha = 0.95
		
		timeText.text = (now.getHours() < 10 ? ' ' : '') + now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes()
		
		expand.visible = !isFullscreen
		unexpand.visible = isFullscreen
	})
}

init()
