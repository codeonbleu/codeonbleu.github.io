// Copyright © 2024 Code on Bleu. All rights reserved.

'use strict'

import {phi} from './util.mjs'
import {Page} from './page.mjs'

export class PieceQuestAwakeningPage extends Page {
	settings = {
		title: 'pieceQuest',
		slogan: 'awakening',
		textures: ['duelist', 'mage', 'comingSoon'],
		tmTitle: true,
		directoryDepth: 2,
		julia: {
			maxIterations: 10
		},
		ui: [
			{texture: 'cheese', page: 'home'},
			{texture: 'scholar', page: 'pieceQuest'}
		],
		story: [
			'In a world where\ngame pieces come\nto life...',
			'one must rise\nto the challenge\nof an imminent threat.',
			'Embark on an epic\nadventure to\nsave the world!',
			'Engage in highly\nstrategic gameplay...',
			'relying on your wits\nand creativity\nfor survival.',
			'With abundant\ncharacter classes',
			'and unique\nencounters...',
			'no two games\nare ever the same.',
			'Coming soon!',
			'Genre: RPG,\nTactical,\nRougelike,\nDeckbuilding'
		]
	}
	
	awakeningTime = 0
	awakeningTimeRotationDirection = 1
	
	init() {
		this.mage = this.newSprite('mage')
		this.duelist = this.newSprite('duelist')
		
		this.addStory()
		
		this.comingSoonContainer = this.newContainer(this.frameContainer)
		this.comingSoon1 = this.newSprite('comingSoon', this.comingSoonContainer)
		this.comingSoon2 = this.newSprite('comingSoon', this.comingSoonContainer, this.controller.overlayAlpha)
		
		this.setFilters(this.mage, 'bevel', 'glow', 'dropShadow')
		this.setFilters(this.duelist, 'bevel', 'glow', 'dropShadow')
		this.setFilters(this.comingSoon1, 'bevel', 'glow', 'dropShadow')
		this.setFilters(this.comingSoon2, 'asciiSmall')
		
		this.onClick(this.comingSoon2, () => {
			this.awakeningTimeRotationDirection *= -1
			this.getDynamicColor(1).update(1)
			this.controller.glowAccel += 8
			this.controller.juliaAccel += 16
		})
	}
	
	layout(screenWidth, screenHeight, centerX, centerY, isHorizontalDisplay) {
		for (const slogan of [this.slogan1, this.slogan2]) {
			slogan.y -= 50
			
			this.controller.arrangeUi({
				align: 'center',
				y: slogan.y,
				spacing: isHorizontalDisplay ? 50 : 50,
				scale: isHorizontalDisplay ? 1 : 1.15,
				elements: [
					[this.mage, 0.49],
					[slogan, 0.55],
					[this.duelist, 0.46]
				]
			})
		}
	}
	
	update(time, dt) {
		this.awakeningTime += 0.02 * dt * this.awakeningTimeRotationDirection * (1 + this.controller.glowAccel)
		this.comingSoonContainer.scale = ((Math.cos(this.awakeningTime) + 1) / 4 + 0.5) * 0.85
		this.comingSoon1.tint = this.getDynamicColor(3).getInt()
		this.comingSoon2.tint = this.getDynamicColor(3).getInt(Math.PI / 2)
	}
}
