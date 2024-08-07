// Copyright © 2024 Code on Bleu. All rights reserved.

import {Page} from './page.mjs'

Page.launch(class extends Page {
	settings = {
		title: 'pieceQuest',
		slogan: 'comingSoon',
		textures: ['scholar', 'duelist', 'mage', 'cheese', 'awakening', 'awakeningDescription'],
		tmTitle: true,
		directoryDepth: 2
	}
	
	awakeningTime = 0
	awakeningTimeRotationDirection = 1
	
	init() {
		this.cheese = this.newSprite('cheese')
		this.scholar = this.newSprite('scholar')
		
		this.awakeningContainer = this.newContainer(this.frameContainer)
		this.mage = this.newSprite('mage', this.awakeningContainer)
		this.duelist = this.newSprite('duelist', this.awakeningContainer)
		this.awakening1 = this.newSprite('awakening', this.awakeningContainer)
		this.awakening2 = this.newSprite('awakening', this.awakeningContainer)
		
		this.awakeningDescription = this.newSprite('awakeningDescription', this.frameContainer)
		
		this.setFilters(this.cheese, 'glow', 'dropShadow')
		this.setFilters(this.scholar, 'glow', 'dropShadow')
		this.setFilters(this.mage, 'bevel', 'dropShadow')
		this.setFilters(this.duelist, 'bevel', 'dropShadow')
		this.setFilters(this.awakening1, 'bevel', 'bloom', 'glow', 'dropShadow')
		this.setFilters(this.awakening2, 'bevel', 'bloom', 'glow', 'asciiSmall')
		this.setFilters(this.awakeningDescription, 'bloom', 'glow', 'dropShadow')
		
		this.onClick(this.cheese, () => this.load('../../'))
		this.onClick(this.scholar, () => this.load('../'))
		
		this.onClick(this.awakeningContainer, () => {
			this.awakeningTimeRotationDirection *= -1
			this.dynamicColor2.update(1)
			this.glowAccel += 8
		})
		
		this.onClick(this.awakeningDescription, () => {
			this.dynamicColor2.update(1)
			this.glowAccel += 8
		})
	}
	
	layout(screenWidth, screenHeight, centerX, centerY, scale) {
		this.position(this.cheese, 90 * scale, 100 * scale, 0.15)
		this.position(this.scholar, 250 * scale, 90 * scale, 0.15)
		
		this.mage.x = -this.awakening1.width / 2 - 10
		this.mage.y = 50
		this.mage.scale.set(0.95)
		
		this.duelist.x = this.awakening1.width / 2 + 10
		this.duelist.y = 50
		this.duelist.scale.set(0.9)
		
		this.awakening1.y = 100
		this.awakening2.y = this.awakening1.y
		this.awakening1.scale.set(0.75)
		this.awakening2.scale.set(0.75)
		
		this.awakeningDescription.scale.set(0.8 * (1.3 * Math.sqrt(screenHeight / screenWidth)))
		this.awakeningDescription.y = 65
		
		this.slogan1.scale.set(this.scale * 0.5)
		this.slogan2.scale.set(this.scale * 0.5)
	}
	
	update(time, dt) {
		this.awakeningTime += 0.02 * dt * this.awakeningTimeRotationDirection * (1 + this.glowAccel)
		this.awakeningContainer.scale = ((Math.cos(this.awakeningTime) + 1) / 4 + 0.5) * 0.85
		this.awakening1.tint = this.dynamicColor4.getInt()
		this.awakening2.tint = this.dynamicColor4.getInt(Math.PI / 2)
		
		this.awakeningDescription.tint = this.dynamicColor4.getInt()
	}
})
