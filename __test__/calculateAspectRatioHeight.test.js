const {calculateAspectRatioHeight} = require('../utils.js');

describe('calculateAspectRatioHeight', () => {
    test('returns correct dimensions for valid width and height', () => {
        const widthO = 1920;
        const heightO = 1080;
        const width = 1280;
        const expected = {width: 1280, height: 720};
        const result = calculateAspectRatioHeight(widthO, heightO, width);
        expect(result).toEqual(expected);
    });

    test('returns correct dimensions for valid width and height with odd height', () => {
        const widthO = 1920;
        const heightO = 1080;
        const width = 1279;
        const expected = {width: 1280, height: 720};
        const result = calculateAspectRatioHeight(widthO, heightO, width);
        expect(result).toEqual(expected);
    });

    test('returns correct dimensions for valid width and height with odd width', () => {
        const widthO = 1920;
        const heightO = 1080;
        const width = 1277;
        const expected = {width: 1278, height: 718};
        const result = calculateAspectRatioHeight(widthO, heightO, width);
        expect(result).toEqual(expected);
    });

    test('returns correct dimensions for valid width and height with both odd width and height', () => {
        const widthO = 1920;
        const heightO = 1080;
        const width = 1279;
        const expected = {width: 1280, height: 720};
        const result = calculateAspectRatioHeight(widthO, heightO, width);
        expect(result).toEqual(expected);
    });
});
