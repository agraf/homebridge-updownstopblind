//
// Homebridge Up/Down/Stop Window Blind plugin
// Copyright Alexander Graf <agraf@csgraf.de>
//
// Inspired by https://github.com/nfarina/homebridge-dummy.git

"use strict";

var Service, Characteristic, HomebridgeAPI;

module.exports = function(homebridge) {

  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  HomebridgeAPI = homebridge;
  homebridge.registerAccessory("homebridge-updownstopblind", "UpDownStopBlind", UpDownStopBlind);
}

function UpDownStopBlind(log, config) {
  this.log = log;
  this.name = config.name;
  this._service = new Service.WindowCovering(this.name);
  this.time = config.time;
  this.cmd_up = config.cmd_up;
  this.cmd_down = config.cmd_down;
  this.cmd_stop = config.cmd_stop;

  this.cacheDirectory = HomebridgeAPI.user.persistPath();
  this.storage = require('node-persist');
  this.storage.initSync({dir:this.cacheDirectory, forgiveParseErrors: true});
  var cachedPosition = this.storage.getItemSync(this.name);

  if (cachedPosition === undefined)
    cachedPosition = 100;

  this._service.setCharacteristic(Characteristic.TargetPosition, cachedPosition);
  this._service.setCharacteristic(Characteristic.CurrentPosition, cachedPosition);
  
  this._service.getCharacteristic(Characteristic.TargetPosition)
    .on('set', this._setTargetPosition.bind(this));

  this.log("Blind '" + this.name + "' is at " + cachedPosition + " and needs " + this.time + "s to come down");
}

UpDownStopBlind.prototype.getServices = function() {
  return [this._service];
}

UpDownStopBlind.prototype._send_msg = function(cmd) {
  // Clear old timer if around
  if (this.send_timer !== undefined) {
    clearInterval(this.send_timer);
    this.send_timer = undefined;
  }

  const { spawn } = require('child_process');

  // Trigger new blind message
  var cmdline;

  if (cmd == "up")
    cmdline = this.cmd_up;
  else if (cmd == "down")
    cmdline = this.cmd_down;
  else if (cmd == "stop")
    cmdline = this.cmd_stop;

  spawn("/bin/bash", [ "-c", cmdline ], { detached:true, stdio:'inherit' })
  this.log("Sending " + cmd + " Message via '" + cmdline + "'");
}

UpDownStopBlind.prototype._setTargetPosition = function(position, callback) {

  this.log("Setting blind to " + position);

  // Clear old timer if around
  if (this.move_timer !== undefined) {
    clearInterval(this.move_timer);
    this.move_timer = undefined;
  }

  var curpos;
  curpos = this.storage.getItemSync(this.name);

  if (curpos == position) {
    callback();
    return;
  }

  var cmd;
  if (position > curpos) {
    cmd = "up"
  } else {
    cmd = "down"
  }

  this._send_msg(cmd);

  var move_times = 0;
  var stop_times = 0;

  this.move_timer = setInterval(function() {
      var stop = false;
      if (cmd == "up" && curpos >= position)
          stop = true;
      else if (cmd == "down" && curpos <= position)
          stop = true;

      if (stop) {
          stop_times++;

          /* Send at least 5 stop messages so we really stop */
          if (stop_times >= 5) {
              clearInterval(this.move_timer);
              this.move_timer = undefined;
          } else {
              if (position != 100 && position != 0) {
                  // XXX 100/0 should still get an explicit stop, but after 10s or so
                  this._send_msg("stop");
              }
          }
      } else {
          move_times++;

          if (cmd == "up")
            curpos++;
          else
            curpos--;

          /* Only send 5 messages of the same type */
          if (move_times <= 5) {
              this._send_msg(cmd);
          }
      }

      this.log("New position: " + curpos);
      this._service.setCharacteristic(Characteristic.CurrentPosition, curpos);
      this.storage.setItemSync(this.name, curpos);
    }.bind(this), (this.time * 1000) / 100); // ticks on every percent

  callback();
}
