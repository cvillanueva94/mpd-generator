const {shInfo} = require('../utils')
const path = require("path");

describe('shInfo', () => {
    test('returns correct information for valid file', async () => {
        const filePath = path.resolve('public/0x01A58/0x01A58.mov')
        const expectedInfo = {
            width: 144,
            height: 82,
            duration: undefined,
            bit_rate: undefined,
            size: undefined,
            videoPositions: [0],
            audios: [],
            subs: [],
            display_aspect_ratio: '72:41',
            sample_aspect_ratio: '1:1',
            videoLanguage: 'und',
        };

        const result = await shInfo(filePath);

        expect(result).toEqual(expectedInfo);
    });

    test('returns null for invalid file', async () => {
        const filePath = path.resolve('public/invalid/0x01A58.mov')

        const result = await shInfo(filePath);

        expect(result).toBeNull();
    });
});
