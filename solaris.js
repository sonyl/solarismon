const fs = require('fs');
const format = require('util').format;
const SerialPort = require("serialport");
const Readline = require('@serialport/parser-readline');
const mqtt = require('mqtt');

/* with keepalive=0, serial receiving is completely blocked, with the standard value of keepalive=60,
 * the serial receiving is blocked for 60s and then 2 messages are received consecutively
 * workaround: set keepalive to 15 (which probably blocks for 15s)
 */
const mqttClient  = mqtt.connect('mqtt://tux.home', {keepalive: 15});

const baseFileName = '/home/pi/solaris';
let mqttConnected = false;
const mqttTopic = "sensors/solaris"

const lineMapping = ['?', '?', 'P1', 'P2', 'TK', 'TR', 'TS', 'TV', 'V', 'Status', 'P'];  

const port = new SerialPort("/dev/ttyAMA0", {
  baudRate: 19200,
});

const parser = port.pipe(new Readline({ delimiter: '\r' }))

process.env.TZ = 'Europe/Berlin';

parser.on('data', function(line) {
    line = line.replace(/(\r\n|\n|\r)/gm,"");	
    var data = parseLine(line);
    writeFile(data);
    data = adjustFormat(data);
    mqttClient.publish(mqttTopic, JSON.stringify(data)); 
    console.log(data);	
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




