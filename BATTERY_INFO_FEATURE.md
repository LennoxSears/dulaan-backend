# Battery Info Feature - V3.0 Protocol

## Overview
Added device information query feature to the motor controller, supporting battery level, firmware version, and motor count retrieval via BLE notifications.

## Protocol Specification

### New Characteristic
- **UUID**: `9A521A2D-594F-4E2B-B123-5F739A2D594F`
- **Properties**: Write, Notify
- **Security**: Encryption Required (LESC)

### Query Request (Phone → Device)
**Format**: 2 bytes
```
Byte 0: 0xB0 (Protocol header)
Byte 1: 0x00 (Query command)
```

### Query Response (Device → Phone)
**Format**: 6 bytes (via notification)
```
Byte 0: 0xB0 (Protocol header)
Byte 1: 0x00 (Response command)
Byte 2: motor_count (uint8, currently fixed at 1)
Byte 3: fw_version_low (uint8)
Byte 4: fw_version_high (uint8)
Byte 5: battery_level (uint8, 0-100%)
```

**Example**:
- Firmware 1.2 → `fw_version_high=1, fw_version_low=2`
- Battery 85% → `battery_level=85`

## Implementation

### New Properties
```javascript
// Device Info characteristic UUID
this.DEVICE_INFO_CHAR_UUID = "9A521A2D-594F-4E2B-B123-5F739A2D594F";

// Device info storage
this.deviceInfo = {
    motorCount: null,
    firmwareVersion: null,
    batteryLevel: null,
    lastUpdated: null
};

// Battery update callback
this.onBatteryUpdate = null;
```

### New Methods

#### Query Device Info
```javascript
await motorController.queryDeviceInfo();
```
Sends query request to device. Response received via notification.

#### Get Battery Level
```javascript
const batteryLevel = motorController.getBatteryLevel();
// Returns: 0-100 (percentage) or null if not yet queried
```

#### Get Firmware Version
```javascript
const version = motorController.getFirmwareVersion();
// Returns: "1.2" or null if not yet queried
```

#### Get Motor Count
```javascript
const count = motorController.getMotorCount();
// Returns: 1 (currently fixed) or null if not yet queried
```

#### Get All Device Info
```javascript
const info = motorController.getDeviceInfo();
// Returns: {
//   motorCount: 1,
//   firmwareVersion: "1.2",
//   batteryLevel: 85,
//   lastUpdated: "2024-12-12T08:36:00.000Z"
// }
```

#### Set Battery Update Callback
```javascript
motorController.setBatteryUpdateCallback((deviceInfo) => {
    console.log('Battery:', deviceInfo.batteryLevel + '%');
    console.log('Firmware:', deviceInfo.firmwareVersion);
});
```

### Automatic Behavior

**On Connection:**
1. Automatically starts device info notifications
2. Immediately queries device info
3. Updates `deviceInfo` object when response received

**On Disconnection:**
1. Automatically stops device info notifications
2. Device info remains cached until next connection

## Usage Examples

### Basic Usage
```javascript
// Connect to device
await window.dulaan.motor.scan();
await window.dulaan.motor.connect();

// Device info is automatically queried on connection
// Wait a moment for response
setTimeout(() => {
    const battery = window.dulaan.motor.getBatteryLevel();
    console.log('Battery:', battery + '%');
}, 1000);
```

### With Callback
```javascript
// Set up callback before connecting
window.dulaan.motor.setBatteryUpdateCallback((info) => {
    document.getElementById('battery').textContent = info.batteryLevel + '%';
    document.getElementById('firmware').textContent = info.firmwareVersion;
});

// Connect - callback will be triggered when info received
await window.dulaan.motor.connect();
```

### Manual Query
```javascript
// Query device info at any time after connection
await window.dulaan.motor.queryDeviceInfo();

// Response will trigger callback if set
// Or check manually after a delay
setTimeout(() => {
    const info = window.dulaan.motor.getDeviceInfo();
    console.log(info);
}, 500);
```

### Periodic Battery Monitoring
```javascript
// Query battery every 30 seconds
setInterval(async () => {
    if (window.dulaan.motor.isMotorConnected()) {
        await window.dulaan.motor.queryDeviceInfo();
    }
}, 30000);
```

