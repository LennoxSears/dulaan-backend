window.VoiceRecorder = Capacitor.Plugins.VoiceRecorder;
window.current_pwm = 0
window.aiValue = 0
window.msgHis = []
window.audioInterval = null
window.syncInterval = null
window.maxEnergy = 0.075

// ===== 1. 环形缓冲区实现 =====
class RingBuffer {
    constructor(size) {
        this.buffer = new Float32Array(size);
        this.size = size;
        this.head = 0;
        this.tail = 0;
        this.count = 0;
    }

    push(data) {
        const available = this.size - this.count;
        const toWrite = Math.min(data.length, available);

        const firstPart = Math.min(toWrite, this.size - this.tail);
        this.buffer.set(data.subarray(0, firstPart), this.tail);

        const secondPart = toWrite - firstPart;
        if (secondPart > 0) {
            this.buffer.set(data.subarray(firstPart, firstPart + secondPart), 0);
        }

        this.tail = (this.tail + toWrite) % this.size;
        this.count += toWrite;
        return toWrite;
    }

    readAll() {
        const out = new Float32Array(this.count);
        const firstPart = Math.min(this.count, this.size - this.head);
        out.set(this.buffer.subarray(this.head, this.head + firstPart));

        if (this.count > firstPart) {
            out.set(this.buffer.subarray(0, this.count - firstPart), firstPart);
        }
        return out;
    }

    reset() {
        this.head = 0;
        this.tail = 0;
        this.count = 0;
    }
}

// ===== 2. 全局状态配置 =====
window.AUDIO_STATE = {
    ringBuffer: new RingBuffer(480000 * 2), // 16000Hz * 30秒
    abiBuffer: new RingBuffer(1600),
    isSpeaking: false,
    silenceCounter: 0,
    SILENCE_THRESHOLD: 0.05,
    ZERO_CROSSING: 0.1,
    SILENCE_TIMEOUT: 25,
    MIN_SPEECH_DURATION: 10,
    lastChunkSize: 0,
    lastRMS: 0,
    lastZeroCrossings: 0
};

