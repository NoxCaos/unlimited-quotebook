module.exports = {
    getFrame,
    printText
}

var ffmpeg = require("fluent-ffmpeg");
var utils = require('./localutils.js');
var Jimp = require('jimp');

function getFrame(phrase, ep, callback) {
    var fs = require('fs');
    fs.readdir('./vids/', function(err, items) {
        console.log('Media: ' + items[ep]);

        try {
            var process = ffmpeg('./vids/' + items[ep])
                .takeScreenshots({
                    count: 1,
                    filename: 'temp.png',
                    timemarks: [ getAverageTime(phrase.Start, phrase.End) ]
                }, './')
                .on('end', function(stdout, stderr) {
                    console.log('Media: Transcoding succeeded !');
                    callback('./temp.png');
                });
        } catch (e) {
            console.log('[ERROR:Media]' + e.code);
            console.log('[ERROR:Media]' + e.msg);
        }
    });
}

function getAverageTime(time1, time2) {
    return utils.msToTime(((utils.parseToSeconds(time1) + utils.parseToSeconds(time2))/ 2) * 1000) ;
}

function printText(text, file, callback) {
    Jimp.read(file, function (err, image) {
        if(text.length > 20) {
            var words = text.split(' ');
            var tx1 = '', tx2 = '';
            var half = Math.floor(words.length/2);
            for(var i=0; i<half; i++) {
                tx1 += words[i] + ' ';
            }
            for(var i=half; i<words.length; i++) {
                tx2 += words[i] + ' ';
            }
            writeTwoLines(tx1, tx2, image, () => {
                console.log('Media: Text added, sent back');
                callback();
            });
        } else {
            writeSingleLine(text, image, () => {
                console.log('Media: Text added, sent back');
                callback();
            });
        }
        console.log('Media: Started text print...');
    });
}

function writeSingleLine(text, image, callback) {
    Jimp.loadFont('./fonts/segoe_rst.fnt', function (err, font) {
        var distX = getTextXMargin(text);
        image.print(font, distX, 280, text, function(err, image){
            image.write("./temp2.png", () =>{
                if(callback) callback();
            });
        });
    });
}

function writeTwoLines(text1, text2, image, callback) {
    Jimp.loadFont('./fonts/segoe_rst.fnt', function (err, font) {
        var distX1 = getTextXMargin(text1);
        var distX2 = getTextXMargin(text2);
        image.print(font, distX1, 10, text1, function(err, image){
            image.print(font, distX2, 280, text2, function(err, image){
                image.write("./temp2.png", () => {
                    if(callback) callback();
                });
            });
        });
    });
}

function getTextXMargin(text) {
    return 300 - ((text.length * 18) / 2);
}