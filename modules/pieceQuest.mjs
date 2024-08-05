import {Application, Assets, Graphics, Sprite, SCALE_MODES, Texture} from './pixi.min.mjs'
import {AdvancedBloomFilter, BevelFilter, GlowFilter, AsciiFilter, DropShadowFilter} from './pixi-filters.mjs'
import {tau, phi, makeDynamicColor, checkMobile, openInNewTab} from './util.mjs'
import {makeJuliaFilter} from './shaders/julia.mjs'

(async () => {
    const app = new Application()
	
    await app.init({
		background: '#111111',
		resizeTo: window,
		antialias: true
	})
	
    document.body.appendChild(app.canvas)
	
	const textures = {}
	
	for (const key of ['TM', 'cheese', 'facebook', 'linkedin', 'youtube', 'piece', 'pieceQuest', 'comingSoon']) {
		const texture = await Assets.load('../media/' + key + '.png')
		texture.source.antialias = true
		texture.source.scaleMode = SCALE_MODES.LINEAR
		textures[key] = texture
	}
	
	textures.white = Texture.WHITE
	
	const isMobile = checkMobile()
	
	const newSprite = (textureKey, alpha) => {
		const result = new Sprite(textures[textureKey])
		result.anchor.set(0.5)
		result.alpha = alpha == null ? 1 : alpha
		app.stage.addChild(result)
		return result
	}
	
	const newGraphics = () => {
		const result = new Graphics()
		app.stage.addChild(result)
		return result
	}
	
	const rectangle3 = newGraphics()
	const rectangle2 = newGraphics()
	const rectangle1 = newGraphics()
	const cheese = newSprite('cheese')
    const title1 = newSprite('pieceQuest')
    const title2 = newSprite('pieceQuest')
	const slogan1 = newSprite('comingSoon')
	const slogan2 = newSprite('comingSoon')
	const tmTitle = newSprite('TM', 0.125)
	const facebook = newSprite('facebook')
	const linkedin = newSprite('linkedin')
	const youtube = newSprite('youtube')
	const piece = newSprite('piece')
	
	const onClick = (object, callback) => {
		object.eventMode = 'static'
		object.cursor = 'pointer'
		object.on('pointerdown', callback)
	}
	
	let scale = 0
	
	function layout() {
		const screenWidth = app.screen.width
		const screenHeight = app.screen.height
		const centerX = screenWidth / 2
		const centerY = screenHeight / 2
		
		if (screenWidth >= screenHeight) {
			scale = screenHeight / 2048
		} else {
			scale = 0.85 * screenWidth / textures.pieceQuest.width
		}
	
		function position(sprite, x, y, extraScale) {
			extraScale = extraScale == null ? 1 : extraScale
			sprite.scale.set(scale * extraScale)
			sprite.position.set(x, y)
		}
		
		for (const rectangle of [rectangle1, rectangle2, rectangle3]) {
			rectangle.clear()
			rectangle.rect(0, 0, screenWidth, screenHeight).fill(0x060606)
		}
		
		const titleF = phi + 0.05
		
		position(title1, centerX, (1 - phi) * centerY)
		position(title2, centerX, (1 - phi) * centerY)
		//title2.visible = false
		position(tmTitle, title1.x + title1.width / 2 + 60 * scale, title1.y - title1.height * 0.3)
		position(slogan1, centerX, (1 + phi) * centerY, 0.5)
		position(slogan2, centerX, (1 + phi) * centerY, 0.5)
		position(piece, centerX, centerY)
		position(cheese, 90 * scale, 90 * scale, 0.15)
		
		const logoScale = 0.75
		const logoX = 220 * scale * logoScale
		const logoY = screenHeight - 140 * scale * logoScale
		position(facebook, centerX - logoX, logoY, 145 / 268 * logoScale)
		position(youtube, centerX, logoY, logoScale)
		position(linkedin, centerX + logoX, logoY, logoScale)
	}
	
	app.renderer.on('resize', layout)
	layout()
	
	let mouseX = 0, mouseY = 0
	
	app.stage.eventMode = 'static'
	app.stage.hitArea = app.screen
	
	app.stage.addEventListener('pointermove', (e) => {
		mouseX = e.global.x
		mouseY = e.global.y
    })
	
	const bloomFilter = new AdvancedBloomFilter({threshold: 0.1})
	const glowFilter = new GlowFilter()
	const bevelFilter = new BevelFilter()
	const asciiSmallFilter = new AsciiFilter({size: 4, replaceColor: true})
	const asciiFilter = new AsciiFilter({size: 16, replaceColor: true})
	const dropShadowFilter = new DropShadowFilter({offsetX: 10, offsetY: 10})
	
	const maxIterations = 10
	const julia1 = makeJuliaFilter({maxIterations: maxIterations})
	const julia2 = makeJuliaFilter({maxIterations: maxIterations})
	const julia3 = makeJuliaFilter({maxIterations: maxIterations})
	
	rectangle3.filters = [julia3, asciiFilter, bloomFilter]
	rectangle2.filters = [julia2, asciiFilter, bloomFilter]
	rectangle1.filters = [julia1, asciiFilter, bloomFilter]
	cheese.filters = [glowFilter, dropShadowFilter]
	title1.filters = [bloomFilter, glowFilter, dropShadowFilter]
	title2.filters = [bloomFilter, glowFilter, asciiSmallFilter]
	slogan1.filters = [bevelFilter, bloomFilter, glowFilter, dropShadowFilter]
	slogan2.filters = [bloomFilter, asciiSmallFilter]
	piece.filters = [bevelFilter, glowFilter, dropShadowFilter]
	facebook.filters = [glowFilter, dropShadowFilter]
	youtube.filters = [glowFilter, dropShadowFilter]
	linkedin.filters = [glowFilter, dropShadowFilter]
	
	const dynamicColor1 = makeDynamicColor({
		r: {velocity: 1},
		g: {velocity: 1.5},
		b: {velocity: 4 / 3}
	})
	
	const dynamicColor2 = makeDynamicColor({
		r: {velocity: 1.5},
		g: {velocity: 4 / 3},
		b: {velocity: 1}
	})
	
	const dynamicColor3 = makeDynamicColor({
		r: {velocity: 4 / 3},
		g: {velocity: 1},
		b: {velocity: 1.5}
	})
	
	const dynamicColor4 = makeDynamicColor({
		r: {velocity: 4 / 3},
		g: {velocity: 1.5},
		b: {velocity: 1}
	})
	
	dynamicColor1.update(4)
	dynamicColor2.update(4)
	dynamicColor3.update(4)
	dynamicColor4.update(4)
	
	let juliaTime = 40
	let pieceRotationDirection = 1
	let pieceAccel = 0
	let titleAccel = 0
	let sloganAccel = 0
	let pieceTime = 0
	
	onClick(title1, () => {
		dynamicColor1.update(1)
		titleAccel = 8
	})
	
	onClick(piece, () => {
		pieceRotationDirection *= -1
		dynamicColor2.update(1)
		pieceAccel += 8
	})
	
	onClick(slogan2, () => {
		dynamicColor3.update(1)
		sloganAccel = 8
	})
	
	onClick(facebook, () => openInNewTab('https://www.facebook.com/profile.php?id=61561860844447'))
	onClick(youtube, () => openInNewTab('https://www.youtube.com/@CodeOnBleu'))
	onClick(linkedin, () => openInNewTab('https://www.linkedin.com/company/code-on-bleu'))
	onClick(cheese, () => window.location.href = '../')
	
	app.ticker.add((time) => {
		const dt = time.deltaTime
		
		dynamicColor1.update(dt / 100 * (1 + titleAccel))
		dynamicColor2.update(dt / 100 * (1 + piece.Accel))
		dynamicColor3.update(dt / 100 * (1 + sloganAccel))
		dynamicColor4.update(dt / 100)
		titleAccel *= 0.99 - 0.001 * dt
		sloganAccel *= 0.99 - 0.001 * dt
		
		if (julia1) {
			juliaTime += 0.04 * dt
			
			julia1.resources.testUniforms.uniforms.uTime = juliaTime
			julia1.resources.testUniforms.uniforms.uRealC = Math.sin(juliaTime * 0.2)
			julia1.resources.testUniforms.uniforms.UImagC = Math.cos(juliaTime * 1.3 * 0.2)
			julia1.resources.testUniforms.uniforms.uScreenWidth = app.screen.width
			julia1.resources.testUniforms.uniforms.uScreenHeight = app.screen.height
			
			const juliaTime2 = juliaTime * 1.3
			julia2.resources.testUniforms.uniforms.uTime = juliaTime2
			julia2.resources.testUniforms.uniforms.uRealC = Math.sin(juliaTime2 * 0.2)
			julia2.resources.testUniforms.uniforms.UImagC = Math.cos(juliaTime2 * 1.3 * 0.2)
			julia2.resources.testUniforms.uniforms.uScreenWidth = app.screen.width
			julia2.resources.testUniforms.uniforms.uScreenHeight = app.screen.height
			
			const juliaTime3 = juliaTime2 * 1.3
			julia3.resources.testUniforms.uniforms.uTime = juliaTime3
			julia3.resources.testUniforms.uniforms.uRealC = Math.sin(juliaTime3 * 0.2)
			julia3.resources.testUniforms.uniforms.UImagC = Math.cos(juliaTime3 * 1.3 * 0.2)
			julia3.resources.testUniforms.uniforms.uScreenWidth = app.screen.width
			julia3.resources.testUniforms.uniforms.uScreenHeight = app.screen.height
		}
		
		pieceTime += 0.02 * dt * pieceRotationDirection * (1 + pieceAccel)
		piece.scale = ((Math.cos(pieceTime) + 1) / 4 + 0.5) * scale * 0.8
		pieceAccel *= 0.99 - 0.01 * dt
		
		title1.tint = dynamicColor1.get()
		title2.tint = dynamicColor1.get(Math.PI / 2)
		//piece.tint = dynamicColor2.get()
		slogan1.tint = dynamicColor3.get()
		slogan2.tint = dynamicColor3.get(Math.PI / 2)
		glowFilter.color = dynamicColor4.get()
	})
})()
