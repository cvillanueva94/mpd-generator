const {shSpawn} = require('../utils')

describe('shSpawn', () => {
    test('resolves with exit code 0 when command succeeds', async () => {
        const result = await shSpawn('ls');

        expect(result).toBe(0);
    });

    test('rejects with error when command fails', async () => {
        await expect(shSpawn('invalid-command')).rejects.toThrow();
    });
});
