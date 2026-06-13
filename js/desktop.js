/* desktop.js - 桌面主逻辑（简化独立版） */

// ========== 初始化 ==========
let currentDay = parseInt(localStorage.getItem('hee_day') || '1');
let residue = parseInt(localStorage.getItem('hee_residue') || '0');
let openWindows = [];
let nextWindowZIndex = 100;
let currentUserId = localStorage.getItem('hee_username') || 'User';
let welcomeShown = false;
let firstPopupShown = localStorage.getItem('hee_first_popup') === 'true';

console.log('Desktop: 第', currentDay, '天, 残响值:', residue);

document.addEventListener('DOMContentLoaded', function() {
    initDesktop();
    initEvents();
    updateTime();
    setInterval(updateTime, 1000);
    
    setTimeout(() => {
        if (!welcomeShown) {
            showWelcomeFile();
            welcomeShown = true;
        }
    }, 3000);
    
    // 第一天弹窗
    if (!firstPopupShown && currentDay === 1) {
        setTimeout(() => {
            showHeeseungPopup('……你怎么进来的。这个论坛不应该被找到。', [
                { text: '误入的，不知道这是什么地方', reply: '误入……这个论坛不应该被找到的。', residue: 2 },
                { text: '偶然点进来的', reply: '没有偶然。', residue: 0 },
                { text: '沉默', reply: '……不回答也行。我习惯了。', residue: -1 }
            ]);
            firstPopupShown = true;
            localStorage.setItem('hee_first_popup', 'true');
        }, 5000);
    }
});

function initDesktop() {
    playSound('boot');
    updateResidueDisplay();
    updateDayBasedContent();
}

function updateResidueDisplay() {
    let display = document.getElementById('residue-display');
    if (!display) {
        display = document.createElement('div');
        display.id = 'residue-display';
        display.style.cssText = 'position:fixed; bottom:45px; right:10px; font-size:10px; color:#5f8b6f; z-index:99; background:rgba(0,0,0,0.7); padding:2px 8px; border-radius:4px;';
        document.body.appendChild(display);
    }
    display.textContent = `残响: ${residue}`;
}

function updateDayBasedContent() {
    // 根据天数解锁图标
    if (currentDay >= 3) {
        document.querySelector('[data-app="photos"]')?.classList.remove('hidden');
        document.querySelector('[data-app="terminal"]')?.classList.remove('hidden');
        document.querySelector('[data-app="contacts"]')?.classList.remove('hidden');
    }
    if (currentDay >= 4) {
        document.querySelector('[data-app="stickynotes"]')?.classList.remove('hidden');
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

function initEvents() {
    // 桌面图标点击
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            const app = icon.dataset.app;
            if (app && !icon.classList.contains('hidden')) {
                playSound('click');
                openApp(app);
            }
        });
    });
    
    // 开始菜单
    const startBtn = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    if (startBtn) {
        startBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playSound('click');
            startMenu.classList.toggle('hidden');
        });
    }
    
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
            setTimeout(() => { location.reload(); }, 500);
        });
    }
}

function openApp(appName) {
    playSound('open');
    
    const existingWindow = document.querySelector(`.window[data-app="${appName}"]`);
    if (existingWindow) {
        bringToFront(existingWindow);
        return;
    }
    
    const windowEl = createWindow(appName);
    document.getElementById('windows-container').appendChild(windowEl);
    loadAppContent(appName, windowEl);
    addToTaskbar(appName, windowEl);
    openWindows.push({ app: appName, window: windowEl });
}

