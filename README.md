# mpd-generator

Manifest generating system for live content and video (.mpd) that follow the guidelines of the DASH dynamic profile.

[![npm](http://img.shields.io/npm/v/queue.svg?style=flat-square)](https://github.com/krlosvilla101994/mpd-generator)

Description

## Example

`npm run example`

```javascript
var mpd_generator = require("../");

var data = {
  path = "/dir/personal/folder/";
  inputFile = "0x01A58";
  format = ".mp4";
};
var data1 = {
  path = "/dir/personal/folder/";
  inputFile = "0x01A59";
  format = ".mp4";
};

mpd_generator.main(data);
mpd_generator.main(data1);
```
