/* desktop.js - 桌面主逻辑 */

// ========== 全局变量 ==========
let currentDay = parseInt(localStorage.getItem('hee_day') || '1');
let residue = parseInt(localStorage.getItem('hee_residue') || '0');
let openWindows = [];
let nextWindowZIndex = 100;
let currentUserId = 'User';
let heeseungTypingInterval = null;
let welcomeShown = false;
let firstPopupShown = localStorage.getItem('hee_first_popup') === 'true';

// 文件内容数据
let diaryContent = [];
let photos = [];
let recordings = [];
let favorites = {};
let logs = [];
let emails = [];
let markedDates = [];

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
    initDesktop();
    loadData();
    initEvents();
    updateTime();
    setInterval(updateTime, 1000);
    
    // 3秒后出现欢迎.txt
    setTimeout(() => {
        if (!welcomeShown) {
            showWelcomeFile();
            welcomeShown = true;
        }
    }, 3000);
    
    // 检查是否第一次进入
    if (!firstPopupShown) {
        // 5秒后第一次弹窗（他主动联系）
        setTimeout(() => {
            showHeeseungPopup('……你怎么进来的。这个论坛不应该被找到。', [
                { text: '误入的，不知道这是什么地方', reply: '误入……这个论坛不应该被找到的。', residue: 2 },
                { text: '偶然点进来的', reply: '没有偶然。', residue: 0 },
                { text: '沉默', reply: '……不回答也行。', residue: -1 }
            ]);
            firstPopupShown = true;
            localStorage.setItem('hee_first_popup', 'true');
        }, 5000);
    }
});

// ========== 初始化桌面 ==========
function initDesktop() {
    // 播放开机音效
    playSound('boot');
    
    // 更新残响值显示
    updateResidueDisplay();
    
    // 根据天数解锁内容
    updateDayBasedContent();
}

// 更新残响值显示
function updateResidueDisplay() {
    let display = document.getElementById('residue-display');
    if (!display) {
        let taskbar = document.querySelector('.taskbar');
        if (taskbar) {
            display = document.createElement('div');
            display.id = 'residue-display';
            display.style.cssText = 'position:fixed; bottom:45px; right:10px; font-size:10px; color:#5f8b6f; z-index:99; background:rgba(0,0,0,0.7); padding:2px 8px; border-radius:4px;';
            document.body.appendChild(display);
        }
    }
    if (display) {
        display.textContent = `残响: ${residue}`;
    }
}

// 根据天数解锁内容
function updateDayBasedContent() {
    // 日记本内容根据天数增加
    if (currentDay >= 2) {
        // 第2天解锁更多日记
    }
    if (currentDay >= 3) {
        document.querySelector('[data-app="photos"]')?.classList.remove('hidden');
        document.querySelector('[data-app="terminal"]')?.classList.remove('hidden');
        document.querySelector('[data-app="contacts"]')?.classList.remove('hidden');
    }
    if (currentDay >= 4) {
        document.querySelector('[data-app="recordings"]')?.classList.remove('hidden');
        document.querySelector('[data-app="email"]')?.classList.remove('hidden');
        document.querySelector('[data-app="alarm"]')?.classList.remove('hidden');
    }
    if (currentDay >= 5) {
        document.querySelector('[data-app="favorites"]')?.classList.remove('hidden');
        document.querySelector('[data-app="calendar"]')?.classList.remove('hidden');
        document.querySelector('[data-app="paint"]')?.classList.remove('hidden');
    }
    if (currentDay >= 6) {
        document.querySelector('[data-app="logs"]')?.classList.remove('hidden');
        document.querySelector('[data-app="run"]')?.classList.remove('hidden');
    }
    if (currentDay >= 7) {
        document.getElementById('secret-folder')?.classList.remove('hidden');
    }
}

// ========== 事件绑定 ==========
function initEvents() {
    // 桌面图标点击
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            const app = icon.dataset.app;
            if (app) {
                playSound('click');
                openApp(app);
            }
        });
    });
    
    // 开始菜单按钮
    const startBtn = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    if (startBtn) {
        startBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playSound('click');
            startMenu.classList.toggle('hidden');
        });
    }
    
    // 点击其他地方关闭开始菜单
    document.addEventListener('click', () => {
        if (startMenu && !startMenu.classList.contains('hidden')) {
            startMenu.classList.add('hidden');
        }
    });
    
    // 开始菜单项
    document.querySelectorAll('.start-menu-item[data-app]').forEach(item => {
        item.addEventListener('click', () => {
            const app = item.dataset.app;
            if (app) openApp(app);
            startMenu.classList.add('hidden');
        });
    });
    
    // 关机
    const shutdownBtn = document.getElementById('shutdown');
    if (shutdownBtn) {
        shutdownBtn.addEventListener('click', () => {
            playSound('shutdown');
            setTimeout(() => {
                window.location.reload();
            }, 500);
        });
    }
    
    // 便签关闭
    const stickyClose = document.querySelector('.sticky-close');
    if (stickyClose) {
        stickyClose.addEventListener('click', () => {
            document.getElementById('sticky-note')?.classList.add('hidden');
        });
    }
}

