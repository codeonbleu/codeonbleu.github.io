// Copyright © 2024 Code on Bleu. All rights reserved.

import {Page} from './page.mjs'

Page.launch(class extends Page {
	settings = {
		title: 'title',
		slogan: 'slogan',
		textures: ['f', 'cheese', 'scholar', 'pieceQuest', 'missionStatement'],
		tmSlogan: true,
		julia: {
			maxIterations: 10,
			getReal: (time) => 0,
			filters: Page.isMobile ? ['dot'] : ['dot', 'bloom', 'glow']
		},
		enablePauseKey: true
	}
	
	cheeseRotationDirection = 1
	cheeseAccel = 0
	
	init() {
		this.scholar2 = this.newSprite('scholar')
		
		this.cheeseContainer = this.newContainer(this.frameContainer)
		this.cheese = this.newSprite('cheese', this.cheeseContainer)
		this.func = this.newSprite('f', this.cheeseContainer)
		
		this.missionStatement = this.newSprite('missionStatement', this.frameContainer)
		
		this.pieceQuestContainer = this.newContainer(this.frameContainer)
		this.scholar = this.newSprite('scholar', this.pieceQuestContainer)
		this.pieceQuest = this.newSprite('pieceQuest', this.pieceQuestContainer)
		
		this.setFilters(this.scholar2, 'glow', 'dropShadow')
		this.setFilters(this.cheese, 'dropShadow')
		this.setFilters(this.func, 'bloom', 'dropShadow')
		this.setFilters(this.missionStatement, 'bloom', 'glow', 'dropShadow')
		this.setFilters(this.pieceQuest, 'bloom', 'glow', 'dropShadow')
		this.setFilters(this.scholar, 'bevel', 'dropShadow')
	
		this.onClick(this.scholar2, () => this.load('/piecequest'))
		this.onClick(this.scholar, () => this.load('/piecequest'))
		this.onClick(this.pieceQuest, () => this.load('/piecequest'))
		
		this.onClick(this.cheeseContainer, () => {
			this.cheeseRotationDirection *= -1
			this.dynamicColor4.update(1)
			this.cheeseAccel += 8
			this.glowAccel += 8
			this.juliaAccel += 4
			//this.settings.julia.getReal = this.cheeseRotationDirection === 1 ? (time) => 0 : (time) => Math.sin(time * 0.2)
			//this.settings.julia.getImag = this.cheeseRotationDirection === 1 ? (time) => Math.cos(time * 1.3 * 0.2) : (time) => 0
		})
		
		this.onClick(this.missionStatement, () => {
			this.dynamicColor2.update(1)
			this.glowAccel += 8
		})
	}
	
	layout(screenWidth, screenHeight, centerX, centerY, scale) {
		this.position(this.scholar2, 90 * scale, 100 * scale, 0.15)
		this.func.position.set(-140, 30)
		
		this.missionStatement.y = 30
	}
	
	update(time, dt) {
		this.cheese.tint = this.dynamicColor4.getInt()
		this.cheese.rotation += 0.02 * dt * this.cheeseRotationDirection * (1 + this.cheeseAccel)
		this.cheese.scale = ((Math.cos(this.cheese.rotation) + 1) / 4 + 0.5)
		this.cheeseAccel *= 0.99 - 0.01 * dt
		
		this.pieceQuest.tint = this.dynamicColor4.getInt()
		this.missionStatement.tint = this.dynamicColor4.getInt()
	}
})
