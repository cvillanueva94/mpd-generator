const { spawn } = require('child_process');
var ffprobe = require('ffprobe'),
    ffprobeStatic = require('ffprobe-static');
exports.shInfo = shInfo;
exports.shSpawn = shSpawn;

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
                console.log(percent);
            }
            console.log(`aa${data}`);
        });

        process.on('error', function (err) {
            // *** Process creation failed
            reject(err);
        });
    });
}