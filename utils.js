const { spawn } = require('child_process');
var ffprobe = require('ffprobe'),
    ffprobeStatic = require('ffprobe-static');
exports.shInfo = shInfo;
exports.shSpawn = shSpawn;
exports.getResolution = getResolution;

/**
 * Get the necessary information from a video
 * @param {String} filePath
 * @return {Object}  { width: String, height: String, duration: String, 
 *   bit_rate: String, size: String, videoPositions: String, 
 *   audios: String, subs: String, display_aspect_ratio: String,
 *   sample_aspect_ratio: String }
 */
async function shInfo(filePath) {
    return ffprobe(filePath, { path: ffprobeStatic.path })//, function (err, info) {
        .then(function (data) {
            let width;
            let height;
            let duration;
            let bit_rate;
            let size;
            let display_aspect_ratio;
            let videoLanguage;
            let sample_aspect_ratio;
            let videoPositions = [];
            let audios = [];
            let subs = [];
            let dataFinish = '';
            data.streams.forEach(element => {
                switch (element.codec_type) {
                    case 'video':

                        videoPositions.push(element.index);
                        try { videoLanguage = element.tags.language; } catch (e) { }
                        try { width = element.width; } catch (e) { }
                        try { height = element.height; } catch (e) { }
                        try { sample_aspect_ratio = element.sample_aspect_ratio; } catch (e) { }
                        try { display_aspect_ratio = element.display_aspect_ratio; } catch (e) { }
                        break;

                    case 'audio':

                        audios.push({
                            index: element.index,
                            language: element.tags.language
                        });
                        break;

                    case 'subtitle':

                        subs.push({
                            index: element.index,
                            language: element.tags.language
                        });
                        break;
                    default:
                        break;
                }
            });
            return {
                width: width,
                height: height,
                duration: duration,
                bit_rate: bit_rate,
                size: size,
                videoPositions: videoPositions,
                audios: audios,
                subs: subs,
                display_aspect_ratio: display_aspect_ratio,
                sample_aspect_ratio: sample_aspect_ratio,
                videoLanguage: videoLanguage
            }
        })
}


/**
 * Execute simple shell command (async wrapper).
 * @param {String} cmd
 * @return {Object} { stdout: String, stderr: String }
 */
async function shSpawn(cmd, options) {
    return new Promise(function (resolve, reject) {
        const process = spawn(cmd, options);
        process.on('close', function (code) { // Should probably be 'exit', not 'close'
            // *** Process completed
            resolve(code);
        });

        process.stdout.on('data', (data) => { console.log(`bb${data}`); });
        process.stdout.on('end', function () { console.log(`finish`); })
        process.stderr.on('data', (data) => {

            let percent = data.toString('utf8');
            if (percent.includes("%]")) {
                percent = percent.split('[')[1].split('%]')[0];
            }
        });

        process.on('error', function (err) {
            // *** Process creation failed
            reject(err);
        });
    });
}


/**
 resolution       144p      240p        360p        480p        720p        1080p
 width            256       426         640         854         1280        1920
Video Bitrates                   
Maximum           80Kbs     700 Kbps    1000 Kbps   2000 Kbps   4000 Kbps   6000 Kbps
Recommended       90Kbs     400 Kbps    750 Kbps    1000 Kbps   2500 Kbps   4500 Kbps
Minimum           100Kbs    300 Kbps    400 Kbps    500 Kbps    1500 Kbps   3000 Kbps
 */

function getResolution(width, height, resolution, qualities) {
    var result = {
        width: 0, height: 0,
        bitrate: [], fps: 30
    }
    let res;
    switch (resolution) {
        case '144p':
            res = xY(width, height, 256);
            result.width = res.width;
            result.height = res.height;
            qualities.map(x => {
                if (x == 'low') {
                    result.bitrate.push({
                        value: 80,
                        type: x
                    });
                } else if (x == 'medium') {
                    result.bitrate.push({
                        value: 90,
                        type: x
                    });
                } else if (x == 'high') {
                    result.bitrate.push({
                        value: 100,
                        type: x
                    });
                }
            });
            break;
        case '240p':
            res = xY(width, height, 426);
            result.width = res.width;
            result.height = res.height;
            qualities.map(x => {
                if (x == 'low') {
                    result.bitrate.push({
                        value: 300,
                        type: x
                    });
                } else if (x == 'medium') {
                    result.bitrate.push({
                        value: 400,
                        type: x
                    });
                } else if (x == 'high') {
                    result.bitrate.push({
                        value: 700,
                        type: x
                    });
                }
            });
            break;
        case '360p':
            res = xY(width, height, 640);
            result.width = res.width;
            result.height = res.height;
            qualities.map(x => {
                if (x == 'low') {
                    result.bitrate.push({
                        value: 400,
                        type: x
                    });
                } else if (x == 'medium') {
                    result.bitrate.push({
                        value: 750,
                        type: x
                    });
                } else if (x == 'high') {
                    result.bitrate.push({
                        value: 1000,
                        type: x
                    });
                }
            });
            break;
        case '480p':
            res = xY(width, height, 854);
            result.width = res.width;
            result.height = res.height;
            qualities.map(x => {
                if (x == 'low') {
                    result.bitrate.push({
                        value: 500,
                        type: x
                    });
                } else if (x == 'medium') {
                    result.bitrate.push({
                        value: 1000,
                        type: x
                    });
                } else if (x == 'high') {
                    result.bitrate.push({
                        value: 2000,
                        type: x
                    });
                }
            });
            break;
        case '720p':
            res = xY(width, height, 1280);
            result.width = res.width;
            result.height = res.height;
            qualities.map(x => {
                if (x == 'low') {
                    result.bitrate.push({
                        value: 1500,
                        type: x
                    });
                } else if (x == 'medium') {
                    result.bitrate.push({
                        value: 2500,
                        type: x
                    });
                } else if (x == 'high') {
                    result.bitrate.push({
                        value: 4000,
                        type: x
                    });
                }
            });
            break;
        case '1080p':
            res = xY(width, height, 1920);
            result.width = res.width;
            result.height = res.height;
            qualities.map(x => {
                if (x == 'low') {
                    result.bitrate.push({
                        value: 3000,
                        type: x
                    });
                } else if (x == 'medium') {
                    result.bitrate.push({
                        value: 4500,
                        type: x
                    });
                } else if (x == 'high') {
                    result.bitrate.push({
                        value: 6000,
                        type: x
                    });
                }
            });
            break;
    }
    return result;
}

/**
 * 
 * @param {Integer} widthO width del video 
 * @param {Integer} heightO height del video
 * @param {Integer} width width segun la resolucion a la que se quiere convertir
 */
function xY(widthO, heightO, width) {
    let a = widthO / width;
    let b = heightO / a;
    let c = parseInt(b);
    if (c % 2 || width % 2) {
        return xY(widthO, heightO, width + 1)
    }
    return { width: width, height: c };
}
