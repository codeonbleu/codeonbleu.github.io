// Copyright © 2024 Code on Bleu. All rights reserved.

'use strict'

import {Page} from './page.mjs'

export class HomePage extends Page {
	settings = {
		title: 'title',
		slogan: 'slogan',
		textures: ['f', 'pieceQuest'],
		tmSlogan: true,
		julia: {
			maxIterations: 10,
			getReal: (time) => 0
		},
		ui: [
			{texture: 'scholar', page: 'pieceQuest'}
		],
		story: [
			'Code on Bleu\nwas founded...',
			'with one quest\nin mind...',
			'To create the games\nwe always wanted\nto play.',
			'We aspire to create\ngames which...',
			'evoke a sense of wonder\nand adventure...',
			'contain mystery\nand secrets galore...',
			'feature deep\ncustomization...',
			'and deceptively\ncomplex mechanics.',
			'Through creativity...',
			'experimentation...',
			'and exploration...',
			'players shall conquer\nimpossible feats...',
			'and discover endless\nreplayability!',
			'Starting with the\nPiece Quest Saga...',
			'follow now as the\nadventure unfolds!'
		]
	}
	
	cheeseRotationDirection = 1
	cheeseAccel = 0
	
	init() {
		this.cheeseContainer = this.newContainer(this.frameContainer)
		this.cheese = this.newSprite('cheese', this.cheeseContainer)
		this.func = this.newSprite('f', this.cheeseContainer)
		
		this.addStory()
		
		this.pieceQuestContainer = this.newContainer(this.frameContainer)
		this.scholar = this.newSprite('scholar', this.pieceQuestContainer)
		this.pieceQuest1 = this.newSprite('pieceQuest', this.pieceQuestContainer)
		this.pieceQuest2 = this.newSprite('pieceQuest', this.pieceQuestContainer)
		
		this.setFilters(this.cheese, 'dropShadow')
		this.setFilters(this.func, 'bloom', 'dropShadow')
		this.setFilters(this.scholar, 'glow', 'dropShadow')
		this.setFilters(this.pieceQuest1, 'glow', 'dropShadow')
		this.setFilters(this.pieceQuest2, 'bloom', 'glow', 'asciiSmall')
	
		this.onClick(this.pieceQuestContainer, () => this.loadPage('pieceQuest'))
		
		this.onClick(this.cheeseContainer, () => {
			this.cheeseRotationDirection *= -1
			this.getDynamicColor(3).update(1)
			this.cheeseAccel += 8
			this.controller.glowAccel += 8
			this.controller.juliaAccel += 4
		})
	}
	
	layout(screenWidth, screenHeight, centerX, centerY, isHorizontalDisplay) {
		if (isHorizontalDisplay) {
			this.func.position.set(-70, 50)
			this.cheese.position.set(70, 20)
		} else {
			this.func.position.set(-70, 0)
			this.cheese.position.set(70, -30)
		}
		
		this.title1.scale.set(0.85)
		this.title2.scale.set(0.85)
		this.slogan1.scale.set(isHorizontalDisplay ? 0.85 : 1)
		this.slogan2.scale.set(isHorizontalDisplay ? 0.85 : 1)
		this.tmSlogan.position.set(this.slogan1.x + this.slogan1.width / 2 + 80, this.slogan1.y - this.slogan1.height * 0.4)
		
		this.pieceQuestContainer.scale.set(0.8)
		
		if (isHorizontalDisplay) {
			this.pieceQuestContainer.y = 40
		}
	}
	
	update(time, dt) {
		this.title2.alpha = 1
		
		this.cheese.tint = this.getDynamicColor(3).getInt()
		this.cheese.rotation += 0.02 * dt * this.cheeseRotationDirection * (1 + this.cheeseAccel)
		this.cheese.scale = ((Math.cos(this.cheese.rotation) + 1) / 4 + 0.5)
		this.cheeseAccel *= 0.99 - 0.01 * dt
		
		this.pieceQuest1.tint = this.getDynamicColor(3).getInt()
		this.pieceQuest2.tint = this.getDynamicColor(3).getInt(Math.PI / 2)
	}
}
