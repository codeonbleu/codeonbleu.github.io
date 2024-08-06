import {Page} from './page.mjs'

Page.launch(class extends Page {
	settings = {
		title: 'pieceQuest',
		slogan: 'epicFranchise',
		textures: ['scholar', 'cheese', 'awakening'],
		tmTitle: true,
		tmSlogan: true
	}
	
	scholarTime = 0
	scholarRotationDirection = 1
	
	init() {
		this.cheese = this.newSprite('cheese')
		this.scholar = this.newSprite('scholar', this.frameContainer)
		
		this.awakeningContainer = this.newContainer(this.frameContainer)
		this.awakening1 = this.newSprite('awakening', this.awakeningContainer)
		this.awakening2 = this.newSprite('awakening', this.awakeningContainer)
		
		this.setFilters(this.cheese, 'glow', 'dropShadow')
		this.setFilters(this.scholar, 'bevel', 'glow', 'dropShadow')
		this.setFilters(this.awakening1, 'bevel', 'bloom', 'glow', 'dropShadow')
		this.setFilters(this.awakening2, 'bevel', 'bloom', 'glow', 'asciiSmall')
		
		this.onClick(this.cheese, () => this.load('../'))
		
		this.onClick(this.scholar, () => {
			this.scholarRotationDirection *= -1
			this.dynamicColor2.update(1)
			this.glowAccel += 8
		})
	}
	
	layout(screenWidth, screenHeight, centerX, centerY, scale) {
		this.position(this.cheese, 90 * scale, 90 * scale, 0.15)
		this.awakening1.scale.set(0.75)
		this.awakening2.scale.set(0.75)
	}
	
	update(time, dt) {
		this.scholarTime += 0.02 * dt * this.scholarRotationDirection * (1 + this.glowAccel)
		this.scholar.scale = ((Math.cos(this.scholarTime) + 1) / 4 + 0.5) * 0.8 * (1.4 * Math.sqrt(this.screenHeight / this.screenWidth))
		this.awakening1.tint = this.dynamicColor4.getInt()
		this.awakening2.tint = this.dynamicColor4.getInt(Math.PI / 2)
	}
})
