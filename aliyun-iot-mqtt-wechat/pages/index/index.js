//index.js
//获取应用实例
const app = getApp()
const utils = require('../../utils/util.js');
const crypto = require('../../utils/crypto.js');
const Paho = require('../../utils/paho-mqtt.js');
let username;
let password;
Page({
  data: {
    logTitle: '',
    logContent: '',
    productKey: '',
    deviceName: '',
    deviceSecret: '',
    temperature: '',
    humidity: '',
    mqttClient: null
  },
  productKeyInput: function(e) {
    this.setData({
      productKey: e.detail.value
    })
  },
  deviceNameInput: function(e) {
    this.setData({
      deviceName: e.detail.value
    })
  },
  deviceSecretInput: function(e) {
    this.setData({
      deviceSecret: e.detail.value
    })
  },
  temperatureInput: function(e) {
    this.setData({
      temperature: e.detail.value
    })
  },
  humidityInput: function(e) {
    this.setData({
      humidity: e.detail.value
    })
  },
  sendDataIoT: function() {
    if (this.data.mqttClient && this.data.mqttClient.isConnected()) {
      const payload = {
        id: Date.now(),
        params: {
          temperature: parseFloat(this.data.temperature.trim() || 0),
          humidity: parseFloat(this.data.humidity.trim() || 0)
        },
        method: "thing.event.property.post"
      }
      const message = new Paho.MQTT.Message(JSON.stringify(payload));
      message.destinationName = "/sys/" + this.data.productKey.trim() + "/" + this.data.deviceName.trim() + "/thing/event/property/post";
      message.qos = 1;
      this.data.mqttClient.send(message);

      this.setData({
        logTitle: utils.formatTime(new Date()) + "\tPublish success!",
        logContent: "topic=" + message.destinationName + "\npayload=" + JSON.stringify(payload)
      })
    } else {
      this.setData({
        logTitle: utils.formatTime(new Date()) + "\tfail",
        logContent: "mqtt is not connected!"
      })
    }
  },
  subscribeIoT: function() {

    if (this.data.mqttClient && this.data.mqttClient.isConnected()) {
      const topic = "/" + this.data.productKey.trim() + "/" + this.data.deviceName.trim() + "/user/get";
      this.data.mqttClient.subscribe(topic);
      this.setData({
        logTitle: utils.formatTime(new Date()) + "\tSubscribe success!",
        logContent: "topic=" + topic
      })

    } else {
      this.setData({
        logTitle: utils.formatTime(new Date())  + "\tfail",
        logContent: "mqtt is not connected!"
      })
    }

  },
  connectIoT: function() {
    if (this.data.mqttClient && this.data.mqttClient.isConnected()){
      this.setData({
        logTitle: utils.formatTime(new Date()) + "\tConnected!",
        logContent: ''
      })
      return ;
    }
    const pageThat = this;
    const params = {
      productKey: pageThat.data.productKey.trim(),
      deviceName: pageThat.data.deviceName.trim(),
      deviceSecret: pageThat.data.deviceSecret.trim(),
      timestamp: Date.now(),
      clientId: Math.random().toString(36).substr(2),
    }
    //1.生成clientId，username，password
    const contentStr = "clientId" + params.clientId + "deviceName" + params.deviceName + "productKey" + params.productKey + "timestamp" + params.timestamp;

    const clientId = `${params.clientId}|securemode=2,signmethod=hmacsha1,timestamp=${params.timestamp}|`;
    username = `${params.deviceName}&${params.productKey}`;
    password = crypto.HmacSHA1(contentStr, params.deviceSecret).toString();

    this.data.mqttClient = new Paho.MQTT.Client("public.iot-as-mqtt.cn-shanghai.aliyuncs.com", 443, "/mqtt", clientId);

    const options = {
      useSSL: true,
      userName: username,
      password: password,
      keepAliveInterval: 300,
      cleanSession: false,
      mqttVersion: 4,
      onSuccess: function() {
        pageThat.setData({
          logTitle: utils.formatTime(new Date()) + "\tConnect Success!",
          logContent: ''
        })
      },
      onFailure: function(e) {
        pageThat.setData({
          logTitle: utils.formatTime(new Date()) + "\tConnect fail",
          logContent: JSON.stringify(e)
        })
      }
    };

    this.data.mqttClient.onMessageArrived = function(message) {
      pageThat.setData({
        logTitle: utils.formatTime(new Date()) + "\tMessage Arrived",
        logContent: message.payloadString
      })
    }

    this.data.mqttClient.connect(options);
  },

  onShow: function() {
    
  },
  onLoad: function() {
    
  }
  
})