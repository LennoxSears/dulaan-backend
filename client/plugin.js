import { BleClient, textToDataView, hexStringToDataView } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';
import Peer from 'peerjs';

window.deviceAddress = ''
window.controlInterval = null
window.aiInterval = null
window.connectFlag = false
window.aiReturn = []
window.aiIndex = 0

// Remote control state
window.remoteControl = {
    isHost: false,
    isRemote: false,
    peer: null,
    hostId: null,
    connections: new Map(),
    remoteUsers: new Set(),
    isControlledByRemote: false,
    lastRemoteCommand: null
}

let scan = async () => {
    try {
        await BleClient.initialize();
        console.log('begin scanning...')
        await BleClient.requestLEScan({},
            (result) => {
                console.log('received new scan result', JSON.stringify(result));
                if (result.device.name == "XKL-Q086-BT") {
                    deviceAddress = result.device.deviceId
                }
            }
        );
        setTimeout(async () => {
            await BleClient.stopLEScan();
            console.log('stopped scanning');
        }, 60000);
    } catch (error) {
        console.error(error);
    }
}

let onDisconnect = (deviceId) => {
    clearInterval(controlInterval);
    clearInterval(aiInterval)
    window.connectFlag = false
    console.log(`device ${window.deviceId} disconnected`);
}
let connect = async (deviceId) => {
    await BleClient.connect(deviceId, (deviceId) => onDisconnect(deviceId));
    console.log('connected to device', deviceId);
}
let read = async (deviceId, serviceId, characteristic) => {
    const result = await BleClient.read(deviceId, serviceId, characteristic);
    return result
}
let write = async (deviceId, serviceId, characteristic, hex) => {
    //console.log(hexStringToDataView(hex))
    const result = await BleClient.write(deviceId, serviceId, characteristic, hexStringToDataView(hex));
    return result
}

let decimalToHexString = (decimalNumber) => {
    // 新增输入验证：若非数字或非纯数字字符串，返回'00'
    if (typeof decimalNumber === 'string') {
        if (!/^\d+$/.test(decimalNumber)) return '00'; // 字符串包含非数字字符
        decimalNumber = parseInt(decimalNumber, 10);  // 纯数字字符串转数字
    } else if (typeof decimalNumber !== 'number' || !Number.isInteger(decimalNumber) || decimalNumber < 0) {
        return '00'; // 非数字类型/非整数/负数
    }

    // 原有转换逻辑
    const hexString = decimalNumber.toString(16);
    return hexString.length % 2 !== 0
        ? `0${hexString}`.toUpperCase()  // 补零并转大写（如需要）
        : hexString.toUpperCase();       // 直接转大写
};

window.VoiceRecorder = Capacitor.Plugins.VoiceRecorder;
VoiceRecorder.requestAudioRecordingPermission().then((result) => console.log(result.value));

window.ble = {
    read: read,
    write: write,
    scan: scan,
    connect: connect,
    client: BleClient
}

