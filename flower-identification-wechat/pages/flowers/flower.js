const APP_CODE = "替换你的AppCode";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgSrc: ''
  },
  // 拍照功能
  takePhoto: function () {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success: function (res) {
        
        // 图片路径
        var filePath = res.tempFilePaths[0];
        that.uploadImageFile(filePath)

        that.setData({
          imgSrc: filePath
        })
      },
      fail: function (error) {
        console.error("调用本地相册文件时出错")
        console.warn(error)
      },
      complete: function () {
      }
    })
  },
  uploadImageFile: function (filePath) {
   
    var that = this;

    var fsm = wx.getFileSystemManager();
    fsm.readFile({
      filePath: filePath,
      encoding: "base64",
      success: function (res) {
        that.flowersIdentification(res.data)
      }
    })

  },
  flowersIdentification: function (imgBase64){
    wx.showLoading({
      title: '慧眼识别中...',
    })
    var that = this;
    wx.request({
      url: 'https://plant.market.alicloudapi.com/plant/recognize2', 
      method: 'POST',
      data: {
        img_base64: imgBase64
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'APPCODE ' + APP_CODE
      },
      success(res) {
        var info = res.data.Result[0]
        that.setData({
          gender: info.Name,
          age: info.AliasName,
          glass: info.Family,
          expression: info.Genus
        })

      },
      fail(err) {
        console.log('err')
        console.log(err)
      },complete(res){
        wx.hideLoading()
      }
    })
  }


})