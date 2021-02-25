var queue = require('queue');
const { shInfo, shSpawn, getResolution } = require('./utils');
const path = require('path');
const fs = require('fs');

var q = queue({
    concurrency: 1
});
var results = [];
var format264 = ".264";
var formatMpd = ".mpd";
var width = 0;
var height = 0;
var bitrate = 0;
var fps = 0;
var resolution = ['240p']//['720p', '480p', '360p', '240p'];
var notification = null;



/**
 * 
 * @param {*} data 
 * 
 * data={
 * path: "public/0x01A58",
 * inputFile: "0x01A58",
 * format: ".mkv",
 * notification: "http://localhost:7777", || null
 * }
 */
let data = {
    path: "public/0x01A58",
    inputFile: "0x01A58",
    format: ".mkv",
    notification: "http://localhost:7777",
}
main(data)

function main(data) {
    q.push(async function (cb) {
        await generate(data)
        cb()
    })
    q.start(function (err) {
        if (err) throw err
    })
}

/**
 * 
 * @param {*} data 
 * 
 * data={
 * path: "public/0x01A58",
 * inputFile: "0x01A58",
 * format: ".mkv",
 * notification: "http://localhost:7777", || null
 * }
 */
async function generate(data) {
    let dir = data.path;
    if (!dir.endsWith('/')) {
        dir += '/';
    }
    if (data.notification != null) {
        notification = data.notification;
    }
    let inputFile = data.inputFile;
    let outputFile = data.inputFile;
    let horizontal = true;
    let formatOrigin = data.format;
    let format = '.mp4';

    //info video file
    let widthInitial = 0;
    let heightInitial = 0;
    let aspect;
    let size;
    let subs;
    let videoLanguage;

    await shInfo(path.resolve(dir + inputFile + formatOrigin))
        .then(function (response) {
            console.log(response)
            widthInitial = parseInt(response.width, 10);
            heightInitial = parseInt(response.height, 10);
            aspect = response.display_aspect_ratio;
            subs = response.subs;
            videoLanguage = response.videoLanguage != 'und' ? response.videoLanguage : 'en-US';
        })
        .catch(err => console.log(err));



    /**
     * Verificando si es vertical u horizontal
     */
    if (heightInitial > widthInitial) {
        horizontal = false;
    }

    /**
     * Se verifica en que resoluciones se
     * convertira partiendo de la original
     */
    if (horizontal) {
        if (heightInitial >= 360 && heightInitial < 470) {
            resolution = ['360p', '240p'];
        } else if (heightInitial >= 470 && heightInitial < 710) {
            resolution = ['480p', '360p', '240p'];
        } else if (heightInitial >= 710) {
            resolution = ['720p', '480p', '360p', '240p'];
        }
    } else {
        if (widthInitial >= 360 && widthInitial < 470) {
            resolution = ['360p', '240p'];
        } else if (widthInitial >= 470 && widthInitial < 710) {
            resolution = ['480p', '360p', '240p'];
        } else if (widthInitial >= 710) {
            resolution = ['720p', '480p', '360p', '240p'];
        }
    }


    // //Creando la carpeta par guardar el manifiesto
    // await shSpawn('mkdir', [path.resolve(dir + 'mpd/')])
    //     .catch(err => console.log(err));

    /**
     * Comando para ejecutar la creacion del manifiesto
     * a este array se le anadira las partes de los videos, 
     * audios y subtitulos que faltan.
     */

    var arrayMpd = [
        '--mpd-name=manifest.mpd',
        '-o', dir + 'mpd/'
    ];


    /**
     * Siguiendo a Youtbe https://support.google.com/youtube/answer/2853702?hl=en
     * 
     * fps:30
     * 
     * Por ahora todo esta x el recomendado de lo que se muestra a continuacion
     *  
                        240p       360p        480p        720p        1080p
        Resolution      426 x 240   640 x 360   854x480     1280x720    1920x1080
        Video Bitrates                   
        Maximum         700 Kbps    1000 Kbps   2000 Kbps   4000 Kbps   6000 Kbps
        Recommended     400 Kbps    750 Kbps    1000 Kbps   2500 Kbps   4500 Kbps
        Minimum         300 Kbps    400 Kbps    500 Kbps    1500 Kbps   3000 Kbps
     */

    for (var i = 0; i < resolution.length; i++) {
        var resolutionX = resolution[i];
        let a = getResolution(widthInitial, widthInitial, resolutionX);
        console.log(a)
        width = a.width;
        height = a.height;
        bitrate = a.bitrate;
        fps = a.fps;

        /**
         * Recorremos los bitrate, para convertir los videos
         */
        for (var j = 0; j < bitrate.length; j++) {
            /**
                    * Vamos a probar convertir un video
                    * Manteniendo el ancho
                    * 
                    * resize:width=720,fittobox=width
                    * 
                    * Se crea el .264 desde el formatio original en las 
                    * diferentes resoluciones
                    */
            await shSpawn('ffmpeg', [
                '-i',
                path.resolve(dir + inputFile + formatOrigin),
                '-an', '-sn', '-c:0', 'libx264', '-x264opts',
                'keyint=24:min-keyint=24:no-scenecut',
                '-b:v', bitrate[j] * 2 + 'k', '-maxrate', bitrate[j] * 2 + 'k',
                '-bufsize', bitrate[j] + 'k', '-vf', 'scale=' + width + ':' + height,
                path.resolve(dir + outputFile + '_' + resolutionX + '_' + bitrate[j] + format),
            ])
                .then(function (response) {
                    if (response == 0) {
                        console.log(`************************************
                ***************Se crea el .264 de ${resolutionX} ***************
                ************************************`)
                    }
                })
                .catch(err =>
                    console.log(err)
                );


            /**
             * 
             * Se genere el mp4 desde el .264 creado anteriormente
             * 
             */
            await shSpawn('mp4fragment', [
                path.resolve(dir + outputFile + '_' + resolutionX + '_' + bitrate[j] + format),

                path.resolve(dir + 'f-' + outputFile + '_' + resolutionX + '_' + bitrate[j] + format)
            ])
                .then(function (response) {
                    if (response == 0) {
                        console.log(
                            `************************************
                ***************Se crea el .mp4 desde .264 ${resolutionX} ***************
                ************************************`);
                    }
                })
                .catch(err => console.log(err));
            arrayMpd.push(path.resolve(dir + 'f-' + outputFile + '_' + resolutionX + '_' + bitrate[j] + format));
        }
    }

    /**
     * 
     * Se saca el audio desde el original
     * 
     */
    await shSpawn('ffmpeg', [
        '-i',
        path.resolve(dir + inputFile + formatOrigin),
        '-map', '0:1', '-ac', '2', '-ab', '192k', '-vn', '-sn',
        path.resolve(dir + outputFile + '_audio' + format),
    ])
        .then(function (response) {
            console.log(response)
        })
        .catch(err =>
            console.log(err));

    await shSpawn('mp4fragment', [
        path.resolve(dir + outputFile + '_audio' + format),

        path.resolve(dir + 'f-' + outputFile + '_audio' + format)
    ])
        .then(function (response) {
            if (response == 0) {
                console.log(
                    `************************************
                    ***************Se crea el .mp4 desde .264 ${resolutionX} ***************
                    ************************************`);
            }
        })
    arrayMpd.push(path.resolve(dir + 'f-' + outputFile + '_audio' + format));

    //Se crea el mpd
    await shSpawn('mp4dash', arrayMpd)
        .then(function (response) {
            if (response == 0) {
                console.log(`************************************
***************resize ${resolutionX} finished ***************
************************************`)
                fs.readFile(dir + 'mpd/manifest.mpd', 'utf-8', function (err, data) {
                    if (err) throw err;

                    var newValue = data.replace(/initialization="/g, 'initialization="' + outputFile + '_');
                    newValue = newValue.replace(/ media="/g, ' media="' + outputFile + '_');
                    fs.writeFile(dir + 'mpd/manifest2.mpd', newValue, 'utf-8', function (err) {
                        if (err) throw err;
                        console.log('filelistAsync complete');
                    });
                });
            }
        })
        .catch(err => console.log(err));

}

module.exports = {
    main
};

