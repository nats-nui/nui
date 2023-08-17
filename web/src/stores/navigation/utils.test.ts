import { setParams } from "./utils"
//const { setParams } = require('./index');


describe("setParams", () => {
	it("setto un parametro e lo sostituisco", () => {
		const result = setParams(["param1", "value1"], "param2=vale2&param1=xxx")
		const expected = "param2=vale2&param1=value1"
		expect(result).toBe(expected)
	})
	it("setto un parametro e lo cancello", () => {
		const result = setParams(["param1", null], "param2=vale2&param1=xxx")
		const expected = "param2=vale2"
		expect(result).toBe(expected)
	})
})

