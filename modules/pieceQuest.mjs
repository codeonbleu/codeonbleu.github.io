// Copyright © 2024 Code on Bleu. All rights reserved.

'use strict'

import {Page} from './page.mjs'

export class PieceQuestPage extends Page {
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
		
		this.addNewStory(
			'Enter a universe...',
			'where game pieces\ncome to life!',
			'Experience deep gameplay...',
			'in several iterations\nand formats.',
			'Welcome to the\nPiece Quest Saga!',
			'Whether you enjoy\nJRPGs, TRPGs...',
			'SRPGs, CRPGs,\nARPGS, RTSs...',
			'Rougelikes, Sidescrollers,\nDeckbuilders, Auto-battlers...',
			'or other intriguing\ngame formats...',
			'there will be a\nPiece Quest for you!',
			'Beginning with\nPiece Quest: Awakening...',
			'Join now as the\nadventure unfolds!'
		)
		
		this.awakeningContainer = this.newContainer(this.frameContainer)
		this.mage = this.newSprite('mage', this.awakeningContainer)
		this.duelist = this.newSprite('duelist', this.awakeningContainer)
		this.awakening1 = this.newSprite('awakening', this.awakeningContainer)
		this.awakening2 = this.newSprite('awakening', this.awakeningContainer, this.controller.overlayAlpha)
		
		this.setFilters(this.cheese, 'glow', 'dropShadow')
		this.setFilters(this.duelist2, 'glow', 'dropShadow')
		this.setFilters(this.scholar, 'bevel', 'glow', 'dropShadow')
		this.setFilters(this.mage, 'bevel', 'glow', 'dropShadow')
		this.setFilters(this.duelist, 'bevel', 'glow', 'dropShadow')
		this.setFilters(this.awakening1, 'glow', 'dropShadow')
		this.setFilters(this.awakening2, 'bloom', 'glow', 'asciiSmall')
		
		this.onClick(this.cheese, () => this.loadPage('home'))
		this.onClick(this.duelist2, () => this.loadPage('pieceQuestAwakening'))
		
		this.onClick(this.scholar, () => {
			this.scholarRotationDirection *= -1
			this.getDynamicColor(1).update(1)
			this.controller.glowAccel += 8
			this.controller.juliaAccel += 16
		})
		
		this.onClick(this.awakeningContainer, () => this.loadPage('pieceQuestAwakening'))
	}
	
	layout() {
		this.position(this.cheese, -0.94, -0.87, 0.15)
		this.position(this.duelist2, -0.88, -0.87, 0.15)
		
		//this.scholar.y = 100
		
		this.awakeningContainer.scale.set(0.75)
		this.position(this.mage, -0.5, 0, 0.95)
		this.position(this.duelist, 0.5, 0, 0.9)
		
		this.awakening1.y = 100
		this.awakening2.y = this.awakening1.y
		this.awakening1.scale.set(0.75)
		this.awakening2.scale.set(0.75)
	}
	
	update(time, dt) {
		this.scholarTime += 0.02 * dt * this.scholarRotationDirection * (1 + this.controller.glowAccel)
		this.scholar.scale = ((Math.cos(this.scholarTime) + 1) / 4 + 0.5) * 0.8 * (1.4 * Math.sqrt(this.controller.screenHeight / this.controller.screenWidth))
		this.awakening1.tint = this.getDynamicColor(3).getInt()
		this.awakening2.tint = this.getDynamicColor(3).getInt(Math.PI / 2)
	}
}