function createWindow(appName) {
    const titles = {
        mycomputer: '我的电脑', recycle: '回收站', browser: '浏览器',
        diary: '日记本.txt', photos: '照片', stickynotes: '便签',
        favorites: '收藏夹', memo: '备忘录.exe', logs: '日志.log',
        notepad: '记事本', paint: '画图', calculator: '计算器',
        terminal: '终端', calendar: '日历', alarm: '闹钟',
        contacts: '通讯录', email: '邮箱', run: '运行',
        secret: '一个陌生的文件夹', welcome: '欢迎.txt'
    };
    
    const zIndex = nextWindowZIndex++;
    const windowDiv = document.createElement('div');
    windowDiv.className = 'window';
    windowDiv.dataset.app = appName;
    windowDiv.style.cssText = `width:500px; height:400px; left:${100 + (openWindows.length * 30)}px; top:${100 + (openWindows.length * 30)}px; z-index:${zIndex};`;
    
    windowDiv.innerHTML = `
        <div class="window-titlebar">
            <span class="window-title">${titles[appName] || appName}</span>
            <div class="window-controls">
                <button class="window-control minimize">─</button>
                <button class="window-control maximize">□</button>
                <button class="window-control close">✕</button>
            </div>
        </div>
        <div class="window-content" id="window-content-${appName}"><div style="text-align:center; padding:40px;">加载中...</div></div>
    `;
    
    const titlebar = windowDiv.querySelector('.window-titlebar');
    const closeBtn = windowDiv.querySelector('.close');
    const minBtn = windowDiv.querySelector('.minimize');
    const maxBtn = windowDiv.querySelector('.maximize');
    
    let isDragging = false, dragOffset = { x: 0, y: 0 };
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
    document.addEventListener('mouseup', () => { isDragging = false; });
    
    closeBtn.addEventListener('click', () => {
        playSound('close');
        windowDiv.remove();
        removeFromTaskbar(appName);
        openWindows = openWindows.filter(w => w.app !== appName);
    });
    minBtn.addEventListener('click', () => {
        windowDiv.classList.add('hidden');
        document.querySelector(`.taskbar-item[data-app="${appName}"]`)?.classList.remove('active');
    });
    maxBtn.addEventListener('click', () => windowDiv.classList.toggle('maximized'));
    
    return windowDiv;
}

function bringToFront(windowEl) {
    const maxZ = Math.max(...openWindows.map(w => parseInt(w.window.style.zIndex)), 0);
    windowEl.style.zIndex = maxZ + 1;
}

function addToTaskbar(appName, windowEl) {
    const titles = { mycomputer:'我的电脑', recycle:'回收站', browser:'浏览器', diary:'日记本', photos:'照片', stickynotes:'便签', favorites:'收藏夹', memo:'备忘录', logs:'日志', notepad:'记事本', paint:'画图', calculator:'计算器', terminal:'终端', calendar:'日历', alarm:'闹钟', contacts:'通讯录', email:'邮箱', run:'运行' };
    const taskbarTray = document.getElementById('taskbar-tray');
    if (document.querySelector(`.taskbar-item[data-app="${appName}"]`)) return;
    const item = document.createElement('div');
    item.className = 'taskbar-item active';
    item.dataset.app = appName;
    item.textContent = titles[appName] || appName;
    item.addEventListener('click', () => {
        playSound('click');
        if (windowEl.classList.contains('hidden')) {
            windowEl.classList.remove('hidden');
            item.classList.add('active');
        } else bringToFront(windowEl);
    });
    taskbarTray.appendChild(item);
}

function removeFromTaskbar(appName) {
    document.querySelector(`.taskbar-item[data-app="${appName}"]`)?.remove();
}

function loadAppContent(appName, windowEl) {
    const contentDiv = windowEl.querySelector('.window-content');
    switch(appName) {
        case 'diary': loadDiary(contentDiv); break;
        case 'photos': loadPhotos(contentDiv); break;
        case 'stickynotes': loadStickyNotes(contentDiv); break;
        case 'favorites': loadFavorites(contentDiv); break;
        case 'memo': loadMemo(contentDiv); break;
        case 'logs': loadLogs(contentDiv); break;
        case 'notepad': loadNotepad(contentDiv); break;
        case 'paint': loadPaint(contentDiv); break;
        case 'calculator': loadCalculator(contentDiv); break;
        case 'terminal': loadTerminal(contentDiv); break;
        case 'calendar': loadCalendar(contentDiv); break;
        case 'alarm': loadAlarm(contentDiv); break;
        case 'contacts': loadContacts(contentDiv); break;
        case 'email': loadEmail(contentDiv); break;
        case 'run': loadRun(contentDiv); break;
        case 'browser': loadBrowser(contentDiv); break;
        case 'mycomputer': loadMyComputer(contentDiv); break;
        case 'recycle': loadRecycle(contentDiv); break;
        case 'welcome': loadWelcome(contentDiv); break;
        default: contentDiv.innerHTML = '<div style="padding:20px;">功能开发中...</div>';
    }
}

