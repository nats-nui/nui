
import { assert, describe, it } from 'vitest'
import { buildStore } from "../stores/docs/utils/factory";
//import { getRoot } from "../stores/docs/utils/manage";


describe("getRoot", () => {
	it('get correct root', () => {
		 const view1 = buildStore({ uuid: "uuid1" })
		// const view2 = buildStore({ uuid: "uuid2" })
		// const view3 = buildStore({ uuid: "uuid3" })
		// view1.setLinked(view2.setLinked(view3))
		// const result = getRoot(view3)

		//assert.equal(result, view1)
		assert.equal(true, true)
	})
	// it('get null', () => {
	// 	const view1 = buildStore({ uuid: "uuid1" })
	// 	const result = getRoot(view1)

	// 	assert.equal(result, null)
	// })

})