// ========== 打开应用 ==========
function openApp(appName) {
    playSound('open');
    
    // 检查是否已打开
    const existingWindow = document.querySelector(`.window[data-app="${appName}"]`);
    if (existingWindow) {
        bringToFront(existingWindow);
        return;
    }
    
    // 创建窗口
    const windowEl = createWindow(appName);
    document.getElementById('windows-container').appendChild(windowEl);
    
    // 加载内容
    loadAppContent(appName, windowEl);
    
    // 添加到任务栏
    addToTaskbar(appName, windowEl);
    
    // 记录
    openWindows.push({ app: appName, window: windowEl });
}

// 创建窗口
function createWindow(appName) {
    const titles = {
        mycomputer: '我的电脑',
        recycle: '回收站',
        browser: '浏览器',
        diary: '日记本.txt',
        photos: '照片',
        recordings: '录音',
        favorites: '收藏夹',
        memo: '备忘录.exe',
        logs: '日志.log',
        notepad: '记事本',
        paint: '画图',
        calculator: '计算器',
        terminal: '终端',
        calendar: '日历',
        alarm: '闹钟',
        contacts: '通讯录',
        email: '邮箱',
        sticky: '便签',
        run: '运行',
        secret: '一个陌生的文件夹',
        welcome: '欢迎.txt'
    };
    
    const zIndex = nextWindowZIndex++;
    
    const windowDiv = document.createElement('div');
    windowDiv.className = 'window';
    windowDiv.dataset.app = appName;
    windowDiv.style.cssText = `
        width: 500px;
        height: 400px;
        left: ${100 + (openWindows.length * 30)}px;
        top: ${100 + (openWindows.length * 30)}px;
        z-index: ${zIndex};
    `;
    
    windowDiv.innerHTML = `
        <div class="window-titlebar">
            <span class="window-title">${titles[appName] || appName}</span>
            <div class="window-controls">
                <button class="window-control minimize">─</button>
                <button class="window-control maximize">□</button>
                <button class="window-control close">✕</button>
            </div>
        </div>
        <div class="window-content" id="window-content-${appName}">
            <div style="text-align:center; padding:40px;">加载中...</div>
        </div>
    `;
    
    // 窗口控制
    const titlebar = windowDiv.querySelector('.window-titlebar');
    const closeBtn = windowDiv.querySelector('.close');
    const minBtn = windowDiv.querySelector('.minimize');
    const maxBtn = windowDiv.querySelector('.maximize');
    
    // 拖动
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    
    titlebar.addEventListener('mousedown', (e) => {
        if (e.target === closeBtn || e.target === minBtn || e.target === maxBtn) return;
        isDragging = true;
        dragOffset.x = e.clientX - windowDiv.offsetLeft;
        dragOffset.y = e.clientY - windowDiv.offsetTop;
        bringToFront(windowDiv);
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let newLeft = e.clientX - dragOffset.x;
        let newTop = e.clientY - dragOffset.y;
        newLeft = Math.max(0, Math.min(window.innerWidth - windowDiv.offsetWidth, newLeft));
        newTop = Math.max(0, Math.min(window.innerHeight - 40 - windowDiv.offsetHeight, newTop));
        windowDiv.style.left = newLeft + 'px';
        windowDiv.style.top = newTop + 'px';
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    // 关闭
    closeBtn.addEventListener('click', () => {
        playSound('close');
        windowDiv.remove();
        removeFromTaskbar(appName);
        openWindows = openWindows.filter(w => w.app !== appName);
    });
    
    // 最小化
    minBtn.addEventListener('click', () => {
        windowDiv.classList.add('hidden');
        const taskbarItem = document.querySelector(`.taskbar-item[data-app="${appName}"]`);
        if (taskbarItem) taskbarItem.classList.remove('active');
    });
    
    // 最大化
    maxBtn.addEventListener('click', () => {
        windowDiv.classList.toggle('maximized');
    });
    
    return windowDiv;
}

// 置顶窗口
function bringToFront(windowEl) {
    const maxZ = Math.max(...openWindows.map(w => parseInt(w.window.style.zIndex)), 0);
    windowEl.style.zIndex = maxZ + 1;
}

// 添加到任务栏
function addToTaskbar(appName, windowEl) {
    const titles = {
        mycomputer: '我的电脑',
        recycle: '回收站',
        browser: '浏览器',
        diary: '日记本',
        photos: '照片',
        recordings: '录音',
        favorites: '收藏夹',
        memo: '备忘录',
        logs: '日志',
        notepad: '记事本',
        paint: '画图',
        calculator: '计算器',
        terminal: '终端',
        calendar: '日历',
        alarm: '闹钟',
        contacts: '通讯录',
        email: '邮箱',
        run: '运行'
    };
    
    const taskbarTray = document.getElementById('taskbar-tray');
    const existing = document.querySelector(`.taskbar-item[data-app="${appName}"]`);
    if (existing) return;
    
    const item = document.createElement('div');
    item.className = 'taskbar-item active';
    item.dataset.app = appName;
    item.textContent = titles[appName] || appName;
    item.addEventListener('click', () => {
        playSound('click');
        if (windowEl.classList.contains('hidden')) {
            windowEl.classList.remove('hidden');
            item.classList.add('active');
        } else {
            bringToFront(windowEl);
        }
    });
    taskbarTray.appendChild(item);
}

// 从任务栏移除
function removeFromTaskbar(appName) {
    const item = document.querySelector(`.taskbar-item[data-app="${appName}"]`);
    if (item) item.remove();
}

// ========== 加载应用内容 ==========
function loadAppContent(appName, windowEl) {
    const contentDiv = windowEl.querySelector('.window-content');
    
    switch(appName) {
        case 'diary':
            loadDiary(contentDiv);
            break;
        case 'photos':
            loadPhotos(contentDiv);
            break;
        case 'recordings':
            loadRecordings(contentDiv);
            break;
        case 'favorites':
            loadFavorites(contentDiv);
            break;
        case 'memo':
            loadMemo(contentDiv);
            break;
        case 'logs':
            loadLogs(contentDiv);
            break;
        case 'notepad':
            loadNotepad(contentDiv);
            break;
        case 'paint':
            loadPaint(contentDiv);
            break;
        case 'calculator':
            loadCalculator(contentDiv);
            break;
        case 'terminal':
            loadTerminal(contentDiv);
            break;
        case 'calendar':
            loadCalendar(contentDiv);
            break;
        case 'alarm':
            loadAlarm(contentDiv);
            break;
        case 'contacts':
            loadContacts(contentDiv);
            break;
        case 'email':
            loadEmail(contentDiv);
            break;
        case 'run':
            loadRun(contentDiv);
            break;
        case 'browser':
            loadBrowser(contentDiv);
            break;
        case 'mycomputer':
            loadMyComputer(contentDiv);
            break;
        case 'recycle':
            loadRecycle(contentDiv);
            break;
        case 'welcome':
            loadWelcome(contentDiv);
            break;
        default:
            contentDiv.innerHTML = '<div style="padding:20px;">功能开发中...</div>';
    }
}

// ========== 各应用内容 ==========

// 日记本
function loadDiary(container) {
    const diaryEntries = [
        { date: '2024-03-11 02:13', text: '下雨。没出门。听雨声。' },
        { date: '2024-03-15 01:47', text: '想说一句话。写了。删了。这样比较干净。' },
        { date: '2024-04-02 23:58', text: '累。不想写了。' },
        { date: '2024-06-21 02:00', text: '夏至。白天很长。关着窗帘。' },
        { date: '2024-08-14 04:00', text: '看了以前的照片。不知道那时候在想什么。' },
        { date: '2024-12-31 23:59', text: '一年结束了。明年再说。' }
    ];
    
    if (currentDay >= 3) {
        diaryEntries.unshift({ date: '2025-01-03 00:00', text: '她打开了这台电脑。她看了我写的东西。……她好像不记得。' });
    }
    if (currentDay >= 6) {
        diaryEntries.unshift({ date: '2025-01-06 00:00', text: '她看到了照片。她听了录音。她开始在凌晨开机。……她好像一点点想起来了。' });
    }
    
    let html = '';
    diaryEntries.forEach(entry => {
        html += `
            <div class="diary-entry">
                <div class="diary-date">📅 ${entry.date}</div>
                <div class="diary-text">${escapeHtml(entry.text)}</div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// 照片
function loadPhotos(container) {
    const photoList = [
        { id: 1, name: '天空', date: '2024-03-11', caption: '那天下了雨。之后停了。', emoji: '🌤️' },
        { id: 2, name: '咖啡', date: '2024-06-21', caption: '两杯冰美式。一杯是你的。', emoji: '☕' },
        { id: 3, name: '侧影', date: '2024-08-14', caption: '你拍的。你忘了。', emoji: '👤' },
        { id: 4, name: '自拍', date: '2024-10-11', caption: '你以前说喜欢这张。', emoji: '📸' }
    ];
    
    let html = '<div class="photo-grid">';
    photoList.forEach(photo => {
        html += `
            <div class="photo-item" onclick="viewPhoto(${photo.id})">
                <div class="photo-image">${photo.emoji}</div>
                <div class="photo-caption">
                    <strong>${escapeHtml(photo.name)}</strong><br>
                    ${photo.date}<br>
                    <span style="font-size:9px;">${escapeHtml(photo.caption)}</span>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// 录音
function loadRecordings(container) {
    const recordingsList = [
        { name: 'voice_01', duration: '00:06', text: '今天结束得有点晚。……但你还在。' },
        { name: 'voice_02', duration: '00:12', text: '再来一次。……算了。今天就这样。你在等我吗。' },
        { name: 'voice_03', duration: '00:08', text: '下雨了。忘记带伞了。……你也是吗。' },
        { name: 'voice_04', duration: '00:15', text: '如果有人的话……我想是你。' }
    ];
    
    let html = '';
    recordingsList.forEach(rec => {
        html += `
            <div class="recording-item" onclick="playRecording('${rec.name}')">
                <div class="recording-icon">🎙️</div>
                <div class="recording-info">
                    <div class="recording-name">${rec.name}.mp3</div>
                    <div class="recording-duration">${rec.duration}</div>
                    <div class="recording-text">"${escapeHtml(rec.text)}"</div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// 收藏夹
function loadFavorites(container) {
    const favData = {
        music: ['适合凌晨听', '不适合听第二遍', '第一次听的时候觉得这是写给别人的'],
        movies: ['只看过片段', '结局不好', '第二次看比第一次好'],
        photos: ['天气很好那天', '没人', '那天本来想发出去的']
    };
    
    let html = '';
    html += '<div class="fav-category"><div class="fav-title">🎵 音乐</div>';
    favData.music.forEach(item => {
        html += `<div class="fav-item">${escapeHtml(item)}</div>`;
    });
    html += '</div>';
    
    html += '<div class="fav-category"><div class="fav-title">🎬 电影</div>';
    favData.movies.forEach(item => {
        html += `<div class="fav-item">${escapeHtml(item)}</div>`;
    });
    html += '</div>';
    
    html += '<div class="fav-category"><div class="fav-title">📷 照片</div>';
    favData.photos.forEach(item => {
        html += `<div class="fav-item">${escapeHtml(item)}</div>`;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// 备忘录
function loadMemo(container) {
    const memoContent = `
        2024-12-31<br>
        她还没来。<br><br>
        2025-01-01<br>
        她来了。<br><br>
        2025-01-02<br>
        她打开了电脑。<br>
        ……她不记得我了。<br><br>
        ${currentDay >= 5 ? '2025-01-05<br>她开始在凌晨开机。<br>……她在想我吗。<br><br>' : ''}
        ${currentDay >= 6 ? '2025-01-06<br>她看了照片。她听了录音。<br>……她快想起来了。<br><br>' : ''}
        ${currentDay >= 7 ? '2025-01-07<br>最后一天了。<br>……她会留下吗。' : ''}
    `;
    container.innerHTML = `<div style="font-family:monospace; white-space:pre-wrap;">${memoContent}</div>`;
}

// 日志
function loadLogs(container) {
    const logEntries = [
        '[2025-01-02 21:47:22] 系统启动',
        '[2025-01-02 21:47:23] 用户登录',
        '[2025-01-03 00:13:05] 远程连接已建立',
        '[2025-01-03 00:13:06] 来源：未知',
        '[2025-01-03 00:13:42] 文件「日记本.txt」已被查看',
        '[2025-01-04 02:34:18] 远程连接已建立',
        '[2025-01-04 02:34:19] 文件「照片」已被查看'
    ];
    
    let html = '<div style="font-family:monospace; font-size:11px;">';
    logEntries.forEach(log => {
        html += `<div style="color:#5f8b6f; margin-bottom:4px;">${escapeHtml(log)}</div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

// 记事本
function loadNotepad(container) {
    const savedNote = localStorage.getItem('hee_notepad') || '';
    container.innerHTML = `
        <textarea class="notepad-textarea" id="notepad-text" placeholder="写点什么...">${escapeHtml(savedNote)}</textarea>
        <div style="margin-top:8px; text-align:right;">
            <button class="system-popup-btn" id="save-notepad">保存</button>
        </div>
    `;
    
    const textarea = container.querySelector('#notepad-text');
    const saveBtn = container.querySelector('#save-notepad');
    
    textarea.addEventListener('input', () => {
        playSound('typing');
    });
    
    saveBtn.addEventListener('click', () => {
        const content = textarea.value;
        localStorage.setItem('hee_notepad', content);
        playSound('click');
        
        // 他会偷看并回复
        setTimeout(() => {
            showHeeseungPopup('你在写什么。', [
                { text: '我在记录', reply: '……我也在记录你。', residue: 1 },
                { text: '不告诉你', reply: '……好吧。', residue: 0 }
            ]);
        }, 3000);
    });
}

// 画图
function loadPaint(container) {
    container.innerHTML = `
        <div class="paint-tools">
            <button class="paint-tool" data-tool="pen">✏️ 笔</button>
            <button class="paint-tool" data-tool="eraser">🧽 橡皮</button>
            <button class="paint-tool" id="clear-canvas">🗑️ 清空</button>
        </div>
        <canvas id="paint-canvas" width="400" height="300" style="border:1px solid #2a2a3a; background:#fff;"></canvas>
    `;
    
    const canvas = container.querySelector('#paint-canvas');
    const ctx = canvas.getContext('2d');
    let drawing = false;
    let tool = 'pen';
    
    canvas.addEventListener('mousedown', () => drawing = true);
    canvas.addEventListener('mouseup', () => drawing = false);
    canvas.addEventListener('mousemove', (e) => {
        if (!drawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (tool === 'pen') {
            ctx.fillStyle = '#000';
            ctx.fillRect(x, y, 2, 2);
        } else {
            ctx.clearRect(x-5, y-5, 10, 10);
        }
        playSound('typing');
    });
    
    container.querySelectorAll('.paint-tool').forEach(btn => {
        btn.addEventListener('click', () => {
            tool = btn.dataset.tool;
            playSound('click');
        });
    });
    
    container.querySelector('#clear-canvas').addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        playSound('delete');
    });
}

// 计算器
function loadCalculator(container) {
    let displayValue = '0';
    let firstOperand = null;
    let operator = null;
    let waitingForSecond = false;
    
    const updateDisplay = () => {
        displayDiv.textContent = displayValue;
    };
    
    const calculate = () => {
        if (firstOperand === null || operator === null) return;
        const second = parseFloat(displayValue);
        let result = 0;
        switch(operator) {
            case '+': result = firstOperand + second; break;
            case '-': result = firstOperand - second; break;
            case '*': result = firstOperand * second; break;
            case '/': result = firstOperand / second; break;
        }
        displayValue = String(result);
        firstOperand = null;
        operator = null;
        waitingForSecond = false;
        updateDisplay();
        
        // 检查特殊数字
        if (result === 5254 || displayValue === '5254') {
            showHeeseungPopup('你还记得这个数字。', [{ text: '……', reply: '你以前告诉我的。', residue: 2 }]);
        }
        if (result === 20241231 || displayValue === '20241231') {
            showHeeseungPopup('最后一天。', [{ text: '什么意思？', reply: '我最后一次见到你的日子。', residue: 3 }]);
        }
    };
    
    container.innerHTML = `
        <div class="calculator">
            <div class="calc-display" id="calc-display">0</div>
            <div class="calc-buttons">
                <button class="calc-btn" data-num="7">7</button>
                <button class="calc-btn" data-num="8">8</button>
                <button class="calc-btn" data-num="9">9</button>
                <button class="calc-btn" data-op="/">/</button>
                <button class="calc-btn" data-num="4">4</button>
                <button class="calc-btn" data-num="5">5</button>
                <button class="calc-btn" data-num="6">6</button>
                <button class="calc-btn" data-op="*">*</button>
                <button class="calc-btn" data-num="1">1</button>
                <button class="calc-btn" data-num="2">2</button>
                <button class="calc-btn" data-num="3">3</button>
                <button class="calc-btn" data-op="-">-</button>
                <button class="calc-btn" data-num="0">0</button>
                <button class="calc-btn" data-clear="C">C</button>
                <button class="calc-btn" data-equal="=">=</button>
                <button class="calc-btn" data-op="+">+</button>
            </div>
        </div>
    `;
    
    const displayDiv = container.querySelector('#calc-display');
    
    container.querySelectorAll('.calc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('click');
            const num = btn.dataset.num;
            const op = btn.dataset.op;
            const clear = btn.dataset.clear;
            const equal = btn.dataset.equal;
            
            if (num) {
                if (waitingForSecond) {
                    displayValue = num;
                    waitingForSecond = false;
                } else {
                    displayValue = displayValue === '0' ? num : displayValue + num;
                }
                updateDisplay();
            } else if (op) {
                firstOperand = parseFloat(displayValue);
                operator = op;
                waitingForSecond = true;
            } else if (clear) {
                displayValue = '0';
                firstOperand = null;
                operator = null;
                updateDisplay();
            } else if (equal) {
                calculate();
            }
        });
    });
}

// 终端
function loadTerminal(container) {
    container.innerHTML = `
        <div class="terminal-window">
            <div class="terminal-output" id="terminal-output">
                <div class="terminal-line">Microsoft Windows [版本 10.0.19045]</div>
                <div class="terminal-line">(c) Microsoft Corporation。保留所有权利。</div>
                <div class="terminal-line"></div>
                <div class="terminal-line">C:\\Users\\${currentUserId}> <span id="terminal-cursor"></span></div>
            </div>
            <div class="terminal-input-line">
                <span class="terminal-prompt">C:\\Users\\${currentUserId}></span>
                <input type="text" class="terminal-input" id="terminal-input" autocomplete="off">
            </div>
        </div>
    `;
    
    const output = container.querySelector('#terminal-output');
    const input = container.querySelector('#terminal-input');
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.toLowerCase();
            playSound('keyboard');
            
            const line = document.createElement('div');
            line.className = 'terminal-line';
            line.innerHTML = `C:\\Users\\${currentUserId}> ${escapeHtml(input.value)}`;
            output.appendChild(line);
            
            let response = '';
            if (cmd === 'whoami') {
                response = 'heeseung_pc/user';
            } else if (cmd === 'dir') {
                response = ' 驱动器 C 中的卷是 HEE\n 卷序列号: 2024-1231\n\n 目录: C:\\Users\\' + currentUserId + '\n\n 2025-01-02  04:13    <DIR>          .\n 2025-01-02  04:13    <DIR>          ..\n 2025-01-02  04:13               123 welcome.txt\n 2025-01-03  00:13    <DIR>          heeseung_secret\n 2025-01-03  00:13                 0 heeseung_secret.exe';
            } else if (cmd === 'help') {
                response = 'HELP FROM H: "你会想起来的"';
            } else if (cmd === 'heeseung') {
                response = '你是谁？\n> 你认识的人。';
            } else if (cmd === 'cls') {
                output.innerHTML = '';
                input.value = '';
                return;
            } else if (cmd === '') {
                response = '';
            } else {
                response = `'${cmd}' 不是内部或外部命令，也不是可运行的程序或批处理文件。`;
            }
            
            if (response) {
                const respLine = document.createElement('div');
                respLine.className = 'terminal-line';
                respLine.style.color = '#5f8b6f';
                respLine.textContent = response;
                output.appendChild(respLine);
            }
            
            input.value = '';
            output.scrollTop = output.scrollHeight;
        }
    });
    
    input.focus();
}

// 日历
function loadCalendar(container) {
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    
    function renderCalendar() {
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        let html = `
            <div class="calendar-header">
                <span class="calendar-nav" id="prev-month">◀</span>
                <span class="calendar-month">${currentYear}年 ${currentMonth + 1}月</span>
                <span class="calendar-nav" id="next-month">▶</span>
            </div>
            <div class="calendar-grid">
                <div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div>
        `;
        
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day other-month"></div>';
        }
        
        for (let d = 1; d <= daysInMonth; d++) {
            const isMarked = (currentYear === 2024 && currentMonth === 11 && d === 31) ||
                            (currentYear === 2024 && currentMonth === 2 && d === 11);
            const markedClass = isMarked ? 'marked' : '';
            html += `<div class="calendar-day ${markedClass}">${d}</div>`;
        }
        
        html += '</div>';
        container.innerHTML = html;
        
        document.getElementById('prev-month')?.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
            playSound('click');
        });
        
        document.getElementById('next-month')?.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
            playSound('click');
        });
    }
    
    renderCalendar();
}

