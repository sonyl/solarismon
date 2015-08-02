# solarismon

Simple RaspberryPi based Solaris RPS3 Solar Heating System Monitor
---
The goal of this project is to monitor the behavior and afterwards optimize the settings of a Rotex Solaris RPS3 solar 
heating system with the least possible efforts.

Therefore a few existing hardware and software components and an already up and running linux home server where utilized.

Detailed information is available on **[the project homepage](http://sonyl.github.io/solarismon/)**
### Components
- a **[RaspberryPi](https://www.raspberrypi.org/)** receives the serial output of the Rotex Solaris control unit 
(CONF connector, 3.5mm stereo jack).
- a **JavaScript** program running on the Pi, handles the data, does some simple conversions, writes the data to 
log files and finally generates a **[MQTT] (http://mqtt.org)** message for every received measurement 
- this MQTT message is transferred to a **[Mosquitto](http://mosquitto.org/)** MQTT broker  running on the linux home server.
- an **[OpenHAB] (http://www.openhab.org/)** home automation server running on the same linux box is configured to receive the 
MQTT messages. It is the task of openHAB to store the measured values in a round robin database and to visualize them. 
The openHAB server is accessible via a browser in the local network, but nice smartphone client apps for android and iOS are available as well.


I'm pretty sure that it would be possible to run the openHAB and the mosquitto MQTT broker on the RasberryPi also, but installing them on the available
linux box with less limited resources than the Pi was promising less efforts in installation.

### Hints

1. **Serial Connection:** 
 The three contacts of the 3.5mm stereo jack are:
 * `Tip:    Solaris TX       connected to RX of the RaspberryPi`
 * `Ring:   Solaris RX       not used`
 * `Sleeve: GND              connected to GND of the RaspberryPi` 
 
 The serial voltage level used by the Solaris heating system controller panel is 5V, whereas the RaspberryPi uses 3.3V. Hence a [level shifter](http://elinux.org/RPi_GPIO_Interface_Circuits#Level_Shifters) 
 is needed. In my case, a simple [2 resistor voltage divider](http://elinux.org/RPi_GPIO_Interface_Circuits#Voltage_divider) works fine. Activate the Solaris data output of the RPS3 module as described in the rotex manual. I selected a transfer interval 
 of 30s and a baudrate of 19200.

2. **Node.js init script:**
If you want to have your Node.js application automatically started on every RaspberryPi reboot, an init script
like this one https://gist.github.com/peterhost/715255 may be used.  
Since */bin/sh* is a softlink to */bin/dash* on my Raspbian linux, the script did not work as expected, so I had to replace

        #!/bin/sh
        with 
        #!/bin/bash
in the first line of the script.
The Node.js application is simply started with 

        node solaris.js
3. **openHAB configuration:**  
Some example openHAB configuration files (items, persistence, sitemaps) are located unter the "openhab" directory in this repository. They define items (measurement values), their graphical representation in the openHAB clients and their persistence strategy.
Don't forget to activate and configure the MQTT binding, as described in the [openHAB configuration wiki](https://github.com/openhab/openhab/wiki/MQTT-Binding). For me, changing / uncommenting the following two lines of `OPENHAB_HOME/configurations/openhab.cfg` was sufficient.

        mqtt:tux.url=tcp://tux.home:1883
        mqtt:tux.clientId=openHAB
4. **MySql import tool:**  
Logfiles are created for each individual day on the SD-card of the RaspberryPi. The naming scheme for the filenames is *solaris-yyyy-mm-dd.txt*. It is possible to import the collected data from these logfiles into a database for later avaluation and analysis. The tool that imports the logfiles into a mysql database is *cp2db*. Create a table with the ddl-statements in *resource/create.sql* and adjust the connection properties and database credentials in line 4 to 7 of *cp2db.js*. To import all logfiles of a specific month, start the import for example with:

        node cp2db solaris-2015-07*.txt




