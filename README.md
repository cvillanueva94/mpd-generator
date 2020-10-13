# mpd-generator

Manifest generating system for live content and video (.mpd) that follow the guidelines of the DASH dynamic profile.

[![npm](http://img.shields.io/npm/v/mpd-generator.svg?style=flat-square)](https://www.npmjs.com/package/mpd-generator)

Require:

  MP4Box https://github.com/gpac/gpac/wiki/MP4Box-Introduction
  FFmpeg https://ffmpeg.org/

## Example

`npm run example`

```javascript
var mpd_generator = require("mpd-generator");

var data = {
  path: "/dir/personal/folder/",
  inputFile: "0x01A58",
  format: ".mp4",
};
var data1 = {
  path: "/dir/personal/folder/",
  inputFile: "0x01A59",
  format: ".mp4",
};

mpd_generator.main(data);
mpd_generator.main(data1);
```
