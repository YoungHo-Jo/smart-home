var net = require('net');
var util = require('util');
var fs = require('fs');
var xml2js = require('xml2js');
var ble = require('./ble')


var wdt = require('./wdt');

var useparentport = '';
var useparenthostname = '';

var upload_arr = [];
var download_arr = [];

var conf = {};

// This is an async file read
fs.readFile('conf.xml', 'utf-8', function (err, data) {
	if (err) {
		console.log("FATAL An error occurred trying to read in the file: " + err);
		console.log("error : set to default for configuration")
	} else {
		var parser = new xml2js.Parser({
			explicitArray: false
		});
		parser.parseString(data, function (err, result) {
			if (err) {
				console.log("Parsing An error occurred trying to read in the file: " + err);
				console.log("error : set to default for configuration")
			} else {
				var jsonString = JSON.stringify(result);
				conf = JSON.parse(jsonString)['m2m:conf'];

				useparenthostname = conf.tas.parenthostname;
				useparentport = conf.tas.parentport;

				if (conf.upload != null) {
					if (conf.upload['ctname'] != null) {
						upload_arr[0] = conf.upload;
					} else {
						upload_arr = conf.upload;
					}
				}

				if (conf.download != null) {
					if (conf.download['ctname'] != null) {
						download_arr[0] = conf.download;
					} else {
						download_arr = conf.download;
					}
				}
			}
		});
	}
});


var tas_state = 'init';

var upload_client = null;

var t_count = 0;

function timer_upload_action() {
	if (tas_state == 'upload') {
		var con = {
			value: `TAS ${t_count++},55.2`
		};

		upload_arr.some((e, idx) => {
			if(e.id == 'timer') {
				var cin = {
					ctname: e.ctname,
					con: con
				}

				console.log(JSON.stringify(cin) + ' ---->');
				upload_client.write(JSON.stringify(cin) + '<EOF>');

				return true // Break 
			} else {
				return false
			}
		})
		
	}
}


var tas_download_count = 0;

function on_receive(data) {
	if (tas_state == 'connect' || tas_state == 'reconnect' || tas_state == 'upload') {
		var data_arr = data.toString().split('<EOF>');
		if (data_arr.length >= 2) {
			for (var i = 0; i < data_arr.length - 1; i++) {
				var line = data_arr[i];
				var sink_str = util.format('%s', line.toString());
				var sink_obj = JSON.parse(sink_str);

				if (sink_obj.ctname == null || sink_obj.con == null) {
					console.log('Received: data format mismatch');
				} else {
					if (sink_obj.con == 'hello') {
						console.log('Received: ' + line);

						if (++tas_download_count >= download_arr.length) {
							tas_state = 'upload';
						}
					} else {
						// upload_arr.some((e, idx) => {
						// 	if(e.ctname == sink_obj.ctname) {
						// 		// console.log(`ACK : ${line} <----`)
						// 		return true 
						// 	} else {
						// 		return false 
						// 	}
						// })

						download_arr.some((e, idx) => {
							if(e.ctname == sink_obj.ctname) {
								g_down_buf = JSON.stringify({
									id: e.id,
									con: sink_obj.con
								})
								console.log(`${g_down_buf} <----`)

								// TODO: Write codes of controlling the switch 

								if(sink_obj.con && sink_obj.con.hasOwnProperty('cmd'))  {
									console.log("========================")
									for(var key in sink_obj.con) {
										var value = sink_obj.con.cmd[key]
										if(value == true || value == false) {
											ble.setSwitch(key, value)
										}
									}
								}

								return true
							} else {
								return false
							}
						})

					}
				}
			}
		}
	}
}


// var SerialPort = null;
// var myPort = null;
function tas_watchdog() {
	if (tas_state == 'init') {
		upload_client = new net.Socket();

		upload_client.on('data', on_receive);

		upload_client.on('error', function (err) {
			console.log(err);
			tas_state = 'reconnect';
		});

		upload_client.on('close', function () {
			console.log('Connection closed');
			upload_client.destroy();
			tas_state = 'reconnect';
		});

		if (upload_client) {
			console.log('tas init ok');
			tas_state = 'init_ble';
		}
	} else if (tas_state == 'init_ble') {
		// TODO: Init BLE central  
		
		console.log('tas init ble ok')
		tas_state = 'connect'
	} else if (tas_state == 'connect' || tas_state == 'reconnect') {
		upload_client.connect(useparentport, useparenthostname, () => {
			console.log('upload Connected');
			tas_download_count = 0;

			download_arr.every((e, idx) => {
				console.log('download Connected - ' + e.ctname + ' hello');
				var cin = {
					ctname: e.ctname,
					con: 'hello'
				};
				upload_client.write(JSON.stringify(cin) + '<EOF>');
			})

			if (tas_download_count >= download_arr.length) {
				console.log(`tas_download_count(${tas_download_count} download_arr.length${download_arr.length}`)
				tas_state = 'upload';
			}
		});
	}
}


wdt.set_wdt(require('shortid').generate(), 2, timer_upload_action);
wdt.set_wdt(require('shortid').generate(), 1, tas_watchdog);
wdt.set_wdt(require('shortid').generate(), 1, uploadRSSIs);
wdt.set_wdt(require('shortid').generate(), 1, uploadSwitchState);
wdt.set_wdt(require('shortid').generate(), 1, uploadAmps);
wdt.set_wdt(require('shortid').generate(), 10, uploadPlugs);

function uploadPlugs() {
	if(tas_state === 'upload') {
		upload_arr.every((e, idx) => {
			if(e.ctname === 'plug') {
				var cin = {
					ctname: e.ctname,
					con: Object.keys(ble.connectedPeripherals)
				}

				// console.log(`SEND: ${JSON.stringify(cin)} ---->`)
				upload_client.write(JSON.stringify(cin) + '<EOF>')
				return false
			} else {
				return true
			}
		})
	}
}


function uploadRSSIs() {
	if(tas_state === 'upload') {
		upload_arr.every((e, idx) => {
			if(e.ctname == 'rssi') {
					var cin = {
						ctname: e.ctname,
						con: ble.RSSIs
					}	

					// console.log(`SEND: ${JSON.stringify(cin)} ---->`)
					upload_client.write(JSON.stringify(cin) + '<EOF>')
					return false
			} else {
					return true
			}
		})
	}
}

function uploadSwitchState() {
	if(tas_state == 'upload') {
		upload_arr.every((e, idx) => {
			if(e.ctname == 'switch') {
					var cin = {
						ctname: e.ctname,
						con: ble.switchStates
					}	

					// console.log(`SEND: ${JSON.stringify(cin)} ---->`)
					upload_client.write(JSON.stringify(cin) + '<EOF>')
					return false
			} else {
				return true
			}
		})
	}
}

function uploadAmps() {
	// console.log(`Upload Amps ${tas_state}`)
	if(tas_state == 'upload') {
		upload_arr.every((e, idx) => {
			if(e.ctname == 'amps') {
					var cin = {
						ctname: e.ctname,
						con: ble.currentValues
					}	

					// console.log(`SEND: ${JSON.stringify(cin)} ---->`)
					upload_client.write(JSON.stringify(cin) + '<EOF>')
					return false
			} else {
					return true
			}
		})
	}
}
var g_down_buf = '';

setInterval(() => {
	// console.log(`tas_state: ${tas_state}`)

	// console.log(upload_arr)

	// console.log(ble.connectedPeripherals)
	// console.log(`download_count: ${tas_download_count}`)
}, 500)