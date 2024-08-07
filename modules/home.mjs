// Copyright © 2024 Code on Bleu. All rights reserved.

import {Page} from './page.mjs'

Page.launch(class extends Page {
	settings = {
		title: 'title',
		slogan: 'slogan',
		textures: ['f', 'cheese', 'scholar', 'pieceQuest'],
		tmSlogan: true,
		julia: {
			maxIterations: 10,
			getReal: (time) => 0
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
		
		this.newStory(
			'Code on Bleu was founded with one quest in mind...',
			'To create the games we always wanted to play.',
			'We aspire to create games which\nevoke a sense of wonder and adventure...',
			'contain mystery and secrets galore...',
			'and which feature deep customization\nthrough deceptively complex mechanics.',
			'Through creativity, experimentation, and exploration...',
			'players shall conquer impossible feats\nand discover endless replayability!',
			'Starting with Piece Quest...',
			'Join now as the adventure unfolds!'
		)
		
		this.pieceQuestContainer = this.newContainer(this.frameContainer)
		this.scholar = this.newSprite('scholar', this.pieceQuestContainer)
		this.pieceQuest1 = this.newSprite('pieceQuest', this.pieceQuestContainer)
		this.pieceQuest2 = this.newSprite('pieceQuest', this.pieceQuestContainer)
		
		this.setFilters(this.scholar2, 'glow', 'dropShadow')
		this.setFilters(this.cheese, 'dropShadow')
		this.setFilters(this.func, 'bloom', 'dropShadow')
		this.setFilters(this.scholar, 'bevel', 'glow', 'dropShadow')
		this.setFilters(this.pieceQuest1, 'bloom', 'glow', 'dropShadow')
		this.setFilters(this.pieceQuest2, 'bloom', 'glow', 'asciiSmall')
	
		this.onClick(this.scholar2, () => this.load('/piecequest'))
		this.onClick(this.scholar, () => this.load('/piecequest'))
		this.onClick(this.pieceQuest2, () => this.load('/piecequest'))
		
		this.onClick(this.cheeseContainer, () => {
			this.cheeseRotationDirection *= -1
			this.dynamicColor4.update(1)
			this.cheeseAccel += 8
			this.glowAccel += 8
			this.juliaAccel += 4
		})
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
		
		this.pieceQuest1.tint = this.dynamicColor4.getInt()
		this.pieceQuest2.tint = this.dynamicColor4.getInt(Math.PI / 2)
	}
})
