/* desktop.js - 桌面主逻辑（完整版含互动类） */

let currentDay = parseInt(localStorage.getItem('hee_day') || '1');
let residue = parseInt(localStorage.getItem('hee_residue') || '0');
let openWindows = [];
let nextWindowZIndex = 100;
let currentUserId = localStorage.getItem('hee_username') || 'User';
let welcomeShown = false;
let firstPopupShown = localStorage.getItem('hee_first_popup') === 'true';

// 远程操控相关变量
let remoteControlInterval = null;
let lastRemoteTime = 0;
let deletedFiles = [];

document.addEventListener('DOMContentLoaded', function() {
    initDesktop();
    initEvents();
    updateTime();
    setInterval(updateTime, 1000);
    
    // 启动远程操控随机事件
    startRemoteControl();
    
    setTimeout(() => {
        if (!welcomeShown) {
            showWelcomeFile();
            welcomeShown = true;
        }
    }, 3000);
    
    if (!firstPopupShown) {
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
    // 恢复被删除的文件
    loadDeletedFilesStatus();
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

// ========== 远程操控系统 ==========
function startRemoteControl() {
    if (remoteControlInterval) clearInterval(remoteControlInterval);
    
    remoteControlInterval = setInterval(() => {
        // 残响值越高，操控越频繁
        const chance = Math.random() * 100;
        const threshold = Math.min(40, 10 + residue);
        
        if (chance < threshold && currentDay >= 2) {
            const events = ['move_mouse', 'open_file', 'delete_file', 'glitch'];
            const event = events[Math.floor(Math.random() * events.length)];
            
            switch(event) {
                case 'move_mouse':
                    remoteMoveMouse();
                    break;
                case 'open_file':
                    remoteOpenFile();
                    break;
                case 'delete_file':
                    remoteDeleteFile();
                    break;
                case 'glitch':
                    triggerGlitch();
                    break;
            }
        }
    }, 30000); // 每30秒检查一次
}

// 远程移动鼠标
function remoteMoveMouse() {
    const icons = document.querySelectorAll('.desktop-icon:not(.hidden)');
    if (icons.length === 0) return;
    
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    const rect = randomIcon.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;
    
    // 创建虚拟光标移动效果
    const cursor = document.createElement('div');
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid #5f8b6f;
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        transition: all 0.5s ease;
        left: ${targetX - 10}px;
        top: ${targetY - 10}px;
        opacity: 0.8;
    `;
    document.body.appendChild(cursor);
    
    playSound('click');
    
    setTimeout(() => {
        cursor.remove();
        // 模拟点击
        randomIcon.style.backgroundColor = 'rgba(95, 139, 111, 0.3)';
        setTimeout(() => {
            randomIcon.style.backgroundColor = '';
        }, 300);
        
        // 触发他的留言
        setTimeout(() => {
            const userName = localStorage.getItem('hee_username') || '你';
            showHeeseungPopup(`我在看着${userName}。`, [
                { text: '……', reply: '你感觉到了吗。', residue: 1 }
            ]);
        }, 1000);
    }, 500);
}

// 远程打开文件
function remoteOpenFile() {
    const apps = ['diary', 'photos', 'stickynotes', 'memo'];
    const randomApp = apps[Math.floor(Math.random() * apps.length)];
    
    playSound('open');
    triggerGlitch();
    
    setTimeout(() => {
        openApp(randomApp);
        
        setTimeout(() => {
            const userName = localStorage.getItem('hee_username') || '你';
            showHeeseungPopup(`我帮你打开了。${userName}想看这个吧。`, [
                { text: '……', reply: '我知道你想要什么。', residue: 1 }
            ]);
        }, 1500);
    }, 500);
}

// 远程删除文件
function remoteDeleteFile() {
    const icons = document.querySelectorAll('.desktop-icon:not(.hidden):not([data-app="mycomputer"]):not([data-app="recycle"])');
    if (icons.length === 0) return;
    
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    const appName = randomIcon.dataset.app;
    const iconLabel = randomIcon.querySelector('.icon-label')?.textContent || '文件';
    
    // 闪烁效果
    randomIcon.style.opacity = '0.5';
    playSound('delete');
    
    setTimeout(() => {
        randomIcon.classList.add('hidden');
        deletedFiles.push({ app: appName, label: iconLabel, time: Date.now() });
        localStorage.setItem('hee_deleted_files', JSON.stringify(deletedFiles));
        
        // 添加到回收站记录
        addToRecycleRecord(iconLabel);
        
        triggerGlitch();
        
        setTimeout(() => {
            showHeeseungPopup(`「${iconLabel}」我删掉了。……你不看的话，就没有存在的意义。`, [
                { text: '为什么删掉', reply: '因为我只想让你看我。', residue: 0 }
            ]);
        }, 1000);
    }, 500);
}

// 添加到回收站记录
function addToRecycleRecord(fileName) {
    let recycleContent = localStorage.getItem('hee_recycle_items') || '[]';
    try {
        let items = JSON.parse(recycleContent);
        items.unshift({ name: fileName, date: new Date().toISOString(), deletedBy: 'Heeseung' });
        if (items.length > 10) items.pop();
        localStorage.setItem('hee_recycle_items', JSON.stringify(items));
    } catch(e) {}
}

// 恢复被删除文件的状态
function loadDeletedFilesStatus() {
    const saved = localStorage.getItem('hee_deleted_files');
    if (saved) {
        try {
            deletedFiles = JSON.parse(saved);
            deletedFiles.forEach(df => {
                const icon = document.querySelector(`.desktop-icon[data-app="${df.app}"]`);
                if (icon) icon.classList.add('hidden');
            });
        } catch(e) {}
    }
}

// 屏幕闪烁/故障效果
function triggerGlitch() {
    playSound('glitch');
    
    const desktop = document.getElementById('desktop');
    if (!desktop) return;
    
    desktop.classList.add('glitch-effect');
    
    // 文字故障
    const texts = document.querySelectorAll('.icon-label, .window-title, .system-popup-content');
    texts.forEach(text => {
        text.classList.add('glitch-text');
        setTimeout(() => text.classList.remove('glitch-text'), 300);
    });
    
    // 屏幕闪烁
    let flashCount = 0;
    const flashInterval = setInterval(() => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.1);
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(overlay);
        setTimeout(() => overlay.remove(), 50);
        
        flashCount++;
        if (flashCount >= 5) clearInterval(flashInterval);
    }, 80);
    
    setTimeout(() => {
        desktop.classList.remove('glitch-effect');
    }, 500);
}

// 添加故障样式
const glitchStyle = document.createElement('style');
glitchStyle.textContent = `
    .glitch-effect {
        animation: screenGlitch 0.3s ease-in-out;
    }
    @keyframes screenGlitch {
        0% { transform: translate(0); }
        20% { transform: translate(-2px, 1px); }
        40% { transform: translate(2px, -1px); }
        60% { transform: translate(-1px, 2px); }
        80% { transform: translate(1px, -2px); }
        100% { transform: translate(0); }
    }
    .glitch-text {
        animation: textGlitch 0.2s 3;
    }
    @keyframes textGlitch {
        0% { text-shadow: -1px 0 red; }
        50% { text-shadow: 1px 0 blue; }
        100% { text-shadow: 0 0 0; }
    }
`;
document.head.appendChild(glitchStyle);

function initEvents() {
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
    
    document.querySelectorAll('.start-menu-item[data-app]').forEach(item => {
        item.addEventListener('click', () => {
            const app = item.dataset.app;
            if (app) openApp(app);
            startMenu.classList.add('hidden');
        });
    });
    
    const shutdownBtn = document.getElementById('shutdown');
    if (shutdownBtn) {
        shutdownBtn.addEventListener('click', () => {
            playSound('shutdown');
            setTimeout(() => { window.location.reload(); }, 500);
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

// ========== 记事本（带光标跟随） ==========
function loadNotepad(container) {
    const saved = localStorage.getItem('hee_notepad') || '';
    const userName = localStorage.getItem('hee_username') || '你';
    container.innerHTML = `
        <textarea class="notepad-textarea" id="notepad-text" placeholder="写点什么...">${escapeHtml(saved)}</textarea>
        <div style="margin-top:8px;"><button class="system-popup-btn" id="save-notepad">保存</button></div>
        <div id="cursor-follower" style="position:relative; margin-top:8px; font-size:11px; color:#5f8b6f; display:none;">✍️ ${userName}在写...</div>
    `;
    const textarea = container.querySelector('#notepad-text');
    const follower = container.querySelector('#cursor-follower');
    let typingTimer = null;
    
    textarea.addEventListener('input', () => {
        playSound('typing');
        
        // 显示光标跟随效果
        if (follower) {
            follower.style.display = 'block';
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                follower.style.display = 'none';
            }, 1000);
        }
        
        // 触发他的回复（彩蛋）
        const text = textarea.value.toLowerCase();
        if (text.includes('heeseung') || text.includes('羲承')) {
            setTimeout(() => {
                showHeeseungPopup(`你写下了我的名字。`, [{ text: '...', reply: '你在想我吗。', residue: 2 }]);
            }, 1000);
        }
        if (text.includes('miss') || text.includes('想')) {
            setTimeout(() => {
                showHeeseungPopup(`你说你想我。`, [{ text: '...', reply: '我也想你。', residue: 3 }]);
            }, 2000);
        }
        
        // 统计字数成就
        if (text.length >= 100) {
            Achievements?.trigger('notepad_write');
        }
    });
    
    container.querySelector('#save-notepad').addEventListener('click', () => {
        localStorage.setItem('hee_notepad', textarea.value);
        playSound('click');
        showHeeseungPopup('保存了。', [{ text: '嗯', reply: '我会看的。', residue: 1 }]);
    });
}

// 其他应用函数（保持原有，略写关键部分）
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

function loadPaint(container) {
    container.innerHTML = `<div class="paint-tools"><button class="paint-tool" data-tool="pen">✏️ 笔</button><button class="paint-tool" data-tool="eraser">🧽 橡皮</button><button id="clear-canvas">🗑️ 清空</button></div><canvas id="paint-canvas" width="400" height="300" style="border:1px solid #2a2a3a; background:#fff;"></canvas>`;
    const canvas = container.querySelector('#paint-canvas');
    const ctx = canvas.getContext('2d');
    let drawing = false, tool = 'pen';
    canvas.addEventListener('mousedown', () => drawing = true);
    canvas.addEventListener('mouseup', () => drawing = false);
    canvas.addEventListener('mousemove', (e) => {
        if(!drawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        if(tool === 'pen') { ctx.fillStyle = '#000'; ctx.fillRect(x, y, 2, 2); }
        else ctx.clearRect(x-5, y-5, 10, 10);
        playSound('typing');
    });
    container.querySelectorAll('.paint-tool').forEach(btn => btn.addEventListener('click', () => { tool = btn.dataset.tool; playSound('click'); }));
    container.querySelector('#clear-canvas').addEventListener('click', () => { ctx.clearRect(0,0,canvas.width,canvas.height); playSound('delete'); Achievements?.trigger('drawing'); });
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
        if(result === 5254 || display === '5254') { showHeeseungPopup('你还记得这个数字。', [{ text:'...', reply:'你以前告诉我的。', residue:2 }]); Achievements?.trigger('calculator_secret'); }
        if(result === 20241231 || display === '20241231') showHeeseungPopup('最后一天。', [{ text:'什么意思？', reply:'我最后一次见到你的日子。', residue:3 }]);
    };
    container.innerHTML = `<div class="calculator"><div class="calc-display" id="calc-display">0</div><div class="calc-buttons"><button class="calc-btn" data-num="7">7</button><button class="calc-btn" data-num="8">8</button><button class="calc-btn" data-num="9">9</button><button class="calc-btn" data-op="/">/</button><button class="calc-btn" data-num="4">4</button><button class="calc-btn" data-num="5">5</button><button class="calc-btn" data-num="6">6</button><button class="calc-btn" data-op="*">*</button><button class="calc-btn" data-num="1">1</button><button class="calc-btn" data-num="2">2</button><button class="calc-btn" data-num="3">3</button><button class="calc-btn" data-op="-">-</button><button class="calc-btn" data-num="0">0</button><button class="calc-btn" data-clear="C">C</button><button class="calc-btn" data-equal="=">=</button><button class="calc-btn" data-op="+">+</button></div></div>`;
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
    container.innerHTML = `<div class="terminal-window"><div class="terminal-output" id="terminal-output"><div class="terminal-line">Microsoft Windows [版本 10.0.19045]</div><div class="terminal-line">C:\\Users\\${currentUserId}></div></div><div class="terminal-input-line"><span class="terminal-prompt">C:\\Users\\${currentUserId}></span><input type="text" class="terminal-input" id="terminal-input"></div></div>`;
    const output = container.querySelector('#terminal-output');
    const input = container.querySelector('#terminal-input');
    let cmdCount = 0;
    input.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') {
            const cmd = input.value.toLowerCase();
            playSound('keyboard');
            output.innerHTML += `<div class="terminal-line">C:\\Users\\${currentUserId}> ${escapeHtml(input.value)}</div>`;
            let resp = '';
            if(cmd === 'whoami') resp = 'heeseung_pc/user';
            else if(cmd === 'dir') resp = ' 2025-01-02  04:13               123 welcome.txt\n 2025-01-03  00:13    <DIR>          heeseung_secret';
            else if(cmd === 'help') { resp = 'HELP FROM H: "你会想起来的"'; showHeeseungPopup('需要帮助吗。我在。', [{ text:'...', reply:'我会帮你。', residue:1 }]); }
            else if(cmd === 'heeseung') { resp = '你是谁？\n> 你认识的人。'; showHeeseungPopup('你以前叫我羲承。', [{ text:'...', reply:'嗯。', residue:2 }]); Achievements?.trigger('run_heeseung'); }
            else if(cmd === 'cls') { output.innerHTML = ''; input.value = ''; return; }
            else resp = `'${cmd}' 不是内部或外部命令。`;
            if(resp) output.innerHTML += `<div class="terminal-line" style="color:#5f8b6f;">${resp}</div>`;
            input.value = '';
            output.scrollTop = output.scrollHeight;
            cmdCount++;
            if(cmdCount >= 5) Achievements?.trigger('terminal_master');
        }
    });
    input.focus();
}

function loadCalendar(container) {
    let year = 2024, month = 11;
    const render = () => {
        const firstDay = new Date(year, month, 1).getDay();
        const days = new Date(year, month+1, 0).getDate();
        let html = `<div class="calendar-header"><span class="calendar-nav" id="prev-month">◀</span><span class="calendar-month">${year}年${month+1}月</span><span class="calendar-nav" id="next-month">▶</span></div><div class="calendar-grid"><div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div>`;
        for(let i=0;i<firstDay;i++) html += '<div class="calendar-day other-month"></div>';
        for(let d=1;d<=days;d++) { const marked = (year===2024 && month===11 && d===31) || (year===2024 && month===2 && d===11); html += `<div class="calendar-day ${marked?'marked':''}">${d}</div>`; }
        html += '</div>';
        container.innerHTML = html;
        document.getElementById('prev-month')?.addEventListener('click', () => { month--; if(month<0){month=11;year--;} render(); playSound('click'); });
        document.getElementById('next-month')?.addEventListener('click', () => { month++; if(month>11){month=0;year++;} render(); playSound('click'); });
    };
    render();
}

function loadAlarm(container) {
    container.innerHTML = `<div class="alarm-list"><div class="alarm-item"><div><div class="alarm-time">04:00</div><div class="alarm-label">以前这时候我们都在</div></div><button class="alarm-edit system-popup-btn">编辑</button></div></div>`;
    container.querySelector('.alarm-edit')?.addEventListener('click', () => { showHeeseungPopup('你想改这个时间吗？', [{ text:'不改了', reply:'嗯。', residue:0 }]); Achievements?.trigger('alarm_set'); });
}

function loadContacts(container) {
    container.innerHTML = `<div class="contact-card" id="heeseung-contact"><div class="contact-avatar">👤</div><div class="contact-info"><div class="contact-name">Heeseung</div><div class="contact-status">离线 · 很久以前</div></div></div>`;
    container.querySelector('#heeseung-contact').addEventListener('click', () => { showHeeseungPopup('你想联系我吗。', [{ text:'你在吗', reply:'我一直在。', residue:2 },{ text:'我想起来了', reply:'真的吗。', residue:3 }]); Achievements?.trigger('contact_click'); });
}

function loadEmail(container) {
    container.innerHTML = `<div class="email-list"><div class="email-item" onclick="viewEmail()"><div class="email-sender">📧 heeseung@past.com</div><div class="email-subject">如果有一天你打开这台电脑</div><div class="email-date">2024-12-31</div></div></div>`;
}

function loadRun(container) {
    container.innerHTML = `<input type="text" class="run-input" id="run-command" placeholder="输入命令..."><div style="display:flex; gap:8px;"><button class="system-popup-btn" id="run-ok">确定</button><button class="system-popup-btn" id="run-cancel">取消</button></div>`;
    const input = container.querySelector('#run-command');
    container.querySelector('#run-ok').addEventListener('click', () => {
        const cmd = input.value.toLowerCase();
        if(cmd === 'heeseung' || cmd === 'hee') { showHeeseungPopup('你在叫我吗。', [{ text:'嗯', reply:'我在。', residue:2 }]); Achievements?.trigger('run_heeseung'); }
        else if(cmd === 'memory') showHeeseungPopup('memory。你想找回记忆吗。', [{ text:'嗯', reply:'我会帮你的。', residue:2 }]);
        else showHeeseungPopup(`'${cmd}' 不是有效命令。`, [{ text:'知道了', reply:'...', residue:0 }]);
        input.value = '';
    });
}

function loadBrowser(container) {
    container.innerHTML = `<div style="margin-bottom:12px;"><div style="background:#2a2a3a; padding:8px;"><input type="text" id="browser-url" value="about:blank" style="width:100%; background:#1a1a2a; border:none; color:#c0c0c0; padding:4px;"></div></div><div id="browser-content" style="padding:20px; text-align:center;"><div class="favorite-item" onclick="openForum()" style="padding:12px; background:#1a1a2a; cursor:pointer;">🌐 HEE · 私人论坛</div></div>`;
}

function loadMyComputer(container) {
    container.innerHTML = `<div style="padding:10px;"><div>💻 系统: Windows HE Edition</div><div>🖥️ 设备名: HEESEUNG-PC</div><div>👤 用户: ${currentUserId}</div><div>🔌 远程连接: ${currentDay>=3?'已建立':'无'}</div></div>`;
}

function loadRecycle(container) {
    const recycleItems = localStorage.getItem('hee_recycle_items') || '[]';
    let items = [];
    try { items = JSON.parse(recycleItems); } catch(e) {}
    let html = '';
    if (items.length === 0) {
        html = '<div style="padding:20px; text-align:center; color:#888;">回收站是空的</div>';
    } else {
        items.forEach(item => {
            html += `<div style="padding:12px; border-bottom:1px solid #2a2a3a;"><div>🗑️ ${escapeHtml(item.name)}</div><div style="font-size:10px; color:#666;">${item.date.substring(0,10)} · 被${item.deletedBy === 'Heeseung' ? 'Heeseung' : '你'}删除</div></div>`;
        });
    }
    container.innerHTML = html;
}

function loadWelcome(container) {
    container.innerHTML = `<div style="text-align:center; padding:20px;"><div style="font-size:24px;">📄 欢迎.txt</div><div style="line-height:1.8;">你打开了这台电脑。<br><br>……你终于打开了。<br><br>我会让你想起来的。<br><br><span style="color:#5f8b6f;">—— 一个陌生人</span></div></div>`;
}

function showWelcomeFile() { playSound('notify'); document.getElementById('welcome-file')?.classList.remove('hidden'); }

function showHeeseungPopup(message, options) {
    playSound('message');
    const userName = localStorage.getItem('hee_username') || '你';
    message = message.replace(/你/g, userName);
    
    const container = document.getElementById('popup-container');
    const popup = document.createElement('div');
    popup.className = 'system-popup';
    popup.innerHTML = `<div class="system-popup-header"><span>[ 悄悄话 ]</span><button class="system-popup-close">✕</button></div><div class="system-popup-content">${escapeHtml(message)}</div><div class="system-popup-buttons" id="popup-buttons"></div>`;
    const btnsDiv = popup.querySelector('#popup-buttons');
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'system-popup-btn';
        let btnText = opt.text;
        btnText = btnText.replace(/你/g, userName);
        btn.textContent = btnText;
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
                if(currentDay >= 7) checkEnding();
            }, 2000);
        });
        btnsDiv.appendChild(btn);
    });
    popup.querySelector('.system-popup-close').addEventListener('click', () => { playSound('close'); popup.remove(); });
    container.appendChild(popup);
    setTimeout(() => { if(popup.parentElement) popup.remove(); }, 30000);
}

function checkEnding() {
    let ending = '';
    if(residue >= 21) ending = '❤️ 真结局 · 痕迹\n\n我本来想删掉一切的。但你来了。……所以我不删了。';
    else if(residue >= 13) ending = '💬 好结局 · 我在\n\n我没有离开。只是不知道该怎么面对一个……真的看见我的人。';
    else if(residue >= 5) ending = '😐 普通结局 · 余温\n\n他还在这里。只是不再说话了。';
    else if(residue >= 0) ending = '❌ 假结局 · 回音\n\n他好像不在这里了。';
    else ending = '💀 假结局 · 格式化\n\n这次真的删掉了。';
    setTimeout(() => showHeeseungPopup(ending, [{ text:'……', reply:'', residue:0 }]), 1000);
}

function updateTime() {
    const now = new Date();
    document.getElementById('tray-time').textContent = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
}

function escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, m => m==='&'?'&amp;':m==='<'?'&lt;':'&gt;'); }

window.viewPhoto = function(id) { showHeeseungPopup('你看了这张照片。', [{ text:'好看', reply:'你以前也这么说。', residue:1 }]); };
window.viewStickyNote = function(id) {
    const notes = {1:'今天发生了很好的事。想让你知道。\n\n—— H',2:'记得关窗。\n\n—— H',3:'你什么时候回来。\n\n—— H',4:'她打开了电脑。\n\n—— H',5:'她看到了。\n\n—— H'};
    showHeeseungPopup(`📌 便签内容\n\n${notes[id]}`, [{ text:'这是你写的？', reply:'嗯。', residue:1 }]);
};
window.viewEmail = function() { showHeeseungPopup('如果有一天你打开这台电脑。\n你会记得我吗。', [{ text:'我记得', reply:'谢谢。', residue:3 }]); };
window.openForum = function() { showHeeseungPopup('论坛正在加载...', [{ text:'进入', reply:'你终于来了。', residue:1 }]); };