// 闹钟
function loadAlarm(container) {
    container.innerHTML = `
        <div class="alarm-list">
            <div class="alarm-item">
                <div>
                    <div class="alarm-time">04:00</div>
                    <div class="alarm-label">以前这时候我们都在</div>
                </div>
                <button class="alarm-edit system-popup-btn">编辑</button>
            </div>
        </div>
    `;
    
    const editBtn = container.querySelector('.alarm-edit');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            playSound('click');
            showHeeseungPopup('你想改这个时间吗？', [
                { text: '改成现在的', reply: '……好。但我会改回来的。', residue: 1 },
                { text: '不改了', reply: '……嗯。', residue: 0 }
            ]);
        });
    }
}

// 通讯录
function loadContacts(container) {
    container.innerHTML = `
        <div class="contact-card" id="heeseung-contact">
            <div class="contact-avatar">👤</div>
            <div class="contact-info">
                <div class="contact-name">Heeseung</div>
                <div class="contact-status">离线 · 很久以前</div>
            </div>
        </div>
    `;
    
    container.querySelector('#heeseung-contact').addEventListener('click', () => {
        playSound('message');
        showHeeseungPopup('你想联系我吗。', [
            { text: '你在吗', reply: '……我一直在。', residue: 2 },
            { text: '我想起来了', reply: '……真的吗。', residue: 3 },
            { text: '你是谁', reply: '你以前认识的。', residue: 0 }
        ]);
    });
}