// ===== 3. Base64转Float32Array（修复NaN问题） =====
const base64ToFloat32Array = (base64) => {
    try {
        // 剥离MIME头（如"data:audio/wav;base64,"）
        const pureBase64 = base64.includes(',') ? base64.split(',')[1] : base64;

        // 解码Base64
        const binary = atob(pureBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        // 显式小端序解析（核心防NaN措施）
        const view = new DataView(bytes.buffer);
        const floats = new Float32Array(bytes.length / 4);
        for (let i = 0; i < floats.length; i++) {
            floats[i] = view.getFloat32(i * 4, true); // true=小端序[1](@ref)
        }
        return floats;
    } catch (e) {
        console.error("Base64解码失败:", e);
        return new Float32Array(0);
    }
};

// ===== 4. 静音检测（双阈值策略） =====
const detectSilence = (pcmData, threshold, zeroRatio) => {
    let energy = 0;
    let zeroCrossings = 0;
    for (let i = 0; i < pcmData.length; i++) {
        energy += pcmData[i] ** 2;
        if (i > 0 && (Math.sign(pcmData[i]) !== Math.sign(pcmData[i - 1]))) {
            zeroCrossings++;
        }
    }
    const rms = Math.sqrt(energy / pcmData.length);
    window.AUDIO_STATE.lastRMS = rms;
    window.AUDIO_STATE.lastZeroCrossings = zeroCrossings;
    return !(rms > threshold && zeroCrossings > (pcmData.length * zeroRatio));
};

const audio2PWM = (maxEnergy) => {
    let pcmData = window.AUDIO_STATE.abiBuffer.readAll()
    if (pcmData.length == 0) {
        return -1
    }
    let energy = 0;
    for (let i = 0; i < pcmData.length; i++) {
        if (pcmData[i] == NaN) {
            pcmData[i] = 0
        }
        energy += pcmData[i] ** 2;
    }
    const rms = Math.sqrt(energy / pcmData.length);
    window.AUDIO_STATE.lastRMS = rms;
    return Math.round((rms / maxEnergy) * 255) > 255 ? 255 : Math.round((rms / maxEnergy) * 255)
};

const PCM_CONFIG = {
    sampleRate: 16000,     // 采样率（Hz），需与Java端一致
    bitDepth: 16,          // 位深度（16bit）
    channels: 1,           // 单声道
    signed: true,          // 有符号整数
    byteOrder: 'little'    // 小端序
};

// ===== 5. 分段打包与传输 =====
const packageSpeechSegment = async () => {
    const pcmData = window.AUDIO_STATE.ringBuffer.readAll();
    if (pcmData.length === 0) return;

    // 转Int16减少传输体积
    const int16Data = new Int16Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
        const scaled = Math.max(-1, Math.min(1, pcmData[i])) * 32767;
        int16Data[i] = Math.max(-32768, Math.min(32767, scaled));
    }
    console.log("[传输] PCM分段:", int16Data.length, "采样点");

    // 重置状态
    window.AUDIO_STATE.ringBuffer.reset();
    window.AUDIO_STATE.isSpeaking = false;
    window.AUDIO_STATE.silenceCounter = 0;

    try {
        // Convert Int16Array to base64 for our API
        const uint8Array = new Uint8Array(int16Data.buffer);
        const base64Audio = btoa(String.fromCharCode.apply(null, uint8Array));

        // Use our integrated speech-to-text with LLM API
        const result = await window.dulaan.speechToTextWithLLM(
            base64Audio,
            window.current_pwm,
            window.msgHis,
            {
                encoding: 'LINEAR16',
                sampleRateHertz: 16000
            }
        );

        console.log("[识别结果]", result.transcript);
        console.log("[PWM结果]", result.newPwmValue);

        // Update message history
        window.msgHis = result.msgHis;
        
        const pwmValue = Number(result.newPwmValue);
        if (pwmValue < 256 && pwmValue > -1) {
            window.aiValue = pwmValue;
            window.current_pwm = pwmValue;
            
            // Check if this is a remote user
            if (window.remoteControl.isRemote) {
                // Send command to host instead of local control
                window.remoteControl.sendControlCommand('ai', pwmValue, {
                    transcript: result.transcript,
                    confidence: result.confidence
                });
            } else {
                // Local control or host receiving remote command
                window.dulaan.write(window.current_pwm);
            }
        }
    } catch (error) {
        console.error("[语音处理失败]", error);
    }
};



// ===== 6. 音频分块处理（核心逻辑） =====
const processChunk = (base64Chunk) => {
    const pcmChunk = base64ToFloat32Array(base64Chunk);
    if (pcmChunk.length === 0) return;

    // 更新状态
    window.AUDIO_STATE.lastChunkSize = pcmChunk.length;
    const isSilent = detectSilence(pcmChunk, window.AUDIO_STATE.SILENCE_THRESHOLD, window.AUDIO_STATE.ZERO_CROSSING);
    // 语音活动检测
    if (!isSilent) {
        window.AUDIO_STATE.silenceCounter = 0;
        console.log(
            `变了=====================================`,
            `能量: ${window.AUDIO_STATE.lastRMS.toFixed(4)}`,
            `过零: ${window.AUDIO_STATE.lastZeroCrossings}`
        );
        window.AUDIO_STATE.isSpeaking = true;
    } else if (window.AUDIO_STATE.isSpeaking) {
        window.AUDIO_STATE.silenceCounter++;
    }

    // 写入环形缓冲区
    const written = window.AUDIO_STATE.ringBuffer.push(pcmChunk);
    if (written < pcmChunk.length) {
        console.warn("[警告] 缓冲区溢出，丢弃", pcmChunk.length - written, "采样点");
        window.AUDIO_STATE.ringBuffer.reset()
    }

    // 静音超时触发分段
    const minSamples = window.AUDIO_STATE.MIN_SPEECH_DURATION * window.AUDIO_STATE.lastChunkSize;
    if (
        window.AUDIO_STATE.silenceCounter >= window.AUDIO_STATE.SILENCE_TIMEOUT &&
        window.AUDIO_STATE.ringBuffer.count > minSamples
    ) {
        packageSpeechSegment();
    }
};

