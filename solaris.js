var fs = require('fs');
var format = require('util').format;
var serialport = require("serialport");
var mqtt = require('mqtt');

var mqttClient  = mqtt.connect('mqtt://tux.home');
var SerialPort = serialport.SerialPort;

var baseFileName = '/home/pi/solaris';
var mqttConnected = false;

var lineMapping = ['?', '?', 'P1', 'P2', 'TK', 'TR', 'TS', 'TV', 'V', 'Status', 'P'];  

var serial = new SerialPort("/dev/ttyAMA0", {
  baudrate: 19200,
  parser: serialport.parsers.readline("\r")
});

var mqttTopic = "sensors/solaris"
process.env.TZ = 'Europe/Berlin';


serial.on("open", function () {
  console.log('open');
  serial.on('data', function(line) {
    line = line.replace(/(\r\n|\n|\r)/gm,"");	
    var data = parseLine(line);
    writeFile(data);
    data = adjustFormat(data);
    mqttClient.publish(mqttTopic, JSON.stringify(data)); 
    console.log(data);	
  });
});


mqttClient.on('connect', function () {
  mqttConnected = true;
  console.log("mqtt->connected", arguments);
});

mqttClient.on('reconnect', function () {
  mqttConnected = true;
  console.log("mqtt->reconnected", arguments);
});

mqttClient.on('offline', function () {
  mqttConnected = false;
  console.log("mqtt->offline", arguments);
});

mqttClient.on('close', function () {
  mqttConnected = false;
  console.log("mqtt->close", arguments);
});

mqttClient.on('error', function (e) {
  mqttConnected = false;
  console.log("mqtt->error", arguments);
});




function writeFile(data){
    var date = data.date;	
    var year = date.getFullYear();
    var month = date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : '' + (date.getMonth() + 1);	
    var day = date.getDate() < 10 ? '0' + date.getDate() : '' + date.getDate(); 
    var filename = format("%s-%d-%s-%s.txt", baseFileName, year, month, day);
    fs.appendFileSync(filename, format("%s: %s\n", data.date, data.line || 'error'));		
}


function parseLine(line) {
    var result = {date: new Date()};
    if (typeof line == 'string' || line instanceof String) {
  	var parts = line.split(';', lineMapping.length);
	if(parts.length === lineMapping.length) {
            result.line = line;
	    parts.forEach(function(p, i) {
		var name = lineMapping[i] ==='?' ? 'var' + i : lineMapping[i];
		result[name] = p;
	    });
	}
    }
    return result;
}

function adjustFormat(data) {
    if(data.V){
        data.V = data.V.replace(/,/g, '.');
    }
    return data;
}