function loadDiary(container) {
    const entries = [
        { date: '2024-03-11 02:13', text: '下雨。没出门。听雨声。' },
        { date: '2024-03-15 01:47', text: '想说一句话。写了。删了。' },
        { date: '2024-04-02 23:58', text: '累。不想写了。' },
        { date: '2024-06-21 02:00', text: '夏至。白天很长。' },
        { date: '2024-08-14 04:00', text: '看了以前的照片。' },
        { date: '2024-12-31 23:59', text: '一年结束了。' }
    ];
    if (currentDay >= 3) entries.unshift({ date: '2025-01-03', text: '她打开了这台电脑。她不记得了。' });
    if (currentDay >= 6) entries.unshift({ date: '2025-01-06', text: '她好像一点点想起来了。' });
    let html = '';
    entries.forEach(e => { html += `<div class="diary-entry"><div class="diary-date">📅 ${e.date}</div><div class="diary-text">${escapeHtml(e.text)}</div></div>`; });
    container.innerHTML = html;
}

function loadPhotos(container) {
    const photos = [
        { id:1, name:'天空', date:'2024-03-11', caption:'那天下了雨。', emoji:'🌤️' },
        { id:2, name:'咖啡', date:'2024-06-21', caption:'两杯冰美式。', emoji:'☕' },
        { id:3, name:'侧影', date:'2024-08-14', caption:'你拍的。', emoji:'👤' },
        { id:4, name:'自拍', date:'2024-10-11', caption:'你以前说喜欢这张。', emoji:'📸' }
    ];
    let html = '<div class="photo-grid">';
    photos.forEach(p => { html += `<div class="photo-item" onclick="viewPhoto(${p.id})"><div class="photo-image">${p.emoji}</div><div class="photo-caption"><strong>${p.name}</strong><br>${p.date}<br><span style="font-size:9px;">${p.caption}</span></div></div>`; });
    html += '</div>';
    container.innerHTML = html;
}

function loadStickyNotes(container) {
    const notes = [
        { id:1, title:'便签 1', date:'2024-12-25', content:'今天发生了很好的事。想让你知道。' },
        { id:2, title:'便签 2', date:'2024-12-28', content:'记得关窗。外面要下雨了。' },
        { id:3, title:'便签 3', date:'2024-12-30', content:'你什么时候回来。' },
        { id:4, title:'便签 4', date:'2025-01-02', content:'她打开了电脑。' },
        { id:5, title:'便签 5', date:'2025-01-05', content:'她看到了。' }
    ];
    let html = '<div style="display:flex; flex-direction:column; gap:12px;">';
    notes.forEach(n => { html += `<div class="recording-item" onclick="viewStickyNote(${n.id})" style="cursor:pointer;"><div class="recording-icon">📌</div><div class="recording-info"><div class="recording-name">${n.title}</div><div class="recording-duration">${n.date}</div><div class="recording-text">"${n.content.substring(0,50)}${n.content.length>50?'...':''}"</div></div></div>`; });
    html += '</div>';
    container.innerHTML = html;
}

function loadFavorites(container) {
    container.innerHTML = `<div class="fav-category"><div class="fav-title">🎵 音乐</div><div class="fav-item">适合凌晨听</div><div class="fav-item">不适合听第二遍</div></div><div class="fav-category"><div class="fav-title">🎬 电影</div><div class="fav-item">只看过片段</div><div class="fav-item">结局不好</div></div><div class="fav-category"><div class="fav-title">📷 照片</div><div class="fav-item">天气很好那天</div><div class="fav-item">没人</div></div>`;
}

