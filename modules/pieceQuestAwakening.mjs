// Copyright © 2024 Code on Bleu. All rights reserved.

import {Page} from './page.mjs'

Page.launch(class extends Page {
	settings = {
		title: 'pieceQuest',
		slogan: 'awakening',
		textures: ['scholar', 'duelist', 'mage', 'cheese', 'comingSoon', 'awakeningDescription'],
		tmTitle: true,
		directoryDepth: 2
	}
	
	awakeningTime = 0
	awakeningTimeRotationDirection = 1
	
	init() {
		this.cheese = this.newSprite('cheese')
		this.scholar = this.newSprite('scholar')
		
		this.mage = this.newSprite('mage')
		this.duelist = this.newSprite('duelist')
		
		this.comingSoonContainer = this.newContainer(this.frameContainer)
		this.comingSoon1 = this.newSprite('comingSoon', this.comingSoonContainer)
		this.comingSoon2 = this.newSprite('comingSoon', this.comingSoonContainer, Page.overlayAlpha)
		
		this.awakeningDescription = this.newSprite('awakeningDescription', this.frameContainer)
		
		this.setFilters(this.cheese, 'glow', 'dropShadow')
		this.setFilters(this.scholar, 'glow', 'dropShadow')
		this.setFilters(this.mage, 'bevel', 'glow', 'dropShadow')
		this.setFilters(this.duelist, 'bevel', 'glow', 'dropShadow')
		this.setFilters(this.comingSoon1, 'bevel', 'glow', 'dropShadow')
		this.setFilters(this.comingSoon2, 'asciiSmall')
		this.setFilters(this.awakeningDescription, 'bloom', 'glow', 'dropShadow')
		
		this.onClick(this.cheese, () => this.load('../../'))
		this.onClick(this.scholar, () => this.load('../'))
		
		this.onClick(this.comingSoon2, () => {
			this.awakeningTimeRotationDirection *= -1
			this.dynamicColor2.update(1)
			this.glowAccel += 8
			this.juliaAccel += 16
		})
		
		this.onClick(this.awakeningDescription, () => {
			this.dynamicColor2.update(1)
			this.glowAccel += 8
		})
	}
	
	layout(screenWidth, screenHeight, centerX, centerY, scale) {
		this.position(this.cheese, 90 * scale, 100 * scale, 0.15)
		this.position(this.scholar, 250 * scale, 90 * scale, 0.15)
		
		this.awakeningDescription.scale.set(0.8 * (1.3 * Math.sqrt(screenHeight / screenWidth)))
		
		this.slogan1.scale.set(this.scale * 0.4)
		this.slogan2.scale.set(this.scale * 0.4)
		
		this.position(this.mage, centerX - this.slogan1.width / 2 - 180 * scale, this.slogan1.y - 30 * scale, 0.45)
		this.position(this.duelist, centerX + this.slogan1.width / 2 + 180 * scale, this.slogan1.y - 30 * scale, 0.43)
	}
	
	update(time, dt) {
		this.awakeningTime += 0.02 * dt * this.awakeningTimeRotationDirection * (1 + this.glowAccel)
		this.comingSoonContainer.scale = ((Math.cos(this.awakeningTime) + 1) / 4 + 0.5) * 0.85
		this.comingSoon1.tint = this.dynamicColor4.getInt()
		this.comingSoon2.tint = this.dynamicColor4.getInt(Math.PI / 2)
		
		this.awakeningDescription.tint = this.dynamicColor4.getInt()
	}
})
