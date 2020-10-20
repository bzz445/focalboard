// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Block} from './blocks/block'
import {Card} from './blocks/card'
import octoClient from './octoClient'
import {IBlock, IOrderedBlock} from './octoTypes'
import {OctoUtils} from './octoUtils'

interface CardTree {
	readonly card: Card
	readonly comments: readonly IBlock[]
	readonly contents: readonly IOrderedBlock[]
}

class MutableCardTree implements CardTree {
	card: Card
	comments: IBlock[]
	contents: IOrderedBlock[]

	constructor(private cardId: string) {
	}

	async sync() {
		const blocks = await octoClient.getSubtree(this.cardId)
		this.rebuild(OctoUtils.hydrateBlocks(blocks))
	}

	private rebuild(blocks: Block[]) {
		this.card = blocks.find(o => o.id === this.cardId) as Card

		this.comments = blocks
			.filter(block => block.type === "comment")
			.sort((a, b) => a.createAt - b.createAt)

		const contentBlocks = blocks.filter(block => block.type === "text" || block.type === "image") as IOrderedBlock[]
		this.contents = contentBlocks.sort((a, b) => a.order - b.order)
	}
}

export { MutableCardTree, CardTree }
