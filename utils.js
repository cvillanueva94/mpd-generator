const {spawn} = require('child_process');
const ffprobe = require('ffprobe'),
    ffprobeStatic = require('ffprobe-static');


/**
 * Get the necessary information from a video
 * @param {String} filePath
 * @return {Object}  { width: String, height: String, duration: String, 
 *   bit_rate: String, size: String, videoPositions: String, 
 *   audios: String, subs: String, display_aspect_ratio: String,
 *   sample_aspect_ratio: String }
 */
async function shInfo(filePath) {
    try {
        const data = await ffprobe(filePath, {path: ffprobeStatic.path});
        const videoStreams = data.streams.filter(stream => stream.codec_type === 'video');
        const audioStreams = data.streams.filter(stream => stream.codec_type === 'audio');
        const subtitleStreams = data.streams.filter(stream => stream.codec_type === 'subtitle');
        const videoPositions = videoStreams.map(stream => stream.index);
        const audios = audioStreams.map(stream => ({
            index: stream.index,
            language: stream.tags?.language,
        }));
        const subs = subtitleStreams.map(stream => ({
            index: stream.index,
            language: stream.tags?.language,
        }));

        return {
            width: videoStreams[0]?.width,
            height: videoStreams[0]?.height,
            duration: data.format?.duration,
            bit_rate: data.format?.bit_rate,
            size: data.format?.size,
            videoPositions,
            audios,
            subs,
            display_aspect_ratio: videoStreams[0]?.display_aspect_ratio,
            sample_aspect_ratio: videoStreams[0]?.sample_aspect_ratio,
            videoLanguage: videoStreams[0]?.tags?.language,
        };
    } catch (error) {
        console.error(`Error in shInfo: ${error}`);
        return null;
    }
}


/**
 * Ejecuta un comando en una terminal y devuelve una promesa que se resuelve
 * cuando el proceso de terminal ha terminado.
 *
 * @param {string} cmd - El comando que se va a ejecutar.
 * @param {string[]} [options] - Las opciones que se pasan al comando.
 * @returns {Promise<number>} - Una promesa que se resuelve con el código de salida del proceso.
 */
function shSpawn(cmd, options) {
    return new Promise((resolve, reject) => {
        const process = spawn(cmd, options);

        // Maneja la salida estándar del proceso.
        process.stdout.on('data', data => {
            console.log(`${data}`);
        });

        // Maneja la salida de error del proceso.
        process.stderr.on('data', data => {
            console.log(`${data}`);
        });

        // Maneja los errores del proceso.
        process.on('error', err => {
            reject(err);
        });

        // Maneja el cierre del proceso.
        process.on('close', code => {
            console.log(`Process exited with code ${code}`);
            resolve(code);
        });
    });
};


/**
 * Calcula la altura de una imagen en función de su anchura y su relación de aspecto.
 * Si la altura resultante es impar o la anchura dada es impar, se llama recursivamente
 * con una anchura incrementada en 1 hasta que se obtenga una altura par y una anchura par.
 * @param {number} widthO - Anchura original de la imagen
 * @param {number} heightO - Altura original de la imagen
 * @param {number} width - Anchura deseada de la imagen
 * @returns {Object} - Objeto con las propiedades de anchura y altura calculadas
 */
function calculateAspectRatioHeight(widthO, heightO, width) {
    // Calcula la relación de aspecto de la imagen original
    let aspectRatio = widthO / heightO;

    // Calcula la altura de la imagen en función de la anchura y la relación de aspecto
    let height = Math.floor(width / aspectRatio);

    // Si la altura calculada es impar o la anchura dada es impar, llama a la función recursivamente
    // con una anchura incrementada en 1 hasta que se obtenga una altura par y una anchura par
    if (height % 2 !== 0 || width % 2 !== 0) {
        return calculateAspectRatioHeight(widthO, heightO, width + 1);
    }
    // Devuelve un objeto con las propiedades de anchura y altura calculadas
    return {
        width: width,
        height: height
    };
}

/**
 * Calcula la resolución y las tasas de bits de un video dado su ancho, alto, resolución y calidad
 * @param {number} width - Ancho del video
 * @param {number} height - Alto del video
 * @param {string} resolution - Resolución del video ('144p', '240p', '360p', '480p', '720p' o '1080p')
 * @param {Array<string>} qualities - Calidades del video ('low', 'medium' o 'high')
 * @returns {Object} - Objeto con las propiedades de la resolución y las tasas de bits
 */
function getResolution(width, height, resolution, qualities) {
    /**
     * Un objeto que contiene las resoluciones y tasas de bits correspondientes
     * para cada resolución
     */
    const resolutions = {
        "144p": {width: 256, height: 144, bitrates: {low: 80, medium: 90, high: 100}},
        "240p": {width: 426, height: 240, bitrates: {low: 300, medium: 400, high: 700}},
        "360p": {width: 640, height: 360, bitrates: {low: 400, medium: 750, high: 1000}},
        "480p": {width: 854, height: 480, bitrates: {low: 500, medium: 1000, high: 2000}},
        "720p": {width: 1280, height: 720, bitrates: {low: 1500, medium: 2500, high: 4000}},
        "1080p": {width: 1920, height: 1080, bitrates: {low: 3000, medium: 4500, high: 6000}}
    };

    /**
     * El objeto de resultado que se devolverá al finalizar el cálculo
     */
    const result = {
        width: 0,
        height: 0,
        bitrate: [],
        fps: 30
    };

    /**
     * Si la resolución dada está en el objeto de resoluciones,
     * extrae la información relevante y guarda la resolución y las tasas de bits
     */
    if (resolutions.hasOwnProperty(resolution)) {
        const {width: resWidth, height: resHeight, bitrates} = resolutions[resolution];
        const res = calculateAspectRatioHeight(width, height, resWidth);
        result.width = res.width;
        result.height = res.height;

        qualities.forEach(q => {
            if (bitrates.hasOwnProperty(q)) {
                result.bitrate.push({
                    value: bitrates[q],
                    type: q
                });
            }
        });
    }
    return result;
}

module.exports = {
    shInfo,
    shSpawn,
    calculateAspectRatioHeight,
    getResolution
};