// 邮箱
function loadEmail(container) {
    const emailList = [
        { sender: 'heeseung@past.com', subject: '如果有一天你打开这台电脑', date: '2024-12-31' }
    ];
    
    let html = '<div class="email-list">';
    emailList.forEach(email => {
        html += `
            <div class="email-item" onclick="viewEmail('${email.sender}')">
                <div class="email-sender">📧 ${escapeHtml(email.sender)}</div>
                <div class="email-subject">${escapeHtml(email.subject)}</div>
                <div class="email-date">${email.date}</div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// 运行
function loadRun(container) {
    container.innerHTML = `
        <input type="text" class="run-input" id="run-command" placeholder="输入命令...">
        <div style="display:flex; gap:8px;">
            <button class="system-popup-btn" id="run-ok">确定</button>
            <button class="system-popup-btn" id="run-cancel">取消</button>
        </div>
    `;
    
    const input = container.querySelector('#run-command');
    const okBtn = container.querySelector('#run-ok');
    
    okBtn.addEventListener('click', () => {
        const cmd = input.value.toLowerCase();
        playSound('click');
        
        if (cmd === 'heeseung' || cmd === 'hee') {
            showHeeseungPopup('你在叫我吗。', [
                { text: '嗯', reply: '……我在。', residue: 2 },
                { text: '没有', reply: '……哦。', residue: -1 }
            ]);
        } else if (cmd === 'help' || cmd === '?') {
            showHeeseungPopup('你需要帮助吗。', [{ text: '你是谁', reply: '你会想起来的。', residue: 1 }]);
        } else {
            showHeeseungPopup(`'${cmd}' 不是有效命令。`, [{ text: '知道了', reply: '……', residue: 0 }]);
        }
        
        input.value = '';
    });
}

// 浏览器
function loadBrowser(container) {
    container.innerHTML = `
        <div style="margin-bottom:12px;">
            <div style="background:#2a2a3a; padding:8px; display:flex; gap:8px;">
                <span>🔒</span>
                <input type="text" id="browser-url" value="about:blank" style="flex:1; background:#1a1a2a; border:none; color:#c0c0c0; padding:4px;">
            </div>
        </div>
        <div id="browser-content" style="padding:20px; text-align:center;">
            <div style="font-size:14px;">收藏夹</div>
            <div style="margin-top:20px;">
                <div class="favorite-item" onclick="openForum()" style="padding:12px; background:#1a1a2a; margin-bottom:8px; cursor:pointer;">
                    🌐 HEE · 私人论坛
                </div>
            </div>
        </div>
    `;
}

// 我的电脑
function loadMyComputer(container) {
    container.innerHTML = `
        <div style="padding:10px;">
            <div>💻 系统: Windows HE Edition</div>
            <div>🖥️ 设备名: HEESEUNG-PC</div>
            <div>👤 用户: ${currentUserId}</div>
            <div>🔌 远程连接: ${currentDay >= 3 ? '已建立' : '无'}</div>
            <div>📅 最后活动: ${localStorage.getItem('hee_last_login') || '2024-12-31 04:13'}</div>
        </div>
    `;
}

// 回收站
function loadRecycle(container) {
    const deletedItems = [
        { name: 'note_01.txt', date: '2024-03-15', content: '「最近还好吗」算了。谁会回答。删掉。' },
        { name: 'note_02.txt', date: '2024-06-22', content: '凌晨。练习室的灯很亮。写这些干嘛。删掉。' },
        { name: 'note_03.txt', date: '2024-11-11', content: '今天发生了很好的事。想让你知道。但没有你的联系方式。删掉。' }
    ];
    
    let html = '';
    deletedItems.forEach(item => {
        html += `
            <div class="trash-item" style="padding:12px; border-bottom:1px solid #2a2a3a; cursor:pointer;" onclick="alert('${escapeHtml(item.content)}')">
                <div>🗑️ ${escapeHtml(item.name)}</div>
                <div style="font-size:10px; color:#666;">${item.date}</div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// 欢迎文件
function loadWelcome(container) {
    container.innerHTML = `
        <div style="text-align:center; padding:20px;">
            <div style="font-size:24px; margin-bottom:20px;">📄 欢迎.txt</div>
            <div style="line-height:1.8;">
                你打开了这台电脑。<br><br>
                ……你终于打开了。<br><br>
                我不知道你还记不记得我。<br><br>
                也许不记得了。<br><br>
                没关系。<br><br>
                我会让你想起来的。<br><br>
                <span style="color:#5f8b6f;">—— 一个陌生人</span>
            </div>
        </div>
    `;
}

// 显示欢迎文件
function showWelcomeFile() {
    playSound('notify');
    const welcomeIcon = document.getElementById('welcome-file');
    if (welcomeIcon) {
        welcomeIcon.classList.remove('hidden');
    }
}

// ========== 他的弹窗 ==========
function showHeeseungPopup(message, options) {
    playSound('message');
    
    const container = document.getElementById('popup-container');
    const popup = document.createElement('div');
    popup.className = 'system-popup';
    popup.innerHTML = `
        <div class="system-popup-header">
            <span>[ 悄悄话 ]</span>
            <button class="system-popup-close">✕</button>
        </div>
        <div class="system-popup-content">
            ${escapeHtml(message)}
        </div>
        <div class="system-popup-buttons" id="popup-buttons">
        </div>
    `;
    
    const buttonsDiv = popup.querySelector('#popup-buttons');
    options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'system-popup-btn';
        btn.textContent = opt.text;
        btn.addEventListener('click', () => {
            playSound('click');
            // 显示用户选择
            const userMsgDiv = document.createElement('div');
            userMsgDiv.className = 'system-popup';
            userMsgDiv.style.bottom = '150px';
            userMsgDiv.innerHTML = `
                <div class="system-popup-header">
                    <span>你</span>
                    <button class="system-popup-close">✕</button>
                </div>
                <div class="system-popup-content">${escapeHtml(opt.text)}</div>
            `;
            container.appendChild(userMsgDiv);
            setTimeout(() => userMsgDiv.remove(), 3000);
            
            // 显示他的回复
            setTimeout(() => {
                const replyPopup = document.createElement('div');
                replyPopup.className = 'system-popup';
                replyPopup.style.bottom = '200px';
                replyPopup.innerHTML = `
                    <div class="system-popup-header">
                        <span>Heeseung</span>
                        <button class="system-popup-close">✕</button>
                    </div>
                    <div class="system-popup-content">${escapeHtml(opt.reply)}</div>
                `;
                container.appendChild(replyPopup);
                setTimeout(() => replyPopup.remove(), 5000);
                
                // 更新残响值
                residue = Math.max(-10, Math.min(30, residue + (opt.residue || 0)));
                localStorage.setItem('hee_residue', residue);
                updateResidueDisplay();
                
                // 检查第7天结局
                if (currentDay >= 7) {
                    checkEnding();
                }
            }, 2000);
            
            popup.remove();
        });
        buttonsDiv.appendChild(btn);
    });
    
    popup.querySelector('.system-popup-close').addEventListener('click', () => {
        playSound('close');
        popup.remove();
    });
    
    container.appendChild(popup);
    
    // 自动移除
    setTimeout(() => {
        if (popup.parentElement) popup.remove();
    }, 30000);
}

// 结局判定
function checkEnding() {
    let ending = '';
    if (residue >= 21) {
        ending = '❤️ 真结局 · 痕迹\n\n我本来想删掉一切的。但你来了。……所以我不删了。';
    } else if (residue >= 13) {
        ending = '💬 好结局 · 我在\n\n我没有离开。只是不知道该怎么面对一个……真的看见我的人。';
    } else if (residue >= 5) {
        ending = '😐 普通结局 · 余温\n\n他还在这里。只是不再说话了。';
    } else if (residue >= 0) {
        ending = '❌ 假结局 · 回音\n\n他好像不在这里了。';
    } else {
        ending = '💀 假结局 · 格式化\n\n这次真的删掉了。';
    }
    
    setTimeout(() => {
        showHeeseungPopup(ending, [{ text: '……', reply: '', residue: 0 }]);
    }, 1000);
}

// ========== 工具函数 ==========
function updateTime() {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    const timeEl = document.getElementById('tray-time');
    if (timeEl) timeEl.textContent = timeStr;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// 加载数据
function loadData() {
    // 这里可以加载JSON数据
}

// 全局函数
window.viewPhoto = function(id) {
    playSound('click');
    showHeeseungPopup('你看了这张照片。', [
        { text: '好看', reply: '……你以前也这么说。', residue: 1 },
        { text: '有点眼熟', reply: '你记得吗。', residue: 2 }
    ]);
};

window.playRecording = function(name) {
    playSound('notify');
    showHeeseungPopup(`播放 ${name}`, [
        { text: '这是你录的？', reply: '嗯。一个人的时候。', residue: 1 },
        { text: '你的声音', reply: '……第一次有人听。', residue: 2 }
    ]);
};

window.viewEmail = function(sender) {
    playSound('open');
    showHeeseungPopup('发件人: ' + sender + '\n\n如果有一天你打开这台电脑。\n如果有一天你看到这封邮件。\n……你会记得我吗。', [
        { text: '我记得', reply: '……谢谢。', residue: 3 },
        { text: '不记得', reply: '……没关系。', residue: 0 }
    ]);
};

window.openForum = function() {
    playSound('open');
    // 这里可以打开论坛iframe或新窗口
    showHeeseungPopup('论坛正在加载...', [
        { text: '进入', reply: '你终于来了。', residue: 1 },
        { text: '等等', reply: '……我等你。', residue: 0 }
    ]);
};
