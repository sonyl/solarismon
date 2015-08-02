var mysql      = require('mysql');
var fs = require('fs');
var connection = mysql.createConnection({
    host     : 'tux',
    user     : 'node',
    password : 'node123',
    database : 'solarismon'
});

var lineMapping = [ {
        name: 'unknown1',
        type: 'string'
    }, {
        name: 'unknown2',
        type: 'string'
    }, {
        name: 'P1',
        type: 'int'
    }, {
        name: 'P2',
        type: 'int'
    }, {
        name: 'TK',
        type: 'int'
    }, {
        name: 'TR',
        type: 'int'
    }, {
        name: 'TS',
        type: 'int'
    }, {
        name: 'TV',
        type: 'int'
    }, {
        name: 'V',
        type: 'float'
    }, {
        name: 'Status',
        type: 'string'
    }, {
        name: 'P',
        type: 'int'
    }];


connection.connect();
process.argv.slice(2).forEach(function (val) {
    handleFile(val);
});
connection.end();

function handleFile(fileName) {
    var array = fs.readFileSync(fileName).toString().split("\n");
    var data = [];

    array.forEach(function(line, i){
        if(line.length) {
            var record = parseLine(line);
            if (record) {
                data.push(
                    [record.date, record.TK, record.TR, record.TS, record.TV, record.V, record.Status, record.P, record.P1, record.P2]
                );
            } else {
                console.log("file %s, line %s, invalid content found: '%s'", fileName, i + 1, line);
            }
        }
    });
    if(data.length) {
        connection.query("INSERT INTO data " +
            "(entry_ts, collector_tmp, backward_flow_tmp, storage_tmp, forward_flow_tmp, flow, status, power, pump1, pump2) values ?",
            [data], function (err, result) {
                if (err) {
                    console.log("Error while importing file %s", fileName);
                    throw err;
                }
                console.log('inserted %s rows from file: %s', result.affectedRows, fileName);
            });
    }
}

function isDateValid(d) {
    return Object.prototype.toString.call(d) === "[object Date]"  && isNaN( d.getTime()) === false;
}


function parseLine(line) {
    var dateIndex, dateStr, date, parts;
    var record = {};
    var isValid = true;

    if (typeof line == 'string' || line instanceof String) {
        dateIndex = line.lastIndexOf(':');
        dateStr = line.substring(0, dateIndex);
        date = new Date(dateStr);
        isValid = isDateValid(date);

        line = line.substring(dateIndex + 2);
        record.date = date;

        parts = line.split(';', lineMapping.length);
        if(isValid && parts.length === lineMapping.length) {
            record.line = line;
            parts.forEach(function(p, i) {
                var name = lineMapping[i].name;
                if(lineMapping[i].type === 'string') {
                    record[name] = p;
                } else if(lineMapping[i].type === 'int'){
                    record[name] = parseInt(p);
                } else if(lineMapping[i].type === 'float'){
                    record[name] = parseFloat(p);
                }
                if(Number.isNaN(record[name])) {
                    isValid = false;
                }
            });
        } else {
            isValid = false;
        }
    }
    return isValid ? record : null;
}