// Copyright © 2024 Code on Bleu. All rights reserved.

'use strict'

import {assignIf, checkMobile, DynamicColor, onKeyDown, openInNewTab, phi, tau, toggleFullscreen} from './util.mjs'
import {Application, Assets, Container, Graphics, RenderTexture, Sprite, SCALE_MODES, Text, Texture} from './pixi.min.mjs'
import {AdvancedBloomFilter, AsciiFilter, BevelFilter, DotFilter, DropShadowFilter, GlowFilter} from './pixi-filters.mjs'

export class PageController {
	#pageClasses = null
	#pages = {}
	#currentPage = null
	#isMobile = checkMobile()
	#settings = {}
	#app = new Application()
	#textures = {}
	#filters = {}
	#dynamicColors = []
	#storyText = null
	#loading = null
	#rectangle1 = null
	#rectangle2 = null
	#rectangle3 = null
	#rectangle4 = null
	#controllerUiContainer = null
	#pageContainer = null
	#unexpand = null
	#expand = null
	#facebook = null
	#youtube = null
	#linkedin = null
	#mouseX = 0
	#mouseY = 0
	#scale = 1
	#paused = false
	
	#pageFade = {
		nextPage: null,
		fadeIn: false,
		elapsed: 0
	}
	
	juliaTime = 40
	juliaAccel = 1
	titleAccel = 0
	glowAccel = 0
	sloganAccel = 0
	
	constructor(pageClasses) {
		this.#pageClasses = pageClasses
	}
	
	get isMobile() { return this.#isMobile }
	get mediaDirectory() { return '../media/' }
	get overlayAlpha() { return 0.5 }
	get storyText() { return this.#storyText }
	get mouseX() { return this.#mouseX }
	get mouseY() { return this.#mouseY }
	get screenWidth() { return this.#app.screen.width }
	get screenHeight() { return this.#app.screen.height }
	get centerX() { return this.#app.screen.width / 2 }
	get centerY() { return this.#app.screen.height / 2 }
	get isHorizontalDisplay() { return this.screenWidth >= this.screenHeight }
	get scale() { return this.#scale }
	
	getFilter(key) { return this.#filters[key] }
	getDynamicColor(index) { return this.#dynamicColors[index] }
	
	async init(pageKey) {
		assignIf(this.#settings, {
			pauseEnabled: false,
			hideUi: false
		})
		
		await this.#loadResources()
		this.#createBaseGraphics()
		await this.loadPage(pageKey)
		this.#setAppCallbacks()
	}
	
	async #loadResources() {
		const app = this.#app
		
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
		
		Assets.addBundle('fonts', [
			{alias: 'berkshireswash regular', src: this.mediaDirectory + 'berkshireswash-regular.ttf'}
		])
		
		await Assets.loadBundle('fonts')
		
		const storyText = new Text({
			text: '',
			style: {
				fontFamily: 'berkshireswash regular',
				fontSize: 100,
				fill: 0xffffff,
				stroke: {color: '#000000', width: 30, join: 'round'},
				align: 'center'
			}
		})
		
		storyText.anchor.set(0.5)
		this.#storyText = storyText
		
		await this.loadTexture('loading')
		const loading = this.newSprite('loading')
		this.#loading = loading
		this.#recalculateScale()
		loading.position.set(this.centerX, this.centerY)
		loading.scale.set(this.#scale)
		app.ticker.add((time) => loading.rotation += time.deltaTime * 0.1)
		
		await this.loadTextures('expand', 'unexpand', 'facebook', 'linkedin', 'youtube', 'cheese', 'TM', 'arrow')
	}
	
	#createBaseGraphics() {
		this.#rectangle3 = this.newGraphics()
		this.#rectangle2 = this.newGraphics()
		this.#rectangle1 = this.newGraphics()
		
		if (this.isMobile) {
			this.#rectangle3.visible = false
			this.#rectangle2.visible = false
			//this.#rectangle1.visible = false
		}
		
		const controllerUiContainer = this.newContainer()
		
		this.#controllerUiContainer = controllerUiContainer
		controllerUiContainer.visible = false
		this.#expand = this.newSprite('expand', controllerUiContainer)
		this.#unexpand = this.newSprite('unexpand', controllerUiContainer)
		this.#facebook = this.newSprite('facebook', controllerUiContainer)
		this.#youtube = this.newSprite('youtube', controllerUiContainer)
		this.#linkedin = this.newSprite('linkedin', controllerUiContainer)
		
		this.#pageContainer = this.newContainer()
		this.#rectangle4 = this.newGraphics()
		this.#loading.removeFromParent()
		this.addChild(this.#loading)
		
		this.addFilter('bevel', new BevelFilter())
		this.addFilter('asciiSmall', new AsciiFilter({size: 4, replaceColor: true}))
		this.addFilter('dot', new DotFilter({grayscale: false, scale: 0.1}), 1)
		this.addFilter('bloom', new AdvancedBloomFilter({threshold: 0.1}))
		this.addFilter('glow', new GlowFilter())
		this.addFilter('dropShadow', new DropShadowFilter())
		
		this.setFilters(this.#expand, 'glow', 'dropShadow')
		this.setFilters(this.#unexpand, 'glow', 'dropShadow')
		this.setFilters(this.#facebook, 'glow', 'dropShadow')
		this.setFilters(this.#youtube, 'glow', 'dropShadow')
		this.setFilters(this.#linkedin, 'glow', 'dropShadow')
		
		this.#pushNewDynamicColor({
			r: {velocity: 1},
			g: {velocity: 1.5},
			b: {velocity: 4 / 3},
			elapse: 8
		})
		
		this.#pushNewDynamicColor({
			r: {velocity: 1.5},
			g: {velocity: 4 / 3},
			b: {velocity: 1},
			elapse: 8
		})
		
		this.#pushNewDynamicColor({
			r: {velocity: 4 / 3},
			g: {velocity: 1},
			b: {velocity: 1.5},
			elapse: 8
		})
		
		this.#pushNewDynamicColor({
			r: {velocity: 9 / 7},
			g: {velocity: 13 / 9},
			b: {velocity: 139 / 126},
			elapse: 8
		})
		
		this.onClick(this.#expand, toggleFullscreen)
		this.onClick(this.#unexpand, toggleFullscreen)
		this.onClick(this.#facebook, () => openInNewTab('https://www.facebook.com/profile.php?id=61561860844447'))
		this.onClick(this.#youtube, () => openInNewTab('https://www.youtube.com/@CodeOnBleu'))
		this.onClick(this.#linkedin, () => openInNewTab('https://www.linkedin.com/company/code-on-bleu'))
		
		// disable all interaction underneath rectangle4
		this.#rectangle4.eventMode = 'static'
	}
	
	#setAppCallbacks() {
		const app = this.#app
		const stage = app.stage
		
		stage.eventMode = 'static'
		stage.hitArea = app.screen
		
		stage.addEventListener('pointermove', (e) => {
			this.#mouseX = e.global.x
			this.#mouseY = e.global.y
		})
		
		if (this.#settings.pauseEnabled) {
			onKeyDown((keyCode) => {
				if (keyCode == 80) {
					this.#paused = !this.#paused
				}
			})
		}
		
		app.renderer.on('resize', () => this.#layout(false))
		app.ticker.add((time) => this.#update(time))
	}
	
	#getPageKey(key) {
		key = key ? key.toLowerCase() : 'home'
		return this.#pageClasses[key] ? key : 'home'
	}
	
	// Lazy initialization, cache pages once they are created
	async #getPage(key) {
		const pages = this.#pages
		let page = pages[key]
		
		if (page == null) {
			const pageClass = this.#pageClasses[key]
			
			this.#loading.visible = true
			this.#rectangle4.visible = true
			this.#rectangle4.alpha = 0.5
			page = new pageClass(this)
			pages[key] = page
			await page.initBase()
		}
		
		return page
	}
	
	async loadPage(key) {
		key = this.#getPageKey(key)
		
		const page = await this.#getPage(key)
		const pageFade = this.#pageFade
		
		pageFade.nextPage = page
		pageFade.elapsed = 0
		
		if (this.#currentPage == null) {
			this.#setPage(page)
		}
		
		this.#controllerUiContainer.visible = true
		window.history.replaceState('', '', '?key=' + key)
	}
	
	#setPage(page) {
		const juliaFilters = page.settings.julia.filters

		this.#pageContainer.removeChildren()
		this.#currentPage = page
		this.#pageContainer.addChild(page.container)
		page.reload()
		this.setFilters(this.#rectangle1, 'julia1', ...juliaFilters)
		this.setFilters(this.#rectangle2, 'julia2', ...juliaFilters)
		this.setFilters(this.#rectangle3, 'julia3', ...juliaFilters)
		this.#layout(true)
		this.#loading.visible = false
	}
	
	#updatePageFade(dt) {
		const pageFade = this.#pageFade
		const nextPage = pageFade.nextPage
		
		if (nextPage == null) {
			return
		}
		
		const fadingOut =  this.#currentPage !== nextPage
		const rectangle4 = this.#rectangle4
		
		rectangle4.visible = true
		rectangle4.alpha = fadingOut ? pageFade.elapsed : 1 - pageFade.elapsed
		pageFade.elapsed += 0.025 * dt
		
		if (pageFade.elapsed >= 1) {
			pageFade.elapsed = pageFade.elapsed % 1
			
			if (fadingOut) {
				this.#setPage(nextPage)
			} else {
				pageFade.nextPage = null
				rectangle4.visible = false
				return
			}
		}
	}
	
	async loadTexture(key) {
		if (this.#textures[key] != null) {
			return
		}
		
		const path = this.mediaDirectory + key + '.png'
		const texture = await Assets.load(path)
		texture.source.antialias = true
		texture.source.scaleMode = SCALE_MODES.LINEAR
		this.#textures[key] = texture
	}
	
	async loadTextures(...keys) {
		for (const key of keys) {
			await this.loadTexture(key)
		}
	}
	
	#pushNewDynamicColor(args) {
		this.#dynamicColors.push(new DynamicColor(args))
	}
	
	addFilter(key, filter, mobileResolution) {
		this.#filters[key] = filter
		filter.resolution = mobileResolution != null && this.isMobile ? mobileResolution : window.devicePixelRatio
	}
	
	setFilters(displayObject, ...filterKeys) {
		displayObject.filters = filterKeys.map((key) => this.#filters[key])
	}
	
	addChild(displayObject, container) {
		(container || this.#app.stage).addChild(displayObject)
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
	
	newStoryText(str) {
		// Render text to a texture, because there was some latency seen on mobile otherwise
		
		const text = this.#storyText
		text.text = str
		text.position.set(text.width / 2, text.height / 2)
		
		const renderTexture = RenderTexture.create({width: text.width, height: text.height})
		renderTexture.source.antialias = true
		renderTexture.source.scaleMode = SCALE_MODES.LINEAR
		this.#app.renderer.render(text, {renderTexture})
		
		const result = new Sprite(renderTexture)
		result.anchor.set(0.5)
		this.setFilters(result, 'glow', 'dropShadow')
		
		return result
	}
	
	onClick(displayObject, callback) {
		displayObject.eventMode = 'static'
		displayObject.cursor = 'pointer'
		displayObject.on('pointerdown', callback)
	}
	
	 addOnce(callback) {
		this.#app.ticker.addOnce(callback)
	 }
	
	position(displayObject, xPercent, yPercent, scale) {
		const baseScale = this.#scale
		
		displayObject.position.set(xPercent * this.centerX / baseScale, yPercent * this.centerY / baseScale)
		displayObject.scale.set(scale == null ? 1 : scale)
		
		return displayObject
	}
	
	#recalculateScale() {
		const scale = this.isHorizontalDisplay ? this.screenHeight / 2048 : 0.85 * this.screenWidth / 2103
		this.#scale = scale
		return scale
		
	}
	
	arrangeUi(args) {
		assignIf(args, {
			align: 'center',
			x: 0,
			y: 0,
			spacing: 10,
			scale: 1,
			elements: []
		})
		
		const elements = args.elements.map((element) => {
			if (Array.isArray(element)) {
				return {
					object: element[0],
					scale: element[1]
				}
			}
			
			return {
				object: element,
				scale: 1
			}
		})
		
		const align = args.align
		const numElements = elements.length
		const x = args.x
		const y = args.y
		const mainScale = this.scale
		const scale = args.scale
		const spacing = args.spacing
		let left = 0
		
		elements.forEach((element) => {
			const object = element.object
			
			object.scale.set(scale * element.scale)
			
			const width = object.texture.width * object.scale.x
			
			left += width / 2
			object.position.set(left, y)
			left += width / 2 + spacing
		})
		
		if (align == 'center') {
			const middleIndex = Math.floor(numElements / 2)
			
			const centerX = numElements % 2 == 1 ?
				elements[middleIndex].object.x :
				(elements[middleIndex].object.x + elements[middleIndex - 1].object.x) / 2
			
			elements.forEach((element) => element.object.x -= centerX)
		} else if (align == 'right') {
			elements.forEach((element) => element.object.x -= left)
		}
		
		// align 'left' supported by default
		
		elements.forEach((element) => element.object.x += x)
	}
	
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
		const scale = this.#recalculateScale()
		const isHorizontalDisplay = this.isHorizontalDisplay
		
		const resetRectangle = (rectangle, color) => {
			rectangle.clear()
			
			if (isHorizontalDisplay) {
				rectangle.rect(0, 0, screenWidth, screenHeight).fill(0x060606)
			} else {
				const height = screenHeight * (phi + 0.1)
				rectangle.rect(0, centerY - height / 2, screenWidth, height).fill(0x060606)
			}
		}
		
		resetRectangle(this.#rectangle1, 0x060606)
		resetRectangle(this.#rectangle2, 0x060606)
		resetRectangle(this.#rectangle3, 0x060606)
		resetRectangle(this.#rectangle4, 0x000000)
		
		const controllerUiContainer = this.#controllerUiContainer
		const logoScale = 0.75
		const logoX = 0.085
		const logoY = 0.92
		
		controllerUiContainer.position.set(centerX, centerY)
		controllerUiContainer.scale.set(scale)
		
		for (const expander of [this.#unexpand, this.#expand]) {
			this.arrangeUi({
				align: 'right',
				y: -centerY / scale + (isHorizontalDisplay ? 75 : 125),
				x: centerX / scale - (isHorizontalDisplay ? 10 : 15),
				spacing: 40,
				scale: isHorizontalDisplay ? 0.2 : 0.4,
				elements: [expander]
			})
		}
		
		this.arrangeUi({
			align: 'center',
			y: centerY / scale - (isHorizontalDisplay ? 100 : 150),
			spacing: isHorizontalDisplay ? 50 : 75,
			scale: isHorizontalDisplay ? 0.75 : 1.35,
			elements: [
				[this.#facebook, 145 / 268],
				this.#youtube,
				this.#linkedin
			]
		})
		
		const pageContainer = this.#pageContainer
		
		pageContainer.position.set(centerX, centerY)
		pageContainer.scale.set(scale)
		
		const filters = this.#filters
		
		filters.dropShadow.offsetX = 20 * scale
		filters.dropShadow.offsetY = 20 * scale
		filters.glow.outerStrength = 10 * scale
		filters.bloom.blur = 16 * scale
		filters.dot.scale = 0.0707107/ Math.sqrt(scale)
		filters.julia1.setScreenDimensions(screenWidth, screenHeight)
		filters.julia2.setScreenDimensions(screenWidth, screenHeight)
		filters.julia3.setScreenDimensions(screenWidth, screenHeight)
		
		this.#loading.position.set(centerX, centerY)
		this.#loading.scale.set(scale)
		
		this.#currentPage.layoutBase(screenWidth / scale, screenHeight / scale, centerX / scale, centerY / scale, isHorizontalDisplay)
	}
	
	#update(time) {
		if (this.#paused) {
			time.deltaTime = 0
		}
		
		const dt = time.deltaTime
		const filters = this.#filters
		const page = this.#currentPage
		const juliaSettings  = page.settings.julia
		const dynamicColors = this.#dynamicColors
		const isFullscreen = document.fullscreen
		
		this.#expand.visible = !isFullscreen
		this.#unexpand.visible = isFullscreen
		
		dynamicColors[0].update(dt / 100 * (1 + this.titleAccel))
		dynamicColors[1].update(dt / 100 * (1 + this.glowAccel))
		dynamicColors[2].update(dt / 100 * (1 + this.sloganAccel))
		dynamicColors[3].update(dt / 100)
		
		this.titleAccel *= 0.99 - 0.001 * dt
		this.glowAccel *= 0.99 - 0.01 * dt
		this.sloganAccel *= 0.99 - 0.001 * dt
		
		filters.glow.color = dynamicColors[1].getInt()
		filters.dot.angle = (this.juliaTime / -20) % tau
		
		this.juliaTime += 0.04 * dt * (1 + this.juliaAccel)
		this.juliaAccel *= 0.99 - 0.001 * dt
		filters.julia1.time = this.juliaTime
		filters.julia1.realC = juliaSettings.getReal(this.juliaTime)
		filters.julia1.imagC = juliaSettings.getImag(this.juliaTime)
		
		const juliaTime2 = this.juliaTime * 1.3
		filters.julia2.time = juliaTime2
		filters.julia2.realC = juliaSettings.getReal(juliaTime2)
		filters.julia2.imagC = juliaSettings.getImag(juliaTime2)
		
		const juliaTime3 = juliaTime2 * 1.3
		filters.julia3.time = juliaTime3
		filters.julia3.realC = juliaSettings.getReal(juliaTime3)
		filters.julia3.imagC = juliaSettings.getImag(juliaTime3)
		
		this.#updatePageFade(dt)
		page.updateBase(time, dt)
	}
}
