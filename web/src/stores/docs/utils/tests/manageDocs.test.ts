import { Entity, DocView, POSITION_TYPE } from "@/types";
import { aggregate, disgregate, getById } from "../manage";


describe('aggregate', () => {
	test('should handle empty input', () => {
		const docs: Entity[] = [];
		const result = aggregate(docs);
		expect(result).toEqual([]);
	});

	test('should aggregate docs correctly', () => {
		const docs: Entity[] = [
			{ uuid: '1', position: POSITION_TYPE.DETACHED },
			{ uuid: '2', position: POSITION_TYPE.STACKED },
			{ uuid: '3', position: POSITION_TYPE.LINKED },
			{ uuid: '4', position: POSITION_TYPE.DETACHED },
		];
		const result = aggregate(docs);
		const expected = [
			{
				doc: { uuid: "1", position: "dtc" },
				stacked: [
					{ doc: { uuid: "2", position: "stk" } }
				],
				linked: {
					doc: { uuid: "3", position: "lnk" }
				},
			},
			{
				doc: { uuid: "4", position: "dtc" },
				stacked: [],
				linked: null,
			},
		]
		expect(result).toEqual(expected)
	});
});

describe('disgregate', () => {

	test('should handle empty input', () => {
		const docsView: DocView[] = [];
		const result = disgregate(docsView);
		expect(result).toEqual([]);
	});

	test('should disgregate docs correctly', () => {
		const docsView: DocView[] = [
			{
				doc: { uuid: '1', position: POSITION_TYPE.DETACHED },
				stacked: [
					{ doc: { uuid: '2', position: POSITION_TYPE.STACKED } },
				],
				linked: {
					doc: { uuid: '3', position: POSITION_TYPE.LINKED },
				},
			},
			{
				doc: { uuid: '4', position: POSITION_TYPE.DETACHED },
				stacked: [],
				linked: null,
			},
		]
		const result = disgregate(docsView);
		const expected = [
			{ uuid: "1", position: "dtc", },
			{ uuid: "2", position: "stk", },
			{ uuid: "3", position: "lnk", },
			{ uuid: "4", position: "dtc", },
		]
		expect(result).toEqual(expected);
	});
});

describe('getById', () => {
	test('should return null for empty input', () => {
		const docsView: DocView[] = [];
		const id = '1';
		const result = getById(docsView, id);
		expect(result).toBeNull();
	});

	test('should return the correct DocView by id', () => {
		const docsView: DocView[] = [
			{
				doc: { uuid: '1' },
				stacked: [
					{ doc: { uuid: '2' } },
				],
				linked: { doc: { uuid: '3' } },
			},
			{
				doc: { uuid: '4' },
				stacked: [],
				linked: null,
			},
		];

		const result1 = getById(docsView, '1');
		expect(result1).toBeDefined();
		expect(result1?.doc.uuid).toEqual('1');

		const result2 = getById(docsView, '2');
		expect(result2).toBeDefined();
		expect(result2?.doc.uuid).toEqual('2');

		const result3 = getById(docsView, '3');
		expect(result3).toBeDefined();
		expect(result3?.doc.uuid).toEqual('3');

		const result4 = getById(docsView, '4');
		expect(result4).toBeDefined();
		expect(result4?.doc.uuid).toEqual('4');

		const result5 = getById(docsView, '5');
		expect(result5).toBeNull();
	});
});