// ===== 6. 音频分块处理（核心逻辑） =====
const processAbiChunk = (base64Chunk) => {
    const pcmChunk = base64ToFloat32Array(base64Chunk);
    if (pcmChunk.length === 0) return;

    // 更新状态
    window.AUDIO_STATE.lastChunkSize = pcmChunk.length;
    // 写入环形缓冲区
    const written = window.AUDIO_STATE.abiBuffer.push(pcmChunk);
    if (written < pcmChunk.length) {
        console.warn("[警告] 缓冲区溢出，丢弃", pcmChunk.length - written, "采样点");
        window.AUDIO_STATE.abiBuffer.reset()
    }
};

// ===== 7. 启动音频流（Base64入口） =====
window.startStreaming = async () => {
    await VoiceRecorder.removeAllListeners()
    clearInterval(window.audioInterval)
    VoiceRecorder.addListener('audioChunk', (data) => {
        processChunk(data.chunk); // 直接传入Base64字符串
    });
    await VoiceRecorder.startStreaming();
    console.log("[状态] 音频流已启动");

    window.audioInterval = setInterval(() => {
        console.log(
            `[监控] 缓冲区: ${window.AUDIO_STATE.ringBuffer.count}/${window.AUDIO_STATE.ringBuffer.size}`,
            `静音计数: ${window.AUDIO_STATE.silenceCounter}`,
            `能量: ${window.AUDIO_STATE.lastRMS.toFixed(4)}`,
            `过零: ${window.AUDIO_STATE.lastZeroCrossings}`
        );
    }, 5000);
};

// ===== 7. 启动音频流（Base64入口） =====
window.stopStreaming = async () => {
    await VoiceRecorder.removeAllListeners()
    await VoiceRecorder.stopStreaming();
    window.current_pwm = 0
    window.dulaan.write(window.current_pwm)
    console.log("[状态] 音频流已关闭");

    if (window.audioInterval) {
        clearInterval(window.audioInterval)
    }
};

window.startAbi = async () => {
    await VoiceRecorder.removeAllListeners()
    clearInterval(window.audioInterval)
    VoiceRecorder.addListener('audioChunk', (data) => {
        processAbiChunk(data.chunk); // 直接传入Base64字符串
    });
    await VoiceRecorder.startStreaming();
    console.log("[状态] 环境流已启动");

    // window.audioInterval = setInterval(() => {
    //     console.log(
    //         `能量: ${window.AUDIO_STATE.lastRMS.toFixed(4)}`,
    //     );
    // }, 5000);
    window.syncInterval = setInterval(() => {
        let value = Number(audio2PWM(maxEnergy))
        if (value > 0) {
            window.current_pwm = value
            
            // Check if this is a remote user
            if (window.remoteControl.isRemote) {
                // Send command to host instead of local control
                window.remoteControl.sendControlCommand('ambient', value, {
                    energy: window.AUDIO_STATE.lastRMS
                });
            } else {
                // Local control or host receiving remote command
                window.dulaan.write(window.current_pwm);
            }
        }
    }, 100);
}

window.stopAbi = async () => {
    await VoiceRecorder.removeAllListeners()
    await VoiceRecorder.stopStreaming();
    window.current_pwm = 0
    window.dulaan.write(window.current_pwm)
    console.log("[状态] 环境流已关闭");
    clearInterval(window.audioInterval)
    clearInterval(window.syncInterval)
};

