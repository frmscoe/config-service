import { uniqueArray } from "../uniqueItems"

describe('Unique items', () => {
    it('should return only unique items', () => {
        const items = [{ key: 1, value: 1 }, { key: 2, value: 1 }, { key: 3, value: 1 }, { key: 1, value: 1 }]
        expect(uniqueArray(items, 'key').length).toBe(3);
    })
})