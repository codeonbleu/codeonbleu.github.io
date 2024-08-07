// Copyright © 2024 Code on Bleu. All rights reserved.

import {Page} from './page.mjs'

Page.launch(class extends Page {
	settings = {
		title: 'pieceQuest',
		slogan: 'epicFranchise',
		textures: ['scholar', 'duelist', 'mage', 'cheese', 'awakening'],
		tmTitle: true,
		tmSlogan: true,
		julia: {
			maxIterations: 20
		}
	}
	
	scholarTime = 0
	scholarRotationDirection = 1
	
	init() {
		this.cheese = this.newSprite('cheese')
		this.duelist2 = this.newSprite('duelist')
		
		this.scholar = this.newSprite('scholar', this.frameContainer)
		
		this.newStory(
			'Enter a universe...',
			'where game pieces come to life!',
			'Experience deep gameplay...',
			'in several iterations and formats.',
			'Welcome to the Piece Quest Saga!',
			'Whether you enjoy JRPGs, TRPGs...',
			'SRPGs, CRPGs, ARPGS, RTSs...',
			'Rougelikes, Sidescrollers, Deckbuilders, Auto-battlers,\nor other intriguing game formats...',
			'there will be a Piece Quest for you!',
			'Beginning with Piece Quest: Awakening...',
			'Join now as the adventure unfolds!'
		)
		
		this.awakeningContainer = this.newContainer(this.frameContainer)
		this.mage = this.newSprite('mage', this.awakeningContainer)
		this.duelist = this.newSprite('duelist', this.awakeningContainer)
		this.awakening1 = this.newSprite('awakening', this.awakeningContainer)
		this.awakening2 = this.newSprite('awakening', this.awakeningContainer, Page.overlayAlpha)
		
		this.setFilters(this.cheese, 'glow', 'dropShadow')
		this.setFilters(this.duelist2, 'glow', 'dropShadow')
		this.setFilters(this.scholar, 'bevel', 'glow', 'dropShadow')
		this.setFilters(this.mage, 'bevel', 'glow', 'dropShadow')
		this.setFilters(this.duelist, 'bevel', 'glow', 'dropShadow')
		this.setFilters(this.awakening1, 'glow', 'dropShadow')
		this.setFilters(this.awakening2, 'bloom', 'glow', 'asciiSmall')
		
		this.onClick(this.cheese, () => this.load('../'))
		
		this.onClick(this.scholar, () => {
			this.scholarRotationDirection *= -1
			this.dynamicColor2.update(1)
			this.glowAccel += 8
			this.juliaAccel += 16
		})
		
		this.onClick(this.duelist2, () => this.load('awakening/'))
		this.onClick(this.mage, () => this.load('awakening/'))
		this.onClick(this.duelist, () => this.load('awakening/'))
		this.onClick(this.awakening2, () => this.load('awakening/'))
	}
	
	layout(screenWidth, screenHeight, centerX, centerY, scale) {
		this.position(this.cheese, 90 * scale, 100 * scale, 0.15)
		this.position(this.duelist2, 250 * scale, 90 * scale, 0.15)
		
		//this.scholar.y = 100
		
		this.awakeningContainer.scale.set(0.75)
		
		this.mage.x = -this.textures.awakening.width / 2 - 10
		this.mage.y = 50
		this.mage.scale.set(0.95)
		
		this.duelist.x = this.textures.awakening.width / 2 + 10
		this.duelist.y = 50
		this.duelist.scale.set(0.9)
		//this.duelist.scale.x = -this.duelist.scale.x
		
		this.awakening1.y = 100
		this.awakening2.y = this.awakening1.y
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
