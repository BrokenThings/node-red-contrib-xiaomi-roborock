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
const util = require('util');

module.exports = function(RED) {

    function RoborockNodeEvent(config) {
        var node = this;
        RED.nodes.createNode(node, config);
        node.connection = RED.nodes.getNode(config.connection);
        node.config = config;

        if (!node.connection) return;

        miio.device({
                address: node.connection.host,
                token: node.connection.token
            })
            .then(device => {
                node.device = device;

                //console.log(JSON.stringify(device, null, 4));

                device.on('stateChanged', change => {
                    getState();
                });

                getState();
                node.interval = setInterval(() => getState(), node.config.pooling * 1000);


                if (node.config.events) {
                    device.onAny(event => {
                        node.send({
                            payload: {
                                event: event
                            }
                        });
                    });
                }

            })
            .catch(err => {
                node.warn('Encountered an error while connecting to device: ' + err.message);
            });

        function getState() {
            node.device.state()
                .then(state => {
                    var jsonState = JSON.stringify(state);
                    if (jsonState != node.lastState) {
                        node.lastState = JSON.stringify(state);
                        node.send({
                            payload: {
                                state: state
                            }
                        });
                    }
                });
        }
    }

    RED.nodes.registerType("roborockEvent", RoborockNodeEvent);
}
