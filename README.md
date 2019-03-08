
# "Generic Up/Down/Stop window blind" Plugin

Example config.json:

```
    "accessories": [
        {
            "accessory": "UpDownStopBlind",
            "name": "Blind Living Room",
            "time": 10,
            "cmd_up" : "cmd2cap.py -c up -b 0x1 -C 0x23 > /dev/udp/192.168.1.12/1236",
            "cmd_down" : "cmd2cap.py -c down -b 0x1 -C 0x23 > /dev/udp/192.168.1.12/1236",
            "cmd_stop" : "cmd2cap.py -c dot -b 0x1 -C 0x23 > /dev/udp/192.168.1.12/1236"
        }   
    ]

```

With this plugin, you can hook any command line controllable window blind that supports up, down and stop commands up to Homebridge.

For instance, with the [Heicko window blind package generator](http://github.com/agraf/heicko) and the [NodeMCU 433 Mhz gateway](http://github.com/agraf/nodemcu-433gw) you can remote control any Heicko window blind in your home.

## time

Window blinds take a variable time to open. This property describes the number of seconds that it takes for the blind to close fully. This is used to automatically calculate a closing percentage so that you can stop the blind at any given point.

```
    "accessories": [
        {
          ...
          "time": 10,
          ...
        }   
    ]

```

## cmd\_up / cmd\_down / cmd\_stop

These commands are executed when the window blind should go up / down / stop respectively.

```
    "accessories": [
        {
          ...
            "cmd_up" : "cmd2cap.py -c up -b 0x1 -C 0x23 > /dev/udp/192.168.1.12/1236",
            "cmd_down" : "cmd2cap.py -c down -b 0x1 -C 0x23 > /dev/udp/192.168.1.12/1236",
            "cmd_stop" : "cmd2cap.py -c dot -b 0x1 -C 0x23 > /dev/udp/192.168.1.12/1236"
          ...
        }   
    ]

```
