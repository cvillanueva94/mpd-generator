const { spawn } = require('child_process');

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
    var options = [
        '-v',
        'quiet',
        '-print_format',
        'json',
        '-show_format',
        '-show_streams',
        filePath
    ]
    return new Promise(function (resolve, reject) {
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
        const process = spawn('ffprobe', options);
        process.on('close', function (code) {
            resolve({
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
            });
        });
        process.stdout.on('data', (data) => {
            dataFinish += data.toString();;
        });

        process.stdout.on('end', function () {
            var data = JSON.parse(dataFinish);

            //Datos generales
            try { duration = data.format.duration; } catch (e) { }
            try { bit_rate = data.format.bit_rate; } catch (e) { }
            try { size = data.format.size; } catch (e) { }

            //Datos videos y audio
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
        });

        process.stderr.on('data', (data) => {
        });


        process.on('error', function (err) {
            // *** Process creation failed
            reject(err);
        });
    });
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