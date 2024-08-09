// Copyright © 2024 Code on Bleu. All rights reserved.

'use strict'

import {PageController} from './pageController.mjs'
import {HomePage} from './home.mjs'
import {PieceQuestPage} from './pieceQuest.mjs'
import {PieceQuestAwakeningPage} from './pieceQuestAwakening.mjs'

function getPageKeyFromSearchParams() {
	const params = new URL(document.location.toString()).searchParams
	return params.get('key')
}

const pageController = new PageController({
	home: HomePage,
	piecequest: PieceQuestPage,
	piecequestawakening: PieceQuestAwakeningPage
})

pageController.init(getPageKeyFromSearchParams())
