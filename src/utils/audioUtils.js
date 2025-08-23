/**
 * 音频工具类 - 用于冥想训练模块的音频处理
 * 修复Web Audio API的兼容性和实现问题
 */

export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.oscillators = [];
    this.gainNodes = [];
    this.isInitialized = false;
    this.isPlaying = false;
  }

  /**
   * 初始化音频上下文
   */
  async initAudioContext() {
    try {
      // 检查浏览器支持
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        throw new Error('Web Audio API not supported');
      }

      this.audioContext = new AudioContext();
      
      // 处理浏览器的自动播放策略
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return false;
    }
  }

  /**
   * 创建双耳节拍音频
   * @param {number} baseFreq - 基础频率 (Hz)
   * @param {number} beatFreq - 节拍频率 (Hz)
   * @param {number} volume - 音量 (0-1)
   */
  createBinauralBeats(baseFreq = 440, beatFreq = 10, volume = 0.1) {
    if (!this.isInitialized || !this.audioContext) {
      console.error('Audio context not initialized');
      return null;
    }

    try {
      // 清理现有的振荡器
      this.stopAll();

      // 创建左声道振荡器
      const leftOscillator = this.audioContext.createOscillator();
      const leftGain = this.audioContext.createGain();
      const leftPanner = this.audioContext.createStereoPanner();
      
      leftOscillator.type = 'sine';
      leftOscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
      leftGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
      leftPanner.pan.setValueAtTime(-1, this.audioContext.currentTime); // 完全左声道
      
      leftOscillator.connect(leftGain);
      leftGain.connect(leftPanner);
      leftPanner.connect(this.audioContext.destination);

      // 创建右声道振荡器
      const rightOscillator = this.audioContext.createOscillator();
      const rightGain = this.audioContext.createGain();
      const rightPanner = this.audioContext.createStereoPanner();
      
      rightOscillator.type = 'sine';
      rightOscillator.frequency.setValueAtTime(baseFreq + beatFreq, this.audioContext.currentTime);
      rightGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
      rightPanner.pan.setValueAtTime(1, this.audioContext.currentTime); // 完全右声道
      
      rightOscillator.connect(rightGain);
      rightGain.connect(rightPanner);
      rightPanner.connect(this.audioContext.destination);

      // 保存引用
      this.oscillators = [leftOscillator, rightOscillator];
      this.gainNodes = [leftGain, rightGain];

      return {
        left: { oscillator: leftOscillator, gain: leftGain, panner: leftPanner },
        right: { oscillator: rightOscillator, gain: rightGain, panner: rightPanner }
      };
    } catch (error) {
      console.error('Failed to create binaural beats:', error);
      return null;
    }
  }

  /**
   * 创建节拍器音频
   * @param {number} bpm - 每分钟节拍数
   * @param {number} volume - 音量 (0-1)
   * @param {string} soundType - 声音类型 ('click', 'beep', 'wood')
   */
  createMetronome(bpm = 120, volume = 0.3, soundType = 'click') {
    if (!this.isInitialized || !this.audioContext) {
      console.error('Audio context not initialized');
      return null;
    }

    const interval = 60 / bpm; // 节拍间隔（秒）
    let nextBeatTime = this.audioContext.currentTime;
    let beatCount = 0;
    let intervalId = null;

    const playBeat = (isAccent = false) => {
      try {
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        // 根据声音类型设置参数
        let frequency, duration;
        switch (soundType) {
          case 'beep':
            frequency = isAccent ? 1000 : 800;
            duration = 0.1;
            oscillator.type = 'sine';
            break;
          case 'wood':
            frequency = isAccent ? 2000 : 1500;
            duration = 0.05;
            oscillator.type = 'square';
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(500, this.audioContext.currentTime);
            break;
          default: // 'click'
            frequency = isAccent ? 1200 : 1000;
            duration = 0.03;
            oscillator.type = 'square';
            break;
        }

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        // 音量包络
        const currentVolume = isAccent ? volume * 1.5 : volume;
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(currentVolume, this.audioContext.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        // 连接音频节点
        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
      } catch (error) {
        console.error('Failed to play beat:', error);
      }
    };

    const scheduleBeats = () => {
      // 提前调度节拍以确保精确计时
      while (nextBeatTime < this.audioContext.currentTime + 0.1) {
        const isAccent = beatCount % 4 === 0; // 每4拍强调一次
        
        setTimeout(() => {
          playBeat(isAccent);
        }, (nextBeatTime - this.audioContext.currentTime) * 1000);
        
        nextBeatTime += interval;
        beatCount++;
      }
    };

    return {
      start: () => {
        nextBeatTime = this.audioContext.currentTime;
        beatCount = 0;
        intervalId = setInterval(scheduleBeats, 25); // 每25ms检查一次
        this.isPlaying = true;
      },
      stop: () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        this.isPlaying = false;
      },
      updateBPM: (newBpm) => {
        bpm = newBpm;
        interval = 60 / bpm;
      }
    };
  }

  /**
   * 更新音量
   * @param {number} newVolume - 新音量 (0-1)
   */
  updateVolume(newVolume) {
    if (this.gainNodes.length > 0) {
      this.gainNodes.forEach(gainNode => {
        if (gainNode && gainNode.gain) {
          gainNode.gain.setValueAtTime(newVolume, this.audioContext.currentTime);
        }
      });
    }
  }

  /**
   * 更新频率
   * @param {number} baseFreq - 基础频率
   * @param {number} beatFreq - 节拍频率（双耳节拍模式）
   */
  updateFrequency(baseFreq, beatFreq = 0) {
    if (this.oscillators.length >= 2) {
      // 双耳节拍模式
      this.oscillators[0].frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
      this.oscillators[1].frequency.setValueAtTime(baseFreq + beatFreq, this.audioContext.currentTime);
    } else if (this.oscillators.length === 1) {
      // 单声道模式
      this.oscillators[0].frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
    }
  }

  /**
   * 开始播放
   */
  start() {
    if (this.oscillators.length > 0) {
      this.oscillators.forEach(oscillator => {
        if (oscillator && oscillator.start) {
          oscillator.start();
        }
      });
      this.isPlaying = true;
    }
  }

  /**
   * 停止所有音频
   */
  stopAll() {
    try {
      this.oscillators.forEach(oscillator => {
        if (oscillator && oscillator.stop) {
          oscillator.stop();
          oscillator.disconnect();
        }
      });
      
      this.gainNodes.forEach(gainNode => {
        if (gainNode && gainNode.disconnect) {
          gainNode.disconnect();
        }
      });
      
      this.oscillators = [];
      this.gainNodes = [];
      this.isPlaying = false;
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }

  /**
   * 销毁音频上下文
   */
  destroy() {
    this.stopAll();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isInitialized = false;
  }

  /**
   * 获取音频上下文状态
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      isPlaying: this.isPlaying,
      contextState: this.audioContext ? this.audioContext.state : 'closed'
    };
  }
}

// 创建全局音频引擎实例
export const audioEngine = new AudioEngine();

// 音频工具函数
export const audioUtils = {
  /**
   * 格式化时间显示
   * @param {number} seconds - 秒数
   * @returns {string} 格式化的时间字符串
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * 检查浏览器音频支持
   * @returns {object} 支持情况
   */
  checkAudioSupport() {
    return {
      webAudio: !!(window.AudioContext || window.webkitAudioContext),
      htmlAudio: !!window.Audio,
      mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    };
  },

  /**
   * 请求音频权限（用于自动播放策略）
   */
  async requestAudioPermission() {
    try {
      // 创建临时音频上下文来触发用户交互
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const tempContext = new AudioContext();
      
      if (tempContext.state === 'suspended') {
        await tempContext.resume();
      }
      
      tempContext.close();
      return true;
    } catch (error) {
      console.error('Failed to request audio permission:', error);
      return false;
    }
  }
};