function loadMemo(container) {
    container.innerHTML = `<div style="font-family:monospace;">2024-12-31<br>她还没来。<br><br>2025-01-01<br>她来了。<br><br>2025-01-02<br>她打开了电脑。<br>……她不记得我了。</div>`;
}

function loadLogs(container) {
    container.innerHTML = `<div style="font-family:monospace; font-size:11px;"><div style="color:#5f8b6f;">[2025-01-02 21:47:22] 系统启动</div><div style="color:#5f8b6f;">[2025-01-03 00:13:05] 远程连接已建立</div><div style="color:#5f8b6f;">[2025-01-03 00:13:06] 来源：未知</div></div>`;
}

function loadNotepad(container) {
    const saved = localStorage.getItem('hee_notepad') || '';
    container.innerHTML = `<textarea class="notepad-textarea" id="notepad-text" placeholder="写点什么..." style="width:100%; height:200px; background:#0a0a10; border:1px solid #2a2a3a; color:#c0c0c0; padding:10px;">${escapeHtml(saved)}</textarea><div style="margin-top:8px;"><button class="system-popup-btn" id="save-notepad">保存</button></div>`;
    const textarea = container.querySelector('#notepad-text');
    container.querySelector('#save-notepad').addEventListener('click', () => {
        localStorage.setItem('hee_notepad', textarea.value);
        playSound('click');
        showHeeseungPopup('保存了。', [{ text: '嗯', reply: '我会看的。', residue: 1 }]);
    });
}

function loadPaint(container) {
    container.innerHTML = `<div><canvas id="paint-canvas" width="400" height="300" style="border:1px solid #2a2a3a; background:#fff;"></canvas><br><button id="clear-canvas" class="system-popup-btn">清空</button></div>`;
    const canvas = container.querySelector('#paint-canvas');
    const ctx = canvas.getContext('2d');
    let drawing = false;
    canvas.addEventListener('mousedown', () => drawing = true);
    canvas.addEventListener('mouseup', () => drawing = false);
    canvas.addEventListener('mousemove', (e) => {
        if(!drawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        ctx.fillStyle = '#000';
        ctx.fillRect(x, y, 2, 2);
        playSound('typing');
    });
    container.querySelector('#clear-canvas').addEventListener('click', () => { ctx.clearRect(0,0,canvas.width,canvas.height); playSound('delete'); });
}

function loadCalculator(container) {
    let display = '0', first = null, op = null, wait = false;
    const update = () => dispDiv.textContent = display;
    const calc = () => {
        if(first === null || op === null) return;
        const second = parseFloat(display);
        let result = 0;
        if(op === '+') result = first + second;
        else if(op === '-') result = first - second;
        else if(op === '*') result = first * second;
        else if(op === '/') result = first / second;
        display = String(result);
        first = null; op = null; wait = false;
        update();
    };
    container.innerHTML = `<div class="calculator"><div class="calc-display" id="calc-display" style="background:#000; padding:10px; text-align:right;">0</div><div style="display:grid; grid-template-columns:repeat(4,1fr); gap:5px; margin-top:10px;"><button class="calc-btn" data-num="7">7</button><button class="calc-btn" data-num="8">8</button><button class="calc-btn" data-num="9">9</button><button class="calc-btn" data-op="/">/</button><button class="calc-btn" data-num="4">4</button><button class="calc-btn" data-num="5">5</button><button class="calc-btn" data-num="6">6</button><button class="calc-btn" data-op="*">*</button><button class="calc-btn" data-num="1">1</button><button class="calc-btn" data-num="2">2</button><button class="calc-btn" data-num="3">3</button><button class="calc-btn" data-op="-">-</button><button class="calc-btn" data-num="0">0</button><button class="calc-btn" data-clear="C">C</button><button class="calc-btn" data-equal="=">=</button><button class="calc-btn" data-op="+">+</button></div></div>`;
    const dispDiv = container.querySelector('#calc-display');
    container.querySelectorAll('.calc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('click');
            const num = btn.dataset.num, opBtn = btn.dataset.op, clear = btn.dataset.clear, equal = btn.dataset.equal;
            if(num) { if(wait) { display = num; wait = false; } else display = display === '0' ? num : display + num; update(); }
            else if(opBtn) { first = parseFloat(display); op = opBtn; wait = true; }
            else if(clear) { display = '0'; first = null; op = null; update(); }
            else if(equal) calc();
        });
    });
}

