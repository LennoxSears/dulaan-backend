import { BleClient, textToDataView, hexStringToDataView } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';

window.deviceAddress = ''
window.controlInterval = null
window.aiInterval = null
window.connectFlag = false
window.aiReturn = []
window.aiIndex = 0

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

                // controlInterval = setInterval(() => {
                //     window.dulaan.write(window.current_pwm)
                // }, 100)
                //console.log('begin control interval.')

                // aiInterval = setInterval(() => {
                //     if (aiReturn.length && aiReturn.length > 0) {
                //         if (Math.round((aiReturn[aiIndex] / 255) * 100) != NaN) {
                //             setIntensity(Math.round((aiReturn[aiIndex] / 255) * 100))
                //             aiIndex = (aiIndex + 1) % aiReturn.length
                //         }
                //     }
                // }, 210)
                // console.log('begin ai interval.')

            }, 5000);
        } catch (error) {
            console.error(error);
        }
    },
    write: (pwm) => { window.ble.write(window.deviceAddress, "0000FFE0-0000-1000-8000-00805F9B34FB", "0000FFE1-0000-1000-8000-00805F9B34FB", decimalToHexString(pwm)) },
    disconnect: async () => {
        await window.dulaan.write(0)
        await await BleClient.disconnect()
    },
    start_record: () => {
        VoiceRecorder.startRecording()
    },
    stop_record: async () => {
        let result = await VoiceRecorder.stopRecording()
        return result.value.recordDataBase64
    }
}