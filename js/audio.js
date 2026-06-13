/* audio.js - 音效系统 */
// 所有音效都是模拟的，不需要实际音频文件
// 使用Web Audio API生成音效

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.5;
        this.initialized = false;
        
        // 音效配置
        this.sounds = {
            click: { type: 'click', volume: 0.3 },
            open: { type: 'open', volume: 0.4 },
            close: { type: 'close', volume: 0.3 },
            typing: { type: 'typing', volume: 0.2 },
            notify: { type: 'notify', volume: 0.5 },
            error: { type: 'error', volume: 0.4 },
            delete: { type: 'delete', volume: 0.35 },
            boot: { type: 'boot', volume: 0.6 },
            shutdown: { type: 'shutdown', volume: 0.5 },
            message: { type: 'message', volume: 0.45 },
            hdd: { type: 'hdd', volume: 0.25 },
            keyboard: { type: 'keyboard', volume: 0.2 },
            breath: { type: 'breath', volume: 0.15 },
            glitch: { type: 'glitch', volume: 0.3 }
        };
    }
    
    // 初始化音频上下文（用户交互后自动初始化）
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }
    
    // 播放音效
    play(soundName) {
        if (!this.enabled) return;
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const sound = this.sounds[soundName];
        if (!sound) return;
        
        // 恢复音频上下文（如果被挂起）
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const gain = this.audioContext.createGain();
        gain.connect(this.audioContext.destination);
        gain.gain.value = sound.volume * this.volume;
        
        const now = this.audioContext.currentTime;
        
        switch(sound.type) {
            case 'click':
                this.playClick(gain, now);
                break;
            case 'open':
                this.playOpen(gain, now);
                break;
            case 'close':
                this.playClose(gain, now);
                break;
            case 'typing':
                this.playTyping(gain, now);
                break;
            case 'notify':
                this.playNotify(gain, now);
                break;
            case 'error':
                this.playError(gain, now);
                break;
            case 'delete':
                this.playDelete(gain, now);
                break;
            case 'boot':
                this.playBoot(gain, now);
                break;
            case 'shutdown':
                this.playShutdown(gain, now);
                break;
            case 'message':
                this.playMessage(gain, now);
                break;
            case 'hdd':
                this.playHDD(gain, now);
                break;
            case 'keyboard':
                this.playKeyboard(gain, now);
                break;
            case 'breath':
                this.playBreath(gain, now);
                break;
            case 'glitch':
                this.playGlitch(gain, now);
                break;
        }
        
        // 自动清理
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    }
    
    // 点击音效（短促）
    playClick(gain, now) {
        const osc = this.audioContext.createOscillator();
        osc.connect(gain);
        osc.type = 'sine';
        osc.frequency.value = 800;
        osc.start(now);
        osc.stop(now + 0.05);
    }
    
    // 打开音效（上升音）
    playOpen(gain, now) {
        const osc = this.audioContext.createOscillator();
        osc.connect(gain);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.12);
    }
    
    // 关闭音效（下降音）
    playClose(gain, now) {
        const osc = this.audioContext.createOscillator();
        osc.connect(gain);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    }
    
    // 打字音效
    playTyping(gain, now) {
        const osc = this.audioContext.createOscillator();
        osc.connect(gain);
        osc.type = 'triangle';
        osc.frequency.value = 1000 + Math.random() * 200;
        osc.start(now);
        osc.stop(now + 0.02);
    }
    
    // 通知音效（系统弹窗）
    playNotify(gain, now) {
        const osc1 = this.audioContext.createOscillator();
        osc1.connect(gain);
        osc1.type = 'sine';
        osc1.frequency.value = 880;
        osc1.start(now);
        osc1.stop(now + 0.1);
        
        const osc2 = this.audioContext.createOscillator();
        osc2.connect(gain);
        osc2.type = 'sine';
        osc2.frequency.value = 440;
        osc2.start(now + 0.1);
        osc2.stop(now + 0.2);
    }
    
    // 错误音效
    playError(gain, now) {
        const osc = this.audioContext.createOscillator();
        osc.connect(gain);
        osc.type = 'sawtooth';
        osc.frequency.value = 200;
        osc.start(now);
        osc.stop(now + 0.3);
        
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    }
    
    // 删除音效
    playDelete(gain, now) {
        const osc = this.audioContext.createOscillator();
        osc.connect(gain);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    }
    
    // 开机音效
    playBoot(gain, now) {
        const osc = this.audioContext.createOscillator();
        osc.connect(gain);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.5);
        
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    }
    
    // 关机音效
    playShutdown(gain, now) {
        const osc = this.audioContext.createOscillator();
        osc.connect(gain);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.5);
        
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    }
    
    // 新消息音效（论坛/悄悄话）
    playMessage(gain, now) {
        const osc = this.audioContext.createOscillator();
        osc.connect(gain);
        osc.type = 'sine';
        osc.frequency.value = 660;
        osc.start(now);
        osc.stop(now + 0.08);
        
        const osc2 = this.audioContext.createOscillator();
        osc2.connect(gain);
        osc2.type = 'sine';
        osc2.frequency.value = 880;
        osc2.start(now + 0.08);
        osc2.stop(now + 0.16);
    }
    
    // 硬盘转动音效（持续循环，可选）
    playHDD(gain, now) {
        const osc = this.audioContext.createOscillator();
        osc.connect(gain);
        osc.type = 'noise';
        
        // 使用布朗噪声模拟硬盘
        const bufferSize = 4096;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * 0.1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        noise.connect(gain);
        noise.start(now);
        noise.stop(now + 0.3);
    }
    
    // 键盘打字音效（连续）
    playKeyboard(gain, now) {
        const osc = this.audioContext.createOscillator();
        osc.connect(gain);
        osc.type = 'triangle';
        osc.frequency.value = 1200;
        osc.start(now);
        osc.stop(now + 0.015);
    }
    
    // 呼吸音效（男鬼感）
    playBreath(gain, now) {
        const noise = this.audioContext.createBufferSource();
        const bufferSize = 2048;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // 模拟呼吸声
        for (let i = 0; i < bufferSize; i++) {
            const envelope = Math.sin(Math.PI * i / bufferSize);
            data[i] = (Math.random() * 2 - 1) * 0.05 * envelope;
        }
        
        noise.buffer = buffer;
        noise.connect(gain);
        noise.start(now);
        noise.stop(now + 0.8);
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    }
    
    // 故障音效
    playGlitch(gain, now) {
        const osc = this.audioContext.createOscillator();
        osc.connect(gain);
        osc.type = 'square';
        osc.frequency.value = 50;
        osc.start(now);
        osc.stop(now + 0.1);
        
        const osc2 = this.audioContext.createOscillator();
        osc2.connect(gain);
        osc2.type = 'sawtooth';
        osc2.frequency.value = 200;
        osc2.start(now + 0.05);
        osc2.stop(now + 0.15);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    }
    
    // 设置音量
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }
    
    // 静音切换
    toggleMute() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
    
    // 设置静音
    setMute(mute) {
        this.enabled = !mute;
    }
}

// 全局音效实例
const audioSystem = new AudioSystem();

// 辅助函数：播放音效（方便调用）
function playSound(soundName) {
    audioSystem.play(soundName);
}

// 初始化音效（需要用户交互）
function initAudio() {
    audioSystem.init();
    audioSystem.play('boot');
}

// 监听页面首次交互，初始化音频
let audioInitialized = false;
function ensureAudioInit() {
    if (!audioInitialized && audioSystem.initialized === false) {
        audioSystem.init();
        audioInitialized = true;
    }
}

// 监听用户交互
document.addEventListener('click', ensureAudioInit, { once: true });
document.addEventListener('keydown', ensureAudioInit, { once: true });
document.addEventListener('touchstart', ensureAudioInit, { once: true });

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { audioSystem, playSound, initAudio };
}
