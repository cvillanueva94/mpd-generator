const assert = require('assert');
const path = require('path');
const utils = require('../utils');

let dir = path.resolve('public/0x01A58/0x01A58.mkv')

return utils.shInfo(dir)
    .then(function (response) {
        console.log(response)
        assert.ok(response.width == '1080');
    })