window.startTouch = async () => {
    await VoiceRecorder.removeAllListeners()
    clearInterval(window.syncInterval)
    console.log("[状态] TouchMode已启动");
    window.current_pwm = Math.round((window.touchValue / 100) * 255)
    window.syncInterval = setInterval(() => {
        window.current_pwm = Math.round((window.touchValue / 100) * 255)
        
        // Check if this is a remote user
        if (window.remoteControl.isRemote) {
            // Send command to host instead of local control
            window.remoteControl.sendControlCommand('touch', window.current_pwm, {
                touchValue: window.touchValue
            });
        } else {
            // Local control or host receiving remote command
            window.dulaan.write(window.current_pwm);
        }
    }, 100);
}

window.stopTouch = async () => {
    console.log("[状态] TouchMode已停止");
    window.current_pwm = 0
    
    // Check if this is a remote user
    if (window.remoteControl.isRemote) {
        // Send stop command to host
        window.remoteControl.sendControlCommand('touch', 0);
    } else {
        // Local control
        window.dulaan.write(window.current_pwm);
    }
    
    clearInterval(window.syncInterval)
}

// ===== Remote Control Mode Functions =====

// Start remote control as host (device owner)
window.startRemoteHost = () => {
    console.log("[状态] 启动远程控制主机模式");
    
    // Initialize as host
    const hostId = window.remoteControl.initializeAsHost();
    
    console.log("[远程控制] 主机ID:", hostId);
    return hostId;
}

// Connect as remote user
window.connectToRemoteHost = (hostId) => {
    console.log("[状态] 连接到远程主机:", hostId);
    
    // Connect as remote user
    window.remoteControl.connectAsRemote(hostId);
}

// Stop remote control
window.stopRemoteControl = () => {
    console.log("[状态] 停止远程控制");
    
    // Stop all intervals
    clearInterval(window.audioInterval);
    clearInterval(window.syncInterval);
    
    // Stop audio streaming
    if (window.VoiceRecorder) {
        window.VoiceRecorder.removeAllListeners();
        window.VoiceRecorder.stopStreaming();
    }
    
    // Disconnect from remote control
    window.remoteControl.disconnect();
    
    // Reset motor
    window.current_pwm = 0;
    if (window.dulaan && window.dulaan.writeForce) {
        window.dulaan.writeForce(0);
    }
}

// Remote control versions of existing functions
window.remoteStartStreaming = async () => {
    if (!window.remoteControl.isRemote) {
        console.error("Not connected as remote user");
        return;
    }
    
    console.log("[远程控制] 启动AI语音控制");
    await window.startStreaming();
}

window.remoteStopStreaming = async () => {
    if (!window.remoteControl.isRemote) {
        console.error("Not connected as remote user");
        return;
    }
    
    console.log("[远程控制] 停止AI语音控制");
    await window.stopStreaming();
}

window.remoteStartAbi = async () => {
    if (!window.remoteControl.isRemote) {
        console.error("Not connected as remote user");
        return;
    }
    
    console.log("[远程控制] 启动环境音控制");
    await window.startAbi();
}

window.remoteStopAbi = async () => {
    if (!window.remoteControl.isRemote) {
        console.error("Not connected as remote user");
        return;
    }
    
    console.log("[远程控制] 停止环境音控制");
    await window.stopAbi();
}

window.remoteStartTouch = async () => {
    if (!window.remoteControl.isRemote) {
        console.error("Not connected as remote user");
        return;
    }
    
    console.log("[远程控制] 启动触摸控制");
    await window.startTouch();
}

window.remoteStopTouch = async () => {
    if (!window.remoteControl.isRemote) {
        console.error("Not connected as remote user");
        return;
    }
    
    console.log("[远程控制] 停止触摸控制");
    await window.stopTouch();
}

// Get remote control status
window.getRemoteControlStatus = () => {
    return window.remoteControl.getStatus();
}

// Manual remote control (for testing)
window.sendRemoteCommand = (mode, value) => {
    if (!window.remoteControl.isRemote) {
        console.error("Not connected as remote user");
        return false;
    }
    
    return window.remoteControl.sendControlCommand(mode, value);
}