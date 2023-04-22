const {getResolution} = require('../utils');

describe('getResolution', () => {
    test('returns correct result for valid inputs', () => {
        const width = 1920;
        const height = 1080;
        const resolution = '1080p';
        const qualities = ['low', 'medium', 'high'];
        const expected = {
            width: 1920,
            height: 1080,
            bitrate: [
                {value: 3000, type: 'low'},
                {value: 4500, type: 'medium'},
                {value: 6000, type: 'high'}
            ],
            fps: 30
        };
        const result = getResolution(width, height, resolution, qualities);
        expect(result).toEqual(expected);
    });

    test('returns empty result for invalid resolution', () => {
        const width = 1920;
        const height = 1080;
        const resolution = 'invalid_resolution';
        const qualities = ['low', 'medium', 'high'];
        const expected = {
            width: 0,
            height: 0,
            bitrate: [],
            fps: 30
        };
        const result = getResolution(width, height, resolution, qualities);
        expect(result).toEqual(expected);
    });

    test('returns empty result for empty qualities', () => {
        const width = 1920;
        const height = 1080;
        const resolution = '1080p';
        const qualities = [];
        const expected = {
            width: 1920,
            height: 1080,
            bitrate: [],
            fps: 30
        };
        const result = getResolution(width, height, resolution, qualities);
        expect(result).toEqual(expected);
    });
});
