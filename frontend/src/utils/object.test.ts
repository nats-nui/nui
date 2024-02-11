import { describe, expect, it } from "vitest";
import { camelToSnake, deepEqual, snakeToCamel } from "./object";



describe('snakeToCamel', () => {
	it('should convert snake_case to camelCase', () => {
		const input = {
			first_name: 'John',
			last_name: 'Doe',
			address: {
				street_address: '123 Main St',
				city: 'Seattle',
				state: 'WA',
				zip_code: '98101',
			},
		};
		const expectedOutput = {
			firstName: 'John',
			lastName: 'Doe',
			address: {
				streetAddress: '123 Main St',
				city: 'Seattle',
				state: 'WA',
				zipCode: '98101',
			},
		};
		expect(snakeToCamel(input)).toEqual(expectedOutput);
	});

	it('should handle empty objects', () => {
		expect(snakeToCamel({})).toEqual({});
	});

	it('should handle arrays', () => {
		const input = [
			{ first_name: 'John', last_name: 'Doe' },
			{ first_name: 'Jane', last_name: 'Doe' },
		];
		const expectedOutput = [
			{ firstName: 'John', lastName: 'Doe' },
			{ firstName: 'Jane', lastName: 'Doe' },
		];
		expect(snakeToCamel(input)).toEqual(expectedOutput);
	});
});

describe('camelToSnake', () => {
	it('should convert camelCase object keys to snake_case', () => {
		const input = {
			someKey: 'someValue',
			anotherKey: {
				nestedKey: 'nestedValue',
			},
		};
		const expectedOutput = {
			some_key: 'someValue',
			another_key: {
				nested_key: 'nestedValue',
			},
		};
		expect(camelToSnake(input)).toEqual(expectedOutput);
	});

	it('should convert camelCase array keys to snake_case', () => {
		const input = [
			{
				someKey: 'someValue',
			},
			{
				anotherKey: 'anotherValue',
			},
		];
		const expectedOutput = [
			{
				some_key: 'someValue',
			},
			{
				another_key: 'anotherValue',
			},
		];
		expect(camelToSnake(input)).toEqual(expectedOutput);
	});

	it('should return null for null input', () => {
		expect(camelToSnake(null)).toBeNull();
	});
})

describe('deepEqual', () => {
	it('test1', () => {
		const obj1 = {
			key1: 'val1',
			key2: {
				key2_1: 2.1,
			},
		};
		const obj2 = {
			key1: 'val1',
			key2: {
				key2_1: 2.1,
				key2_2: 'val2_2',
			},
			key3: "val3"
		};
		expect(deepEqual(obj1,obj2)).toBeTruthy()
	});
	it('test2', () => {
		const obj1 = {
			key1: 'val2',
			key2: { key2_1: 'val2_1', },
		};
		const obj2 = {
			key1: 'val1',
			key2: { key2_1: 'val2_1', key2_2: 'val2_2', },
			key3: "val3"
		};
		expect(deepEqual(obj1,obj2)).toBeFalsy()
	});
	it('test2', () => {
		const obj1 = {
			key1: 'val2',
			key2: { key2_1: 'val2_1', },
			key5: 333
		};
		const obj2 = {
			key1: 'val1',
			key2: { key2_1: 'val2_1', key2_2: 'val2_2', },
			key3: "val3"
		};
		expect(deepEqual(obj1,obj2)).toBeFalsy()
	});

})
