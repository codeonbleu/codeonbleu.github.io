import {Application, Assets, Graphics, Sprite, SCALE_MODES, Texture} from './pixi.min.mjs'
import {AdvancedBloomFilter, BevelFilter, GlowFilter, AsciiFilter, DropShadowFilter} from './pixi-filters.mjs'
import {assignIf, checkMobile, makeDynamicColor, openInNewTab, phi, tau} from './util.mjs'
import {makeJuliaFilter} from './shaders/julia.mjs'

export class Page {
	static async launch(derivedClass) {
		const page = new derivedClass()
		await page.#init()
		return page
	}
	
	#app = new Application()
	#isMobile = checkMobile()
	#textures = {}
	#mouseX = 0
	#mouseY = 0
	#scale = 1
	
	settings = {}
	juliaTime = 40
	pieceRotationDirection = 1
	pieceAccel = 0
	titleAccel = 0
	sloganAccel = 0
	pieceTime = 0
	
	get app() { return this.#app }
	get isMobile() { return this.#isMobile }
	get mouseX() { return this.#mouseX }
	get mouseY() { return this.#mouseY }
	get screenWidth() { return this.app.screen.width }
	get screenHeight() { return this.app.screen.height }
	get centerX() { return this.app.screen.width / 2 }
	get centerY() { return this.app.screen.height / 2 }
	get scale() { return this.#scale }
	
	async loadTexture(key) {
		const texture = await Assets.load('../media/' + key + '.png')
		texture.source.antialias = true
		texture.source.scaleMode = SCALE_MODES.LINEAR
		this.#textures[key] = texture
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
	
	onClick(displayObject, callback) {
		displayObject.eventMode = 'static'
		displayObject.cursor = 'pointer'
		displayObject.on('pointerdown', callback)
	}
	
	open(url) {
		openInNewTab(url)
	}
	
	load(url) {
		window.location.href = url
	}
	
	async #init() {
		assignIf(this.settings, {
			textures: [],
			title: 'title',
			slogan: 'slogan'
		})
		
		const app = this.app
		
		await app.init({
			background: '#111111',
			resizeTo: window,
			preference: 'webgpu',
			antialias: true,
			autoDensity: true,
			resolution: window.devicePixelRatio,
			powerPreference: 'high-performance'
		})
		
		document.body.appendChild(app.canvas)
		
		for (const key of [this.settings.title, this.settings.slogan, 'TM', 'cheese', 'facebook', 'linkedin', 'youtube', 'piece', 'pieceQuest']) {
			await this.loadTexture(key)
		}
		
		for (const key of this.settings.textures) {
			await this.loadTexture(key)
		}
		
		app.stage.eventMode = 'static'
		app.stage.hitArea = app.screen
		
		app.stage.addEventListener('pointermove', (e) => {
			this.#mouseX = e.global.x
			this.#mouseY = e.global.y
		})
		
		this.rectangle3 = this.newGraphics()
		this.rectangle2 = this.newGraphics()
		this.rectangle1 = this.newGraphics()
		this.cheese = this.newSprite('cheese') // TODO: derived class adds this
		this.title1 = this.newSprite(this.settings.title)
		this.title2 = this.newSprite(this.settings.title)
		this.slogan1 = this.newSprite(this.settings.slogan)
		this.slogan2 = this.newSprite(this.settings.slogan)
		this.tmTitle = this.newSprite('TM', null, 0.125) // TODO: derived class adds this
		this.facebook = this.newSprite('facebook')
		this.linkedin = this.newSprite('linkedin')
		this.youtube = this.newSprite('youtube')
		this.piece = this.newSprite('piece') // TODO: derived class adds this
		
		this.bevelFilter = new BevelFilter()
		this.asciiSmallFilter = new AsciiFilter({size: 4, replaceColor: true})
		this.asciiFilter = new AsciiFilter({size: 16, replaceColor: true})
		this.bloomFilter = new AdvancedBloomFilter({threshold: 0.1})
		this.glowFilter = new GlowFilter()
		this.dropShadowFilter = new DropShadowFilter()
		
		const maxIterations = 10
		this.julia1 = makeJuliaFilter({maxIterations: maxIterations})
		this.julia2 = makeJuliaFilter({maxIterations: maxIterations})
		this.julia3 = makeJuliaFilter({maxIterations: maxIterations})
		
		this.bloomFilter.resolution = window.devicePixelRatio
		this.glowFilter.resolution = window.devicePixelRatio
		this.bevelFilter.resolution = window.devicePixelRatio
		this.asciiSmallFilter.resolution = window.devicePixelRatio
		this.dropShadowFilter.resolution = window.devicePixelRatio
		this.asciiFilter.resolution = window.devicePixelRatio
		
		if (this.isMobile) {
			this.julia1.resolution = window.devicePixelRatio
			this.julia2.resolution = window.devicePixelRatio
			this.julia3.resolution = window.devicePixelRatio
		}
		
		this.rectangle3.filters = [this.julia3, this.asciiFilter, this.bloomFilter]
		this.rectangle2.filters = [this.julia2, this.asciiFilter, this.bloomFilter]
		this.rectangle1.filters = [this.julia1, this.asciiFilter, this.bloomFilter]
		this.cheese.filters = [this.glowFilter, this.dropShadowFilter]
		this.title1.filters = [this.bloomFilter, this.glowFilter, this.dropShadowFilter]
		this.title2.filters = [this.bloomFilter, this.glowFilter, this.asciiSmallFilter]
		this.slogan1.filters = [this.bevelFilter, this.bloomFilter, this.glowFilter, this.dropShadowFilter]
		this.slogan2.filters = [this.bloomFilter, this.asciiSmallFilter]
		this.piece.filters = [this.bevelFilter, this.glowFilter, this.dropShadowFilter]
		this.facebook.filters = [this.glowFilter, this.dropShadowFilter]
		this.youtube.filters = [this.glowFilter, this.dropShadowFilter]
		this.linkedin.filters = [this.glowFilter, this.dropShadowFilter]
		
		this.dynamicColor1 = makeDynamicColor({
			r: {velocity: 1},
			g: {velocity: 1.5},
			b: {velocity: 4 / 3}
		})
		
		this.dynamicColor2 = makeDynamicColor({
			r: {velocity: 1.5},
			g: {velocity: 4 / 3},
			b: {velocity: 1}
		})
		
		this.dynamicColor3 = makeDynamicColor({
			r: {velocity: 4 / 3},
			g: {velocity: 1},
			b: {velocity: 1.5}
		})
		
		this.dynamicColor4 = makeDynamicColor({
			r: {velocity: 4 / 3},
			g: {velocity: 1.5},
			b: {velocity: 1}
		})
		
		this.dynamicColor1.update(4)
		this.dynamicColor2.update(4)
		this.dynamicColor3.update(4)
		this.dynamicColor4.update(4)
		
		this.onClick(this.title2, () => {
			this.dynamicColor1.update(1)
			this.titleAccel = 8
		})
		
		this.onClick(this.piece, () => {
			this.pieceRotationDirection *= -1
			this.dynamicColor2.update(1)
			this.pieceAccel += 8
		})
		
		this.onClick(this.slogan2, () => {
			this.dynamicColor3.update(1)
			this.sloganAccel = 8
		})
		
		this.onClick(this.facebook, () => this.open('https://www.facebook.com/profile.php?id=61561860844447'))
		this.onClick(this.youtube, () => this.open('https://www.youtube.com/@CodeOnBleu'))
		this.onClick(this.linkedin, () => this.open('https://www.linkedin.com/company/code-on-bleu'))
		this.onClick(this.cheese, () => this.load('../'))
		
		app.renderer.on('resize', () => this.#layout(false))
		this.#layout(true)
		
		app.ticker.add((time) => this.#update(time))
		
		this.init()
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
	
		function position(sprite, x, y, extraScale) {
			extraScale = extraScale == null ? 1 : extraScale
			sprite.scale.set(scale * extraScale)
			sprite.position.set(x, y)
		}
		
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
		
		position(this.title1, centerX, (1 - phi) * centerY)
		position(this.title2, centerX, (1 - phi) * centerY)
		position(this.tmTitle, this.title1.x + this.title1.width / 2 + 80 * scale, this.title1.y - this.title1.height * 0.4)
		position(this.slogan1, centerX, (1 + phi) * centerY, 0.5)
		position(this.slogan2, centerX, (1 + phi) * centerY, 0.5)
		position(this.piece, centerX, centerY)
		position(this.cheese, 90 * scale, 90 * scale, 0.15)
		
		const logoScale = 0.75
		const logoX = 220 * scale * logoScale
		const logoY = screenHeight - 140 * scale * logoScale
		position(this.facebook, centerX - logoX, logoY, 145 / 268 * logoScale)
		position(this.youtube, centerX, logoY, logoScale)
		position(this.linkedin, centerX + logoX, logoY, logoScale)
		
		this.dropShadowFilter.offsetX = 20 * scale
		this.dropShadowFilter.offsetY = 20 * scale
		this.glowFilter.outerStrength = 10 * scale
		this.bloomFilter.blur = 16 * scale
		
		this.layout(screenWidth, screenHeight, centerX, centerY, scale)
	}
	
	layout() {}
	
	#update(time) {
		const dt = time.deltaTime
		
		this.dynamicColor1.update(dt / 100 * (1 + this.titleAccel))
		this.dynamicColor3.update(dt / 100 * (1 + this.sloganAccel))
		this.dynamicColor4.update(dt / 100* (1 + this.pieceAccel))
		this.titleAccel *= 0.99 - 0.001 * dt
		this.sloganAccel *= 0.99 - 0.001 * dt
		
		if (this.julia1) {
			this.juliaTime += 0.04 * dt
			
			this.julia1.resources.testUniforms.uniforms.uTime = this.juliaTime
			this.julia1.resources.testUniforms.uniforms.uRealC = Math.sin(this.juliaTime * 0.2)
			this.julia1.resources.testUniforms.uniforms.UImagC = Math.cos(this.juliaTime * 1.3 * 0.2)
			this.julia1.resources.testUniforms.uniforms.uScreenWidth = this.screenWidth
			this.julia1.resources.testUniforms.uniforms.uScreenHeight = this.screenHeight
			
			const juliaTime2 = this.juliaTime * 1.3
			this.julia2.resources.testUniforms.uniforms.uTime = juliaTime2
			this.julia2.resources.testUniforms.uniforms.uRealC = Math.sin(juliaTime2 * 0.2)
			this.julia2.resources.testUniforms.uniforms.UImagC = Math.cos(juliaTime2 * 1.3 * 0.2)
			this.julia2.resources.testUniforms.uniforms.uScreenWidth = this.screenWidth
			this.julia2.resources.testUniforms.uniforms.uScreenHeight = this.screenHeight
			
			const juliaTime3 = juliaTime2 * 1.3
			this.julia3.resources.testUniforms.uniforms.uTime = juliaTime3
			this.julia3.resources.testUniforms.uniforms.uRealC = Math.sin(juliaTime3 * 0.2)
			this.julia3.resources.testUniforms.uniforms.UImagC = Math.cos(juliaTime3 * 1.3 * 0.2)
			this.julia3.resources.testUniforms.uniforms.uScreenWidth = this.screenWidth
			this.julia3.resources.testUniforms.uniforms.uScreenHeight = this.screenHeight
		}
		
		this.pieceTime += 0.02 * dt * this.pieceRotationDirection * (1 + this.pieceAccel)
		this.piece.scale = ((Math.cos(this.pieceTime) + 1) / 4 + 0.5) * this.scale * 0.8 * (1.4 * Math.sqrt(this.screenHeight / this.screenWidth))
		this.pieceAccel *= 0.99 - 0.01 * dt
		
		this.title1.tint = this.dynamicColor1.get()
		this.title2.tint = this.dynamicColor1.get(Math.PI / 2)
		this.slogan1.tint = this.dynamicColor3.get()
		this.slogan2.tint = this.dynamicColor3.get(Math.PI / 2)
		this.glowFilter.color = this.dynamicColor4.get()
		
		this.update(time, dt)
	}
	
	update(time, dt) {}
}
