var fs = require('fs');
var request = require('request');

var APP_CODE = "替换你的AppCode";

recognizeFlower();

/**
 * 植物花卉识别
 */
function recognizeFlower() {
    //先准备数据
    var img_base64 = base64_encode('./flower.jpg');

    var options = {
        url: 'https://plant.market.alicloudapi.com/plant/recognize2',
        headers: {
            'Authorization': 'APPCODE ' + APP_CODE
        },
        form: {
            img_base64: img_base64
        }
    };
    request.post(options, function(err, httpResponse, body) {
        if (err) {
            console.error('请求失败: ', err);
        } else {

            console.log('请求成功: ', body);
        }
    });

}


function base64_encode(file) {

    var bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
}