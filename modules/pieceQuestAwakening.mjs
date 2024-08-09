// Copyright © 2024 Code on Bleu. All rights reserved.

'use strict'

import {phi} from './util.mjs'
import {Page} from './page.mjs'

export class PieceQuestAwakeningPage extends Page {
	settings = {
		title: 'pieceQuest',
		slogan: 'awakening',
		textures: ['scholar', 'duelist', 'mage', 'cheese', 'comingSoon'],
		tmTitle: true,
		directoryDepth: 2,
		julia: {
			maxIterations: 10
		}
	}
	
	awakeningTime = 0
	awakeningTimeRotationDirection = 1
	
	init() {
		this.cheese = this.newSprite('cheese')
		this.scholar = this.newSprite('scholar')
		
		this.mage = this.newSprite('mage')
		this.duelist = this.newSprite('duelist')
		
		this.addNewStory(
			'In a world where\ngame pieces come to life...',
			'one must rise to the challenge\nof an imminent threat...',
			'Embark on an epic adventure\nto save the world!',
			'Engage in highly\nstrategic gameplay...',
			'relying on your wits\nand creativity for survival.',
			'With abundant character classes\nand unique encounters...',
			'no two games\nare ever the same.',
			'Coming soon!',
			'Genre: RPG, Tactical,\nRougelike, Deckbuilding'
		)
		
		this.comingSoonContainer = this.newContainer(this.frameContainer)
		this.comingSoon1 = this.newSprite('comingSoon', this.comingSoonContainer)
		this.comingSoon2 = this.newSprite('comingSoon', this.comingSoonContainer, this.controller.overlayAlpha)
		
		this.setFilters(this.cheese, 'glow', 'dropShadow')
		this.setFilters(this.scholar, 'glow', 'dropShadow')
		this.setFilters(this.mage, 'bevel', 'glow', 'dropShadow')
		this.setFilters(this.duelist, 'bevel', 'glow', 'dropShadow')
		this.setFilters(this.comingSoon1, 'bevel', 'glow', 'dropShadow')
		this.setFilters(this.comingSoon2, 'asciiSmall')
		
		this.onClick(this.cheese, () => this.loadPage('home'))
		this.onClick(this.scholar, () => this.loadPage('pieceQuest'))
		
		this.onClick(this.comingSoon2, () => {
			this.awakeningTimeRotationDirection *= -1
			this.getDynamicColor(1).update(1)
			this.controller.glowAccel += 8
			this.controller.juliaAccel += 16
		})
	}
	
	layout() {
		this.position(this.cheese, -0.94, -0.87, 0.15)
		this.position(this.scholar, -0.88, -0.87, 0.15)
		
		this.slogan1.scale.set(0.55)
		this.slogan2.scale.set(0.55)
		this.slogan1.y -= 50
		this.slogan2.y -= 50
		
		this.position(this.mage, -0.5, phi, 0.49)
		this.position(this.duelist, 0.5, phi, 0.46)
	}
	
	update(time, dt) {
		this.awakeningTime += 0.02 * dt * this.awakeningTimeRotationDirection * (1 + this.controller.glowAccel)
		this.comingSoonContainer.scale = ((Math.cos(this.awakeningTime) + 1) / 4 + 0.5) * 0.85
		this.comingSoon1.tint = this.getDynamicColor(3).getInt()
		this.comingSoon2.tint = this.getDynamicColor(3).getInt(Math.PI / 2)
	}
}
