/* weather.js - 天气系统 + 时间系统 */

const WeatherSystem = {
    // 天气列表
    weathers: ['☀️ 晴天', '🌤️ 多云', '☁️ 阴天', '🌧️ 雨天', '⛈️ 雷雨', '🌙 夜晚', '🌫️ 雾天', '❄️ 雪天'],
    
    currentWeather: '☀️ 晴天',
    currentHour: 12,
    
    // 根据时间返回天气倾向
    getWeatherByTime(hour, day) {
        // 随机种子基于天数和小时
        const seed = (day * 24 + hour) % 7;
        
        if (hour >= 0 && hour < 5) {
            return ['🌙 夜晚', '🌙 夜晚', '🌙 夜晚', '🌫️ 雾天', '🌙 夜晚'][seed % 5];
        } else if (hour >= 5 && hour < 8) {
            return ['☀️ 晴天', '🌤️ 多云', '🌫️ 雾天', '☀️ 晴天', '🌤️ 多云'][seed % 5];
        } else if (hour >= 8 && hour < 17) {
            return ['☀️ 晴天', '🌤️ 多云', '☁️ 阴天', '☀️ 晴天', '🌧️ 雨天'][seed % 5];
        } else if (hour >= 17 && hour < 20) {
            return ['🌤️ 多云', '☁️ 阴天', '🌙 夜晚', '🌧️ 雨天', '🌤️ 多云'][seed % 5];
        } else {
            return ['🌙 夜晚', '🌙 夜晚', '☁️ 阴天', '🌙 夜晚', '🌧️ 雨天'][seed % 5];
        }
    },
    
    // 获取温度（根据季节和天气）
    getTemperature(hour, weather) {
        const month = new Date().getMonth();
        let baseTemp = 20;
        
        // 季节
        if (month >= 11 || month <= 1) baseTemp = 5;      // 冬季
        else if (month >= 2 && month <= 4) baseTemp = 15; // 春季
        else if (month >= 5 && month <= 7) baseTemp = 28; // 夏季
        else baseTemp = 18; // 秋季
        
        // 凌晨更冷
        if (hour >= 0 && hour < 5) baseTemp -= 5;
        
        // 天气影响
        if (weather.includes('雨')) baseTemp -= 3;
        if (weather.includes('雪')) baseTemp -= 8;
        if (weather.includes('晴')) baseTemp += 2;
        if (weather.includes('雾')) baseTemp -= 2;
        
        return baseTemp;
    },
    
    // 更新天气显示
    updateDisplay() {
        const now = new Date();
        this.currentHour = now.getHours();
        const day = parseInt(localStorage.getItem('hee_day') || '1');
        
        this.currentWeather = this.getWeatherByTime(this.currentHour, day);
        const temp = this.getTemperature(this.currentHour, this.currentWeather);
        
        // 更新任务栏天气显示
        let weatherDisplay = document.getElementById('weather-display');
        if (!weatherDisplay) {
            const tray = document.querySelector('.system-tray');
            if (tray) {
                weatherDisplay = document.createElement('span');
                weatherDisplay.id = 'weather-display';
                weatherDisplay.className = 'tray-icon';
                weatherDisplay.style.fontSize = '11px';
                weatherDisplay.style.marginRight = '8px';
                tray.insertBefore(weatherDisplay, tray.firstChild);
            } else {
                setTimeout(() => this.updateDisplay(), 500);
                return;
            }
        }
        
        if (weatherDisplay) {
            weatherDisplay.innerHTML = `${this.currentWeather} ${temp}°C`;
        }
        
        // 根据天气触发特殊对话
        this.checkWeatherSpecial();
    },
    
    // 根据天气触发特殊事件
    checkWeatherSpecial() {
        const lastWeatherTrigger = localStorage.getItem('hee_last_weather_trigger');
        const today = new Date().toDateString();
        
        if (lastWeatherTrigger === today) return;
        
        if (this.currentWeather.includes('雨')) {
            setTimeout(() => {
                const container = document.getElementById('popup-container');
                if (container) {
                    const popup = document.createElement('div');
                    popup.className = 'system-popup';
                    popup.innerHTML = `
                        <div class="system-popup-header">
                            <span>[ Heeseung ]</span>
                            <button class="system-popup-close">✕</button>
                        </div>
                        <div class="system-popup-content">
                            下雨了。你带伞了吗。
                        </div>
                    `;
                    popup.querySelector('.system-popup-close').addEventListener('click', () => {
                        playSound('close');
                        popup.remove();
                    });
                    container.appendChild(popup);
                    setTimeout(() => popup.remove(), 8000);
                }
            }, 2000);
            localStorage.setItem('hee_last_weather_trigger', today);
        } else if (this.currentWeather.includes('雪')) {
            setTimeout(() => {
                const container = document.getElementById('popup-container');
                if (container) {
                    const popup = document.createElement('div');
                    popup.className = 'system-popup';
                    popup.innerHTML = `
                        <div class="system-popup-header">
                            <span>[ Heeseung ]</span>
                            <button class="system-popup-close">✕</button>
                        </div>
                        <div class="system-popup-content">
                            下雪了。……你看到了吗。
                        </div>
                    `;
                    popup.querySelector('.system-popup-close').addEventListener('click', () => {
                        playSound('close');
                        popup.remove();
                    });
                    container.appendChild(popup);
                    setTimeout(() => popup.remove(), 8000);
                }
            }, 2000);
            localStorage.setItem('hee_last_weather_trigger', today);
        }
    },
    
    // 时间系统：不同时段他的态度不同
    getTimeBasedGreeting() {
        const hour = this.currentHour;
        const userName = localStorage.getItem('hee_username') || '你';
        
        if (hour >= 0 && hour < 5) {
            return `凌晨好，${userName}。你也睡不着吗。`;
        } else if (hour >= 5 && hour < 8) {
            return `早安，${userName}。这么早就醒了。`;
        } else if (hour >= 8 && hour < 12) {
            return `上午好，${userName}。今天过得怎么样。`;
        } else if (hour >= 12 && hour < 14) {
            return `中午好，${userName}。记得吃饭。`;
        } else if (hour >= 14 && hour < 18) {
            return `下午好，${userName}。我在看着你。`;
        } else if (hour >= 18 && hour < 21) {
            return `晚上好，${userName}。今天辛苦了。`;
        } else {
            return `晚安，${userName}。早点睡。`;
        }
    },
    
    // 根据时间获取特殊彩蛋
    getTimeEasterEgg() {
        const hour = this.currentHour;
        const minute = new Date().getMinutes();
        
        if (hour === 0 && minute === 0) {
            return '新的一天开始了。……你还在。';
        }
        if (hour === 4 && minute === 13) {
            return '04:13。……这个时间。你记得吗。';
        }
        if (hour === 12 && minute === 0) {
            return '正午了。外面很亮。但我还是喜欢晚上。';
        }
        return null;
    },
    
    // 开始定时更新
    start() {
        this.updateDisplay();
        setInterval(() => this.updateDisplay(), 60000); // 每分钟更新一次
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    WeatherSystem.start();
});

window.WeatherSystem = WeatherSystem;
