var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://tux.home');
var mqttConnected = false;
var count = 0;
 
client.on('connect', function () {
  mqttConnected = true;
  console.log("mqtt->connected", arguments);
});

client.on('reconnect', function () {
  mqttConnected = true;
  console.log("mqtt->reconnected", arguments);
});

client.on('offline', function () {
  mqttConnected = false;
  console.log("mqtt->offline", arguments);
});

client.on('close', function () {
  mqttConnected = false;
  console.log("mqtt->close", arguments);
});

client.on('error', function (e) {
  mqttConnected = false;
  console.log("mqtt->error", arguments);
});

setInterval(send, 1000);

function send() {

    try {
	count++;	
	client.publish('sensors/solaris', '0;0;88;0;72;59;62;66;3,8;;2027 Count=' + count + ", date=" + new Date());
//	client.publish('sensors/solaris', JSON.stringify({text: "Hello", count: count, date: new Date()})); 
	client.publish('sensors/solaris', {text: "Hello", count: count, date: new Date()}); 
	console.log("published, mqttConnected=", mqttConnected);

    } catch(e) {
      console.log("Error: mqttConnected=", mqttConnected, e);
    }
}