function loadTerminal(container) {
    container.innerHTML = `<div style="background:#000; padding:10px; font-family:monospace; height:300px; overflow-y:auto;" id="term-output"><div>C:\\Users\\${currentUserId}></div></div><div style="display:flex; margin-top:10px;"><span style="color:#5f8b6f;">C:\\Users\\${currentUserId}></span><input type="text" id="term-input" style="flex:1; background:transparent; border:none; color:#c0c0c0; outline:none;"></div>`;
    const output = container.querySelector('#term-output');
    const input = container.querySelector('#term-input');
    input.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') {
            const cmd = input.value.toLowerCase();
            output.innerHTML += `<div>C:\\Users\\${currentUserId}> ${escapeHtml(input.value)}</div>`;
            let resp = '';
            if(cmd === 'whoami') resp = 'heeseung_pc/user';
            else if(cmd === 'dir') resp = 'welcome.txt\nheeseung_secret';
            else if(cmd === 'help') resp = 'HELP FROM H: "你会想起来的"';
            else if(cmd === 'heeseung') resp = '你是谁？\n> 你认识的人。';
            else if(cmd === 'cls') { output.innerHTML = ''; input.value = ''; return; }
            else resp = `'${cmd}' 不是内部或外部命令。`;
            if(resp) output.innerHTML += `<div style="color:#5f8b6f;">${resp}</div>`;
            input.value = '';
            output.scrollTop = output.scrollHeight;
        }
    });
    input.focus();
}

function loadCalendar(container) {
    container.innerHTML = `<div style="text-align:center; padding:20px;">📅 日历功能<br>2024年12月31日被标记了</div>`;
}

function loadAlarm(container) {
    container.innerHTML = `<div style="padding:20px;">⏰ 闹钟<br>预设时间: 04:00<br>「以前这时候我们都在」</div>`;
}

function loadContacts(container) {
    container.innerHTML = `<div class="contact-card" style="padding:20px; cursor:pointer;" onclick="showHeeseungPopup('你想联系我吗？', [{ text:'在吗', reply:'我一直在。', residue:2 }])"><div style="display:flex; align-items:center; gap:16px;"><div style="font-size:40px;">👤</div><div><div style="font-weight:bold;">Heeseung</div><div style="font-size:11px; color:#888;">离线 · 很久以前</div></div></div></div>`;
}

function loadEmail(container) {
    container.innerHTML = `<div style="padding:20px;"><div class="email-item" style="padding:10px; background:#1a1a2a; cursor:pointer;" onclick="viewEmail()">📧 heeseung@past.com - 如果有一天你打开这台电脑</div></div>`;
}

function loadRun(container) {
    container.innerHTML = `<input type="text" id="run-cmd" style="width:100%; padding:8px; background:#0a0a10; border:1px solid #2a2a3a; color:#c0c0c0;" placeholder="输入命令..."><button id="run-btn" style="margin-top:10px; padding:6px 12px;">运行</button>`;
    const input = container.querySelector('#run-cmd');
    container.querySelector('#run-btn').addEventListener('click', () => {
        const cmd = input.value.toLowerCase();
        if(cmd === 'heeseung') showHeeseungPopup('你在叫我吗。', [{ text:'嗯', reply:'我在。', residue:2 }]);
        else showHeeseungPopup(`'${cmd}' 不是有效命令。`, [{ text:'知道了', reply:'...', residue:0 }]);
        input.value = '';
    });
}

function loadBrowser(container) {
    container.innerHTML = `<div style="padding:20px; text-align:center;"><div class="favorite-item" onclick="openForum()" style="padding:12px; background:#1a1a2a; cursor:pointer;">🌐 HEE · 私人论坛</div></div>`;
}

