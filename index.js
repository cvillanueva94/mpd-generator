var queue = require('queue');
const { shInfo, shSpawn } = require('./utils');

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




/**
 * 
 * @param {*} data 
 * 
 * The folder containing the video must be named the same as the video.
 * data:{
 * path: "/dir/personal/folder/", 
 * inputFile: "0x01A58",
 * format: ".mp4"
 * }
 */
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
 * data:{
 * path = "./public/";
 * inputFile = "0x01A58";
 * format = ".mp4";
 * }
 */
async function generate(data) {
    var path = data.path;
    var inputFile = data.inputFile;
    var outputFile = data.inputFile;
    var horizontal = true;
    var formatOrigin = data.format;
    var format = '.mp4';

    //info video file
    var widthInitial = 0;
    var heightInitial = 0;
    var aspect;
    var size;
    var subs;

    await shInfo(path + inputFile + '/' + inputFile + formatOrigin)
        .then(function (response) {
            widthInitial = parseInt(response.width, 10);
            heightInitial = parseInt(response.height, 10);
            aspect = response.display_aspect_ratio;
            subs = response.subs;
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
            resolution = ['360p', '240'];
        } else if (heightInitial >= 470 && heightInitial < 710) {
            resolution = ['480p', '360p', '240'];
        } else if (heightInitial >= 710) {
            resolution = ['720p', '480p', '360p', '240'];
        }
    } else {
        if (widthInitial >= 360 && widthInitial < 470) {
            resolution = ['360p', '240'];
        } else if (widthInitial >= 470 && widthInitial < 710) {
            resolution = ['480p', '360p', '240'];
        } else if (widthInitial >= 710) {
            resolution = ['720p', '480p', '360p', '240'];
        }
    }


    //Creando la carpeta par guardar el manifiesto
    await shSpawn('mkdir', [path + inputFile + '/mpd/'])
        .catch(err => console.log(err));

    /**
     * Comando para ejecutar la creacion del manifiesto
     * a este array se le anadira las partes de los videos, 
     * audios y subtitulos que faltan.
     */
    var arrayMpd = [
        '-dash',
        2000,
        '-rap',
        '-frag-rap',
        '-profile',
        'live',
        '-cprt',
        'krlosvilla101994',
        '-mpd-title',
        'MPD generated with mpd-generator',
        '-out',
        path + inputFile + '/mpd/' + outputFile + formatMpd
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
        if (horizontal) {
            switch (resolutionX) {
                case '720p':
                    width = 1280;
                    height = 720;
                    bitrate = 2500;
                    fps = 30;
                    break;
                case '480p':
                    width = 848;
                    height = 480;
                    bitrate = 1000;
                    fps = 30;
                    break;
                case '360p':
                    width = 640;
                    height = 360;
                    bitrate = 750;
                    fps = 30;
                    break;
                case '240p':
                    width = 426;
                    height = 240;
                    bitrate = 400;
                    fps = 30;
                    break;
            }
        } else {
            switch (resolutionX) {
                case '720p':
                    height = 1280;
                    width = 720;
                    bitrate = 2500;
                    fps = 30;
                    break;
                case '480p':
                    height = 848;
                    width = 480;
                    bitrate = 1000;
                    fps = 30;
                    break;
                case '360p':
                    height = 640;
                    width = 360;
                    bitrate = 750;
                    fps = 30;
                    break;
                case '240p':
                    height = 426;
                    width = 240;
                    bitrate = 400;
                    fps = 30;
                    break;
            }
        }



        /**
         * Vamos a probar convertir un video
         * Manteniendo el ancho
         * 
         * resize:width=720,fittobox=width
         * 
         * Se crea el .264 desde el formatio original en las 
         * diferentes resoluciones
         */
        await shSpawn('x264', [
            '--output',
            path + inputFile + '/' + outputFile + '_' + resolutionX + format264,
            '--fps',
            fps,
            '--preset',
            'slow',
            '--bitrate',
            bitrate,
            '--vbv-maxrate',
            bitrate,
            '--vbv-bufsize',
            bitrate * 2,
            '--min-keyint',
            fps * 3,
            '--keyint',
            fps * 3,
            '--no-scenecut',
            '--vf',
            'resize:width=' + width + ',fittobox=width',// + height,
            path + inputFile + '/' + inputFile + formatOrigin
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
        await shSpawn('MP4Box', [
            '-add',
            path + inputFile + '/' + outputFile + '_' + resolutionX + format264,
            '-fps',
            fps,
            path + inputFile + '/' + outputFile + '_' + resolutionX + format
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
        arrayMpd.push(path + inputFile + '/' + outputFile + '_' + resolutionX + format + '#video');
    }

    /**
     * 
     * Se saca el audio desde el original
     * 
     */
    await shSpawn('MP4Box', [
        '-add',
        path + inputFile + '/' + inputFile + formatOrigin + '#audio',
        path + inputFile + '/' + outputFile + '_audio' + format,
    ])
        .then(function (response) {
            console.log(response)
        })
        .catch(err =>
            console.log(err));
    arrayMpd.push(path + inputFile + '/' + outputFile + '_audio' + format + '#audio');
    //Se sacan los subtitulos si tiene
    if (subs.length > 0) {
        subs.forEach(async function (element) {
            arrayMpd.push(path + inputFile + '/' + outputFile + '_subs_' + element.index + '.vtt' + ':lang=' + (element.language == undefined ? "eng" : element.language));
            await shSpawn('ffmpeg', [
                '-i',
                path + inputFile + '/' + inputFile + formatOrigin,
                '-map',
                '0:' + element.index,
                '-vn',
                '-an',
                path + inputFile + '/' + outputFile + '_subs_' + element.index + '.vtt',
            ]).then(function (response) { })
                .catch(err =>
                    console.log(err)
                );
            //mp4box -add input_subs.srt:lang=eng -add input.mp4 output.mp4
        });
    }



    //Se crea el mpd
    await shSpawn('MP4Box', arrayMpd)
        .then(function (response) {
            if (response == 0) {
                console.log(`************************************
***************resize ${resolutionX} finished ***************
************************************`)
            }
        })
        .catch(err => console.log(err));

}

module.exports = {
    main
};

