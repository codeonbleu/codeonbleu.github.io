import {Page} from './page.mjs'

Page.launch(class extends Page {
	settings = {
		title: 'pieceQuest',
		slogan: 'comingSoon'
	}
	
	init() {}
	layout(screenWidth, screenHeight, centerX, centerY, scale) {}
	update(time) {}
})
