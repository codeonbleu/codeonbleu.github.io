import {CodeOnBleuPage} from './codeOnBleuPage.mjs'

class Page extends CodeOnBleuPage {
	layout(screenWidth, screenHeight, centerX, centerY, scale) {
	}
	
	update(time) {
	}
}

await CodeOnBleuPage.init(Page, {
	title: 'pieceQuest',
	slogan: 'comingSoon'
})
