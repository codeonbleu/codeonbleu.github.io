// Copyright © 2024 Code on Bleu. All rights reserved.

import {Application, Assets, Container, Graphics, Sprite, SCALE_MODES, Texture} from './pixi.min.mjs'
import {AdvancedBloomFilter, BevelFilter, DotFilter, GlowFilter, AsciiFilter, DropShadowFilter} from './pixi-filters.mjs'
import {assignIf, checkMobile, DynamicColor, onKeyDown, openInNewTab, phi, tau} from './util.mjs'
import {JuliaFilter} from './shaders/julia.mjs'

export class Page {
	static async launch(derivedClass) {
		const page = new derivedClass()
		await page.#init()
		return page
	}
	
	static #isMobile = checkMobile()
	#app = new Application()
	#textures = {}
	#filters = {}
	#mouseX = 0
	#mouseY = 0
	#scale = 1
	#paused = false
	
	#frameData = {
		animating: false,
		index: 0
	}
	
	settings = {}
	juliaTime = 40
	juliaAccel = 1
	titleAccel = 0
	glowAccel = 0
	sloganAccel = 0
	
	static get isMobile() { return this.#isMobile }
	static get overlayAlpha() { return 0.5 }
	get app() { return this.#app }
	get textures() { return this.#textures }
	get filters() { return this.#filters }
	get mouseX() { return this.#mouseX }
	get mouseY() { return this.#mouseY }
	get screenWidth() { return this.app.screen.width }
	get screenHeight() { return this.app.screen.height }
	get centerX() { return this.app.screen.width / 2 }
	get centerY() { return this.app.screen.height / 2 }
	get scale() { return this.#scale }
	
	async loadTexture(key) {
		if (this.#textures[key] != null) {
			return
		}
		
		const path = '../'.repeat(this.settings.directoryDepth) + 'media/' + key + '.png'
		const texture = await Assets.load(path)
		texture.source.antialias = true
		texture.source.scaleMode = SCALE_MODES.LINEAR
		this.#textures[key] = texture
	}
	
	addFilter(key, filter, optimizeForMobile) {
		this.#filters[key] = filter
		
		if (!optimizeForMobile || !Page.isMobile) {
			filter.resolution = window.devicePixelRatio
		}
	}
	
	addChild(displayObject, container) {
		(container || this.app.stage).addChild(displayObject)
		return displayObject
	}
	
	newSprite(textureKey, container, alpha) {
		const result = new Sprite(this.#textures[textureKey])
		result.anchor.set(0.5)
		result.alpha = alpha == null ? 1 : alpha
		return this.addChild(result, container)
	}
	
	newGraphics(container) {
		return this.addChild(new Graphics(), container)
	}
	
	newContainer(parentContainer) {
		return this.addChild(new Container(), parentContainer)
	}
	
	setFilters(displayObject, ...filterKeys) {
		displayObject.filters = filterKeys.map((key) => this.filters[key])
	}
	
	nextFrame() {
		const data = this.#frameData
		const numFrames = this.frameContainer.children.length
		
		if (data.animating || numFrames <= 1) {
			return
		}
		
		data.animating = true
		data.elapsed = 0
		data.nextIndex = (data.index + 1) % numFrames
	}
	
	onClick(displayObject, callback) {
		displayObject.eventMode = 'static'
		displayObject.cursor = 'pointer'
		displayObject.on('pointerdown', callback)
	}
	
	position(displayObject, x, y, extraScale) {
		extraScale = extraScale == null ? 1 : extraScale
		displayObject.scale.set(this.scale * extraScale)
		displayObject.position.set(x, y)
	}

	open(url) {
		openInNewTab(url)
	}
	
	load(url) {
		window.location.href = url
	}
	
	async #init() {
		const settings = assignIf(this.settings, {
			textures: [],
			title: 'title',
			slogan: 'slogan',
			tmTitle: false,
			tmSlogan: false,
			directoryDepth: 1,
			enablePauseKey: false,
			julia: {}
		})
		
		const julia = assignIf(settings.julia, {
			enabled: true,
			maxIterations: 10,
			filters: Page.isMobile ? ['dot'] : ['dot', 'bloom', 'glow'],
			getReal: (time) => Math.sin(time * 0.2),
			getImag: (time) => Math.cos(time * 1.3 * 0.2)
		})
		
		const app = this.app
		
		await app.init({
			background: '#000000',
			resizeTo: window,
			preference: 'webgpu',
			antialias: true,
			autoDensity: true,
			resolution: window.devicePixelRatio,
			powerPreference: 'high-performance'
		})
		
		document.body.appendChild(app.canvas)
		
		for (const key of [settings.title, settings.slogan, 'facebook', 'linkedin', 'youtube']) {
			await this.loadTexture(key)
		}
		
		if (settings.tmTitle || settings.tmSlogan) {
			await this.loadTexture('TM')
		}
		
		for (const key of settings.textures) {
			await this.loadTexture(key)
		}
		
		this.rectangle3 = this.newGraphics()
		this.rectangle2 = this.newGraphics()
		this.rectangle1 = this.newGraphics()
		
		this.title1 = this.newSprite(settings.title)
		this.title2 = this.newSprite(settings.title, null, Page.overlayAlpha)
		
		if (settings.tmTitle) {
			this.tmTitle = this.newSprite('TM', null, 0.125)
		}
		
		this.slogan1 = this.newSprite(settings.slogan)
		this.slogan2 = this.newSprite(settings.slogan, null, Page.overlayAlpha)
		
		if (settings.tmSlogan) {
			this.tmSlogan = this.newSprite('TM', null, 0.125)
		}
		
		this.facebook = this.newSprite('facebook')
		this.linkedin = this.newSprite('linkedin')
		this.youtube = this.newSprite('youtube')
		this.frameContainer = this.newContainer()
		
		this.addFilter('bevel', new BevelFilter())
		this.addFilter('asciiSmall', new AsciiFilter({size: 4, replaceColor: true}))
		this.addFilter('ascii', new AsciiFilter({size: 16, replaceColor: true}))
		this.addFilter('dot', new DotFilter({grayscale: false, scale: 0.1}), true)
		this.addFilter('bloom', new AdvancedBloomFilter({threshold: 0.1}))
		this.addFilter('glow', new GlowFilter())
		this.addFilter('dropShadow', new DropShadowFilter())
		this.addFilter('julia1', new JuliaFilter({maxIterations: julia.maxIterations}), true)
		this.addFilter('julia2', new JuliaFilter({maxIterations: julia.maxIterations}), true)
		this.addFilter('julia3', new JuliaFilter({maxIterations: julia.maxIterations}), true)
		
		this.setFilters(this.rectangle3, 'julia3', ...julia.filters)
		this.setFilters(this.rectangle2, 'julia2', ...julia.filters)
		this.setFilters(this.rectangle1, 'julia1', ...julia.filters)
		this.setFilters(this.title1, 'bloom', 'glow', 'dropShadow')
		this.setFilters(this.title2, 'bloom', 'glow', 'asciiSmall')
		this.setFilters(this.slogan1, 'bevel', 'bloom', 'glow', 'dropShadow')
		this.setFilters(this.slogan2, 'bloom', 'asciiSmall')
		this.setFilters(this.facebook, 'glow', 'dropShadow')
		this.setFilters(this.youtube, 'glow', 'dropShadow')
		this.setFilters(this.linkedin, 'glow', 'dropShadow')
		
		this.dynamicColor1 = new DynamicColor({
			r: {velocity: 1},
			g: {velocity: 1.5},
			b: {velocity: 4 / 3},
			elapse: 4
		})
		
		this.dynamicColor2 = new DynamicColor({
			r: {velocity: 1.5},
			g: {velocity: 4 / 3},
			b: {velocity: 1},
			elapse: 4
		})
		
		this.dynamicColor3 = new DynamicColor({
			r: {velocity: 4 / 3},
			g: {velocity: 1},
			b: {velocity: 1.5},
			elapse: 4
		})
		
		this.dynamicColor4 = new DynamicColor({
			r: {velocity: 9 / 7},
			g: {velocity: 13 / 9},
			b: {velocity: 139 / 126},
			elapse: 4
		})
		
		app.stage.eventMode = 'static'
		app.stage.hitArea = app.screen
		
		app.stage.addEventListener('pointermove', (e) => {
			this.#mouseX = e.global.x
			this.#mouseY = e.global.y
		})
		
		if (settings.enablePauseKey) {
			onKeyDown((keyCode) => {
				if (keyCode == 80) {
					this.#paused = !this.#paused
				}
			})
		}
		
		this.onClick(this.title2, () => {
			this.dynamicColor1.update(1)
			this.titleAccel = 8
			this.nextFrame()
		})
		
		this.onClick(this.slogan2, () => {
			this.dynamicColor3.update(1)
			this.sloganAccel = 8
			this.nextFrame()
		})
		
		this.onClick(this.facebook, () => this.open('https://www.facebook.com/profile.php?id=61561860844447'))
		this.onClick(this.youtube, () => this.open('https://www.youtube.com/@CodeOnBleu'))
		this.onClick(this.linkedin, () => this.open('https://www.linkedin.com/company/code-on-bleu'))
		
		this.init()
		
		this.frameContainer.children.forEach((child, index) => {
			child.visible = index == 0
		})
		
		app.renderer.on('resize', () => this.#layout(false))
		this.#layout(true)
		
		app.ticker.add((time) => this.#update(time))
	}
	
	init() {}
	
	#layoutQueued = false
	
	#layout(immediate) {
		if (!immediate) {
			if (this.#layoutQueued) {
				return
			}
			
			this.#layoutQueued = true
			
			setTimeout(() => {
				this.#layout(true)
				this.#layoutQueued = false
			}, 300)
			
			return
		}
		
		const screenWidth = this.screenWidth
		const screenHeight = this.screenHeight
		const centerX = this.centerX
		const centerY = this.centerY
		const isHorizontalDisplay = screenWidth >= screenHeight
		const scale = isHorizontalDisplay ? screenHeight / 2048 : 0.85 * screenWidth / this.#textures[this.settings.title].width
		
		this.#scale = scale
		
		for (const rectangle of [this.rectangle1, this.rectangle2, this.rectangle3]) {
			rectangle.clear()
			
			if (isHorizontalDisplay) {
				rectangle.rect(0, 0, screenWidth, screenHeight).fill(0x060606)
			} else {
				const height = screenHeight * (phi + 0.1)
				rectangle.rect(0, centerY - height / 2, screenWidth, height).fill(0x060606)
			}
		}
		
		const titleF = phi + 0.05
		
		this.position(this.title1, centerX, (1 - phi) * centerY)
		this.position(this.title2, centerX, (1 - phi) * centerY)
		
		if (this.tmTitle) {
			this.position(this.tmTitle, this.title1.x + this.title1.width / 2 + 80 * scale, this.title1.y - this.title1.height * 0.4)
		}
		
		this.position(this.slogan1, centerX, (1 + phi) * centerY, 0.75)
		this.position(this.slogan2, centerX, (1 + phi) * centerY, 0.75)
		
		if (this.tmSlogan) {
			this.position(this.tmSlogan, this.slogan1.x + this.slogan1.width / 2 + 80 * scale, this.slogan1.y - this.slogan1.height * 0.4)
		}
		
		this.position(this.frameContainer, centerX, centerY)
		
		const logoScale = 0.75
		const logoX = 220 * scale * logoScale
		const logoY = screenHeight - 140 * scale * logoScale
		this.position(this.facebook, centerX - logoX, logoY, 145 / 268 * logoScale)
		this.position(this.youtube, centerX, logoY, logoScale)
		this.position(this.linkedin, centerX + logoX, logoY, logoScale)
		
		const filters = this.filters
		
		filters.dropShadow.offsetX = 20 * scale
		filters.dropShadow.offsetY = 20 * scale
		filters.glow.outerStrength = 10 * scale
		filters.bloom.blur = 16 * scale
		filters.julia1.setScreenDimensions(screenWidth, screenHeight)
		filters.julia2.setScreenDimensions(screenWidth, screenHeight)
		filters.julia3.setScreenDimensions(screenWidth, screenHeight)
		
		this.layout(screenWidth, screenHeight, centerX, centerY, scale, isHorizontalDisplay)
	}
	
	layout() {}
	
	#update(time) {
		if (this.#paused) {
			time.deltaTime = 0
		}
		
		const dt = time.deltaTime
		const filters = this.filters
		const julia  = this.settings.julia
		
		this.dynamicColor1.update(dt / 100 * (1 + this.titleAccel))
		this.dynamicColor2.update(dt / 100 * (1 + this.glowAccel))
		this.dynamicColor3.update(dt / 100 * (1 + this.sloganAccel))
		this.dynamicColor4.update(dt / 100)
		
		this.titleAccel *= 0.99 - 0.001 * dt
		this.glowAccel *= 0.99 - 0.01 * dt
		this.sloganAccel *= 0.99 - 0.001 * dt
		
		this.juliaTime += 0.04 * dt * (1 + this.juliaAccel)
		this.juliaAccel *= 0.99 - 0.001 * dt
		filters.julia1.time = this.juliaTime
		filters.julia1.realC = julia.getReal(this.juliaTime)
		filters.julia1.imagC = julia.getImag(this.juliaTime)
		
		const juliaTime2 = this.juliaTime * 1.3
		filters.julia2.time = juliaTime2
		filters.julia2.realC = julia.getReal(juliaTime2)
		filters.julia2.imagC = julia.getImag(juliaTime2)
		
		const juliaTime3 = juliaTime2 * 1.3
		filters.julia3.time = juliaTime3
		filters.julia3.realC = julia.getReal(juliaTime3)
		filters.julia3.imagC = julia.getImag(juliaTime3)
		
		this.title1.tint = this.dynamicColor1.getInt()
		this.title2.tint = this.dynamicColor1.getInt(Math.PI / 2)
		filters.glow.color = this.dynamicColor2.getInt()
		this.slogan1.tint = this.dynamicColor3.getInt()
		this.slogan2.tint = this.dynamicColor3.getInt(Math.PI / 2)
		
		filters.dot.angle = (this.juliaTime / -20) % tau
		
		const frameData = this.#frameData
		
		if (frameData.animating) {
			frameData.elapsed += dt
			
			const elapsed = Math.min(2, frameData.elapsed * 0.1)
			const currentVisible = elapsed < 1
			const container = this.frameContainer
			
			container.scale = Math.abs(elapsed - 1) * this.scale
			container.children[frameData.index].visible = currentVisible
			container.children[frameData.nextIndex].visible = !currentVisible
			
			if (elapsed == 2) {
				frameData.animating = false
				frameData.index = frameData.nextIndex
				frameData.nextIndex = null
			}
		}
		
		this.update(time, dt)
	}
	
	update(time, dt) {}
}
