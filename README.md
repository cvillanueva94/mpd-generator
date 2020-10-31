# mpd-generator

Manifest generating system for live content and video (.mpd) that follow the guidelines of the DASH dynamic profile.

[![npm](http://img.shields.io/npm/v/mpd-generator.svg?style=flat-square)](https://www.npmjs.com/package/mpd-generator)
[![Build Status](https://travis-ci.org/krlosvilla101994/mpd-generator.svg?branch=main)](https://travis-ci.org/krlosvilla101994/mpd-generator)
[![dependencies Status](https://david-dm.org/krlosvilla101994/mpd-generator/status.svg)](https://david-dm.org/krlosvilla101994/mpd-generator)

## Overview

This module generates an mpd manifest for using [Dash.js](https://github.com/Dash-Industry-Forum/dash.js/wiki) from a video.

The manifest that is generated contains 720p, 480p, 360p and 240p resolutions as long as the original video allows it. Example: a video with 480p resolution will generate a manifesto with 480p, 360p and 240p resolutions.

The module implements [Queue](https://www.npmjs.com/package/queue) for the conversion of the videos.

## Require:

Bento4 MP4 https://www.bento4.com/<br>
FFmpeg https://ffmpeg.org/ <br>

<br>

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 0.10 or higher is required.

If this is a brand new project, make sure to create a `package.json` first with
the [`npm init` command](https://docs.npmjs.com/creating-a-package-json-file).

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install mpd-generator
```

## Installing

Assuming you’ve already installed [Node.js](https://nodejs.org/en/), create a directory to hold your application, and make that your working directory.

```bash
$ mkdir myapp
$ cd myapp
```

Use the npm init command to create a package.json file for your application. For more information on how package.json works, see [Specifics of npm’s package.json handling](https://docs.npmjs.com/files/package.json).

```bash
$ npm init
```

This command prompts you for a number of things, such as the name and version of your application. For now, you can simply hit RETURN to accept the defaults for most of them, with the following exception:

```bash
entry point: (index.js)
```

Enter app.js, or whatever you want the name of the main file to be. If you want it to be index.js, hit RETURN to accept the suggested default file name.

Now install mpd-generator in the myapp directory and save it in the dependencies list. For example:

```bash
$ npm i mpd-generator --save
```

## Usage

```javascript
var mpd_generator = require("mpd-generator");

var data = {
  path: "public/0x01A58",
  inputFile: "0x01A58",
  format: ".mkv",
};

mpd_generator.main(data);
```
