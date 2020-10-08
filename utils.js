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
        var width;
        var height;
        var duration;
        var bit_rate;
        var size;
        var display_aspect_ratio;
        var sample_aspect_ratio;
        var videoPositions = [];
        var audios = [];
        var subs = [];
        var dataFinish = '';
        const process = spawn('ffprobe', options);
        process.on('close', function (code) {
            resolve({
                width: width,
                height: height,
                duration: duration,
                bit_rate: bit_rate,
                size: size,
                videoPositions,
                audios,
                subs,
                display_aspect_ratio,
                sample_aspect_ratio
            });
        });
        process.stdout.on('data', (data) => {
            //console.log(`stdout: ${data}`);
            dataFinish += data.toString();;
        });

        process.stdout.on('end', function () {
            console.log('Finished collecting data chunks.');
            //console.log(dataFinish)
            var data = JSON.parse(dataFinish);

            //Datos generales
            try { duration = data.format.duration; } catch (e) { }
            try { bit_rate = data.format.bit_rate; } catch (e) { }
            try { size = data.format.size; } catch (e) { }

            //Datos videos y audio
            data.streams.forEach(element => {
                switch (element.codec_type) {
                    case 'video':
                        console.log('video');

                        videoPositions.push(element.index);
                        try { width = element.width; } catch (e) { }
                        try { height = element.height; } catch (e) { }
                        try { sample_aspect_ratio = element.sample_aspect_ratio; } catch (e) { }
                        try { display_aspect_ratio = element.display_aspect_ratio; } catch (e) { }
                        break;

                    case 'audio':
                        console.log('audio');

                        audios.push({
                            index: element.index,
                            language: element.tags.language
                        });
                        break;

                    case 'subtitle':
                        console.log('subtitle');

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
            //console.log(`stderr: ${data}`);
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
        process.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        process.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });
        process.on('error', function (err) {
            // *** Process creation failed
            reject(err);
        });
    });
}