## UI Integration Example

### React Component
```jsx
function BatteryIndicator() {
    const [battery, setBattery] = useState(null);
    const [firmware, setFirmware] = useState(null);

    useEffect(() => {
        // Set up callback
        window.dulaan.motor.setBatteryUpdateCallback((info) => {
            setBattery(info.batteryLevel);
            setFirmware(info.firmwareVersion);
        });

        // Query on mount if already connected
        if (window.dulaan.motor.isMotorConnected()) {
            window.dulaan.motor.queryDeviceInfo();
        }
    }, []);

    return (
        <div>
            <div>Battery: {battery !== null ? `${battery}%` : 'Unknown'}</div>
            <div>Firmware: {firmware || 'Unknown'}</div>
        </div>
    );
}
```

### Vanilla JavaScript
```javascript
// Update UI when battery info received
window.dulaan.motor.setBatteryUpdateCallback((info) => {
    document.getElementById('battery-level').textContent = info.batteryLevel + '%';
    document.getElementById('battery-bar').style.width = info.batteryLevel + '%';
    document.getElementById('firmware-version').textContent = info.firmwareVersion;
    
    // Update battery icon based on level
    const icon = document.getElementById('battery-icon');
    if (info.batteryLevel > 80) {
        icon.className = 'battery-full';
    } else if (info.batteryLevel > 20) {
        icon.className = 'battery-medium';
    } else {
        icon.className = 'battery-low';
    }
});
```

## Error Handling

### Connection Failure
```javascript
try {
    await window.dulaan.motor.connect();
} catch (error) {
    console.error('Connection failed:', error);
    // Device info will not be available
}
```

### Query Failure
```javascript
const success = await window.dulaan.motor.queryDeviceInfo();
if (!success) {
    console.warn('Failed to query device info');
    // Check if device is connected
    if (!window.dulaan.motor.isMotorConnected()) {
        console.error('Device not connected');
    }
}
```

### Notification Setup Failure
If notification setup fails during connection, the connection will still succeed but device info will not be available. This is logged as a warning and doesn't fail the connection.

## Testing Checklist

- [x] Code compiles without errors
- [x] Bundle builds successfully (155.4 KB)
- [x] Device Info characteristic UUID added
- [x] Query method implemented
- [x] Notification handler implemented
- [x] Getter methods implemented
- [x] Automatic query on connection
- [x] Automatic notification cleanup on disconnect
- [ ] Test query on real device
- [ ] Verify notification response parsing
- [ ] Test battery level display
- [ ] Test firmware version display
- [ ] Test callback functionality

## File Changes

### Modified Files
1. **`client/core/motor-controller.js`**
   - Added `DEVICE_INFO_CHAR_UUID` constant
   - Added `deviceInfo` object and `onBatteryUpdate` callback
   - Added `queryDeviceInfo()` method
   - Added `handleDeviceInfoNotification()` method
   - Added `startDeviceInfoNotifications()` method
   - Added `stopDeviceInfoNotifications()` method
   - Added getter methods: `getDeviceInfo()`, `getBatteryLevel()`, `getFirmwareVersion()`, `getMotorCount()`
   - Added `setBatteryUpdateCallback()` method
   - Updated `connect()` to auto-setup notifications and query
   - Updated `disconnect()` to cleanup notifications

2. **`client/dulaan-browser-bundled.js`**
   - Rebuilt with battery info feature
   - Size: 155.4 KB (was 150 KB, +5.4 KB for new feature)

## Benefits

1. **Real-time Battery Monitoring**: Know when device needs charging
2. **Firmware Version Tracking**: Useful for debugging and support
3. **Automatic Updates**: No manual polling needed
4. **Callback Support**: Easy UI integration
5. **Non-blocking**: Doesn't interfere with motor control

## Backward Compatibility

- Motor control characteristic unchanged (`9A511A2D-594F-4E2B-B123-5F739A2D594F`)
- Existing motor control code works without modification
- Device info is optional - motor control works even if query fails
- `CHARACTERISTIC_UUID` maintained for backward compatibility

---

**Feature Added:** 2024-12-12
**Protocol Version:** V3.0
**Status:** ✅ Complete
**Next Step:** Deploy and test on device