window.dulaan = {
    connect: async () => {
        try {
            await BleClient.initialize();
            console.log('begin scanning...')
            await BleClient.requestLEScan({},
                (result) => {
                    console.log('received new scan result', JSON.stringify(result));
                    if (result.device.name == "XKL-Q086-BT") {
                        window.deviceAddress = result.device.deviceId
                    }
                }
            );
            setTimeout(async () => {
                await BleClient.stopLEScan();
                console.log('stopped scanning');
                await BleClient.connect(window.deviceAddress, (deviceId) => onDisconnect(deviceId));
                window.connectFlag = true
                console.log('connected to device');
            }, 5000);
        } catch (error) {
            console.error(error);
        }
    },
    
    write: (pwm) => {
        // Check if device is controlled by remote users
        if (window.remoteControl.isControlledByRemote) {
            console.log('Device is controlled by remote users, ignoring local write command');
            return;
        }
        
        window.ble.write(window.deviceAddress, "0000FFE0-0000-1000-8000-00805F9B34FB", "0000FFE1-0000-1000-8000-00805F9B34FB", decimalToHexString(pwm));
    },
    
    writeForce: (pwm) => {
        // Force write regardless of remote control state (used by remote commands)
        window.ble.write(window.deviceAddress, "0000FFE0-0000-1000-8000-00805F9B34FB", "0000FFE1-0000-1000-8000-00805F9B34FB", decimalToHexString(pwm));
    },
    
    disconnect: async () => {
        await window.dulaan.writeForce(0)
        await BleClient.disconnect()
    },
    
    start_record: () => {
        VoiceRecorder.startRecording()
    },
    
    stop_record: async () => {
        let result = await VoiceRecorder.stopRecording()
        return result.value.recordDataBase64
    },

    // New API integration functions
    speechToText: async (audioBase64, options = {}) => {
        try {
            const response = await fetch('https://europe-west1-dulaan-backend.cloudfunctions.net/speechToText', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    audioContent: audioBase64,
                    encoding: options.encoding || 'WEBM_OPUS',
                    sampleRateHertz: options.sampleRateHertz || 48000,
                    languageCode: options.languageCode // Optional for auto-detection
                })
            });

            if (!response.ok) {
                throw new Error(`Speech-to-text API error: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Speech-to-text error:', error);
            throw error;
        }
    },

    speechToTextWithLLM: async (audioBase64, currentPwm, msgHis = [], options = {}) => {
        try {
            const response = await fetch('https://europe-west1-dulaan-backend.cloudfunctions.net/speechToTextWithLLM', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    msgHis: msgHis,
                    audioContent: audioBase64,
                    currentPwm: currentPwm,
                    geminiApiKey: 'AQ.Ab8RN6KGpvk0TlA0Z1nwdrQ-FH2v2WIk1hrnBjixpurRp6YtuA', // Move to config
                    encoding: options.encoding || 'WEBM_OPUS',
                    sampleRateHertz: options.sampleRateHertz || 48000,
                    languageCode: options.languageCode
                })
            });

            if (!response.ok) {
                throw new Error(`Speech-to-text with LLM API error: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Speech-to-text with LLM error:', error);
            throw error;
        }
    }
}

// Remote Control Functions
window.remoteControl = {
    ...window.remoteControl,

    // Initialize as host (device owner)
    initializeAsHost: () => {
        if (window.remoteControl.peer) {
            window.remoteControl.peer.destroy();
        }

        // Generate unique host ID
        const hostId = `dulaan-host-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        
        window.remoteControl.peer = new Peer(hostId, {
            host: 'peerjs-server-dot-dulaan-backend.appspot.com',
            port: 443,
            path: '/peerjs',
            secure: true,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        window.remoteControl.peer.on('open', (id) => {
            window.remoteControl.isHost = true;
            window.remoteControl.hostId = id;
            console.log('Host initialized with ID:', id);
            
            // Display host ID to user
            if (window.updateHostIdDisplay) {
                window.updateHostIdDisplay(id);
            }
        });

        window.remoteControl.peer.on('connection', (conn) => {
            console.log('Remote user connected:', conn.peer);
            window.remoteControl.connections.set(conn.peer, conn);
            window.remoteControl.remoteUsers.add(conn.peer);
            window.remoteControl.isControlledByRemote = true;

            conn.on('data', (data) => {
                window.remoteControl.handleRemoteCommand(data, conn.peer);
            });

            conn.on('close', () => {
                console.log('Remote user disconnected:', conn.peer);
                window.remoteControl.connections.delete(conn.peer);
                window.remoteControl.remoteUsers.delete(conn.peer);
                
                // If no more remote users, restore local control
                if (window.remoteControl.remoteUsers.size === 0) {
                    window.remoteControl.isControlledByRemote = false;
                    window.dulaan.writeForce(0); // Stop motor when all remotes disconnect
                }
            });

            conn.on('error', (error) => {
                console.error('Connection error with', conn.peer, ':', error);
                window.remoteControl.connections.delete(conn.peer);
                window.remoteControl.remoteUsers.delete(conn.peer);
            });
        });

        window.remoteControl.peer.on('error', (error) => {
            console.error('PeerJS host error:', error);
        });

        return hostId;
    },

    // Connect as remote user
    connectAsRemote: (hostId) => {
        if (window.remoteControl.peer) {
            window.remoteControl.peer.destroy();
        }

        window.remoteControl.peer = new Peer({
            host: 'peerjs-server-dot-dulaan-backend.appspot.com',
            port: 443,
            path: '/peerjs',
            secure: true,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        window.remoteControl.peer.on('open', (id) => {
            console.log('Remote peer initialized with ID:', id);
            
            // Connect to host
            const conn = window.remoteControl.peer.connect(hostId);
            
            conn.on('open', () => {
                window.remoteControl.isRemote = true;
                window.remoteControl.hostId = hostId;
                window.remoteControl.connections.set(hostId, conn);
                console.log('Connected to host:', hostId);
                
                if (window.updateRemoteConnectionStatus) {
                    window.updateRemoteConnectionStatus(true);
                }
            });

            conn.on('error', (error) => {
                console.error('Failed to connect to host:', error);
                if (window.updateRemoteConnectionStatus) {
                    window.updateRemoteConnectionStatus(false, error.message);
                }
            });

            conn.on('close', () => {
                console.log('Disconnected from host');
                window.remoteControl.isRemote = false;
                window.remoteControl.connections.delete(hostId);
                if (window.updateRemoteConnectionStatus) {
                    window.updateRemoteConnectionStatus(false);
                }
            });
        });

        window.remoteControl.peer.on('error', (error) => {
            console.error('PeerJS remote error:', error);
            if (window.updateRemoteConnectionStatus) {
                window.updateRemoteConnectionStatus(false, error.message);
            }
        });
    },

    // Send control command to host
    sendControlCommand: (mode, value, additionalData = {}) => {
        if (!window.remoteControl.isRemote || !window.remoteControl.connections.has(window.remoteControl.hostId)) {
            console.error('Not connected as remote user');
            return false;
        }

        const command = {
            type: 'control_command',
            mode: mode, // 'ai', 'ambient', 'touch'
            value: value,
            userId: window.remoteControl.peer.id,
            timestamp: Date.now(),
            ...additionalData
        };

        const conn = window.remoteControl.connections.get(window.remoteControl.hostId);
        conn.send(command);
        console.log('Sent control command:', command);
        return true;
    },

    // Handle incoming remote commands (host side)
    handleRemoteCommand: (data, fromUserId) => {
        if (!window.remoteControl.isHost) {
            return;
        }

        console.log('Received remote command from', fromUserId, ':', data);

        if (data.type === 'control_command') {
            window.remoteControl.lastRemoteCommand = {
                ...data,
                fromUserId: fromUserId,
                receivedAt: Date.now()
            };

            // Apply the control command to the motor
            if (typeof data.value === 'number' && data.value >= 0 && data.value <= 255) {
                window.current_pwm = data.value;
                window.dulaan.writeForce(data.value);
                
                // Update UI if callback exists
                if (window.updateRemoteControlDisplay) {
                    window.updateRemoteControlDisplay(data, fromUserId);
                }
            }
        }
    },

    // Disconnect from remote control
    disconnect: () => {
        if (window.remoteControl.peer) {
            window.remoteControl.peer.destroy();
            window.remoteControl.peer = null;
        }

        window.remoteControl.isHost = false;
        window.remoteControl.isRemote = false;
        window.remoteControl.hostId = null;
        window.remoteControl.connections.clear();
        window.remoteControl.remoteUsers.clear();
        window.remoteControl.isControlledByRemote = false;
        window.remoteControl.lastRemoteCommand = null;

        console.log('Disconnected from remote control');
    },

    // Get current status
    getStatus: () => {
        return {
            isHost: window.remoteControl.isHost,
            isRemote: window.remoteControl.isRemote,
            hostId: window.remoteControl.hostId,
            connectedUsers: Array.from(window.remoteControl.remoteUsers),
            isControlledByRemote: window.remoteControl.isControlledByRemote,
            lastRemoteCommand: window.remoteControl.lastRemoteCommand
        };
    }
}