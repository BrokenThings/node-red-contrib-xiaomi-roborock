/**
 * Copyright 2013, 2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

"use strict";
const miio = require('miio');

module.exports = function(RED) {

    function RoborockNode(config) {
        var node = this;
        RED.nodes.createNode(node, config);
        node.connection = RED.nodes.getNode(config.connection);
	
	node.on('input', function(msg) {
          node.command = msg.payload.command || config.command || 'find_me';
          node.args = msg.payload.args || config.args || null;
          node.jobid = msg.payload.jobid || config.jobid || null;
          var device = miio.device({ address: node.connection.host, token: node.connection.token })
            .then(device => {
                device.call(node.command, node.args)
                        .then(result => {
                                node.send( {request: { command: node.command, args: node.args, jobid: node.jobid }, result: result } );
                        })
                        .catch(err => {
                                console.log('Encountered an error while controlling device');
                                console.log('Error was:');
                                console.log(err.message);
                                node.send( {request: { command: node.command, args: node.args, jobid: node.jobid }, err: err } );
                        });

          })
          .catch(err => {
              console.log('Encountered an error while connecting to device');
              console.log('Error was:');
              console.log(err.message);
              node.send( {request: { command: node.command, args: node.args, jobid: node.jobid }, err: err } );
          });
        });
    }

    RED.nodes.registerType("roborock",RoborockNode);
}
