import {Page} from './page.mjs'

Page.launch(class extends Page {
	settings = {
		title: 'title',
		slogan: 'slogan',
		textures: ['f', 'cheese', 'scholar', 'pieceQuest'],
		tmSlogan: true
	}
	
	cheeseRotationDirection = 1
	cheeseAccel = 0
	
	init() {
		this.scholar2 = this.newSprite('scholar')
		
		this.cheeseContainer = this.newContainer(this.frameContainer)
		this.cheese = this.newSprite('cheese', this.cheeseContainer)
		this.func = this.newSprite('f', this.cheeseContainer)
		
		this.pieceQuestContainer = this.newContainer(this.frameContainer)
		this.scholar = this.newSprite('scholar', this.pieceQuestContainer)
		this.pieceQuest = this.newSprite('pieceQuest', this.pieceQuestContainer)
		
		this.setFilters(this.scholar2, 'glow', 'dropShadow')
		this.setFilters(this.cheese, 'dropShadow')
		this.setFilters(this.func, 'bloom', 'dropShadow')
		this.setFilters(this.pieceQuest, 'bloom', 'glow', 'dropShadow')
		this.setFilters(this.scholar, 'bevel', 'dropShadow')
	
		this.onClick(this.scholar2, () => this.load('/piecequest'))
		this.onClick(this.scholar, () => this.load('/piecequest'))
		this.onClick(this.pieceQuest, () => this.load('/piecequest'))
		
		const spinCheese = () => {
			this.cheeseRotationDirection *= -1
			this.dynamicColor4.update(1)
			this.cheeseAccel += 8
			this.glowAccel += 8
		}
		
		this.onClick(this.cheese, spinCheese)
		this.onClick(this.func, spinCheese)
	}
	
	layout(screenWidth, screenHeight, centerX, centerY, scale) {
		this.position(this.scholar2, 90 * scale, 100 * scale, 0.15)
		this.func.position.set(-140, 30)
	}
	
	update(time, dt) {
		this.cheese.tint = this.dynamicColor4.getInt()
		this.cheese.rotation += 0.02 * dt * this.cheeseRotationDirection * (1 + this.cheeseAccel)
		this.cheese.scale = ((Math.cos(this.cheese.rotation) + 1) / 4 + 0.5)
		this.cheeseAccel *= 0.99 - 0.01 * dt
		
		this.pieceQuest.tint = this.dynamicColor4.getInt()
	}
})