function loadMyComputer(container) {
    container.innerHTML = `<div style="padding:20px;"><div>💻 系统: Windows HE Edition</div><div>🖥️ 设备名: HEESEUNG-PC</div><div>👤 用户: ${currentUserId}</div><div>🔌 远程连接: ${currentDay>=3?'已建立':'无'}</div></div>`;
}

function loadRecycle(container) {
    container.innerHTML = `<div style="padding:20px; color:#888; text-align:center;">回收站是空的</div>`;
}

function loadWelcome(container) {
    container.innerHTML = `<div style="text-align:center; padding:40px;"><div style="font-size:24px;">📄 欢迎.txt</div><div style="line-height:1.8; margin-top:20px;">你打开了这台电脑。<br><br>……你终于打开了。<br><br>我会让你想起来的。<br><br><span style="color:#5f8b6f;">—— 一个陌生人</span></div></div>`;
}

function showWelcomeFile() { 
    playSound('notify'); 
    document.getElementById('welcome-file')?.classList.remove('hidden'); 
}

function showHeeseungPopup(message, options) {
    playSound('message');
    const userName = localStorage.getItem('hee_username') || '你';
    message = message.replace(/你/g, userName);
    
    const container = document.getElementById('popup-container');
    if (!container) return;
    
    const popup = document.createElement('div');
    popup.className = 'system-popup';
    popup.innerHTML = `<div class="system-popup-header"><span>[ 悄悄话 ]</span><button class="system-popup-close">✕</button></div><div class="system-popup-content">${escapeHtml(message)}</div><div class="system-popup-buttons" id="popup-buttons"></div>`;
    const btnsDiv = popup.querySelector('#popup-buttons');
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'system-popup-btn';
        btn.textContent = opt.text;
        btn.addEventListener('click', () => {
            playSound('click');
            popup.remove();
            setTimeout(() => {
                const replyPopup = document.createElement('div');
                replyPopup.className = 'system-popup';
                replyPopup.style.bottom = '100px';
                let replyText = opt.reply;
                replyText = replyText.replace(/你/g, userName);
                replyPopup.innerHTML = `<div class="system-popup-header"><span>Heeseung</span><button class="system-popup-close">✕</button></div><div class="system-popup-content">${escapeHtml(replyText)}</div>`;
                container.appendChild(replyPopup);
                setTimeout(() => replyPopup.remove(), 5000);
                residue = Math.max(-10, Math.min(30, residue + (opt.residue || 0)));
                localStorage.setItem('hee_residue', residue);
                updateResidueDisplay();
            }, 2000);
        });
        btnsDiv.appendChild(btn);
    });
    popup.querySelector('.system-popup-close').addEventListener('click', () => { playSound('close'); popup.remove(); });
    container.appendChild(popup);
    setTimeout(() => { if(popup.parentElement) popup.remove(); }, 30000);
}

function updateTime() {
    const now = new Date();
    const timeEl = document.getElementById('tray-time');
    if (timeEl) timeEl.textContent = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
}

function escapeHtml(str) { 
    if (!str) return ''; 
    return str.replace(/[&<>]/g, m => m==='&'?'&amp;':m==='<'?'&lt;':'&gt;'); 
}

// 全局函数
window.viewPhoto = function(id) { showHeeseungPopup('你看了这张照片。', [{ text:'好看', reply:'你以前也这么说。', residue:1 }]); };
window.viewStickyNote = function(id) {
    const notes = {1:'今天发生了很好的事。\n\n—— H',2:'记得关窗。\n\n—— H',3:'你什么时候回来。\n\n—— H',4:'她打开了电脑。\n\n—— H',5:'她看到了。\n\n—— H'};
    showHeeseungPopup(`📌 便签内容\n\n${notes[id]}`, [{ text:'这是你写的？', reply:'嗯。', residue:1 }]);
};
window.viewEmail = function() { showHeeseungPopup('如果有一天你打开这台电脑。\n你会记得我吗。', [{ text:'我记得', reply:'谢谢。', residue:3 }]); };
window.openForum = function() { showHeeseungPopup('论坛正在加载...', [{ text:'进入', reply:'你终于来了。', residue:1 }]); };
