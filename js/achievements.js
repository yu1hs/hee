/* achievements.js - 成就系统 */

const Achievements = {
    data: {
        'first_boot': { name: '🔌 初次开机', desc: '第一次打开这台电脑', unlocked: false, secret: false, dayUnlock: 1 },
        'first_reply': { name: '💬 第一次对话', desc: '回复了羲承的第一条消息', unlocked: false, secret: false, dayUnlock: 1 },
        'day2': { name: '📅 第二天', desc: '连续两天登录', unlocked: false, secret: false, dayUnlock: 2 },
        'diary_reader': { name: '📓 日记读者', desc: '阅读了5篇日记', unlocked: false, secret: false, dayUnlock: 3 },
        'photo_watcher': { name: '🖼️ 照片观察者', desc: '发现了照片会变化', unlocked: false, secret: false, dayUnlock: 4 },
        'midnight_oil': { name: '🌙 夜猫子', desc: '在凌晨时段登录', unlocked: false, secret: false, dayUnlock: 5 },
        'residue_10': { name: '📈 残响·萌芽', desc: '残响值达到10', unlocked: false, secret: false, dayUnlock: 3 },
        'residue_20': { name: '📈 残响·生长', desc: '残响值达到20', unlocked: false, secret: false, dayUnlock: 5 },
        'residue_30': { name: '📈 残响·满溢', desc: '残响值达到30', unlocked: false, secret: true, dayUnlock: 7 },
        'all_photos': { name: '📸 记忆收集者', desc: '查看过所有照片', unlocked: false, secret: false, dayUnlock: 5 },
        'all_stickynotes': { name: '📌 便签收藏家', desc: '阅读了所有便签', unlocked: false, secret: false, dayUnlock: 6 },
        'secret_folder': { name: '🔓 陌生的文件夹', desc: '发现了隐藏文件夹', unlocked: false, secret: true, dayUnlock: 7 },
        'calculator_secret': { name: '🔢 数字的秘密', desc: '在计算器中输入了特殊数字', unlocked: false, secret: true, dayUnlock: 4 },
        'terminal_master': { name: '⌨️ 终端黑客', desc: '在终端输入了5个不同命令', unlocked: false, secret: false, dayUnlock: 5 },
        'email_reader': { name: '📧 过去的邮件', desc: '阅读了所有邮件', unlocked: false, secret: false, dayUnlock: 6 },
        'drawing': { name: '🎨 画家', desc: '在画图中画了一幅画', unlocked: false, secret: false, dayUnlock: 4 },
        'notepad_writer': { name: '✍️ 记事本作者', desc: '在记事本中写了100字以上', unlocked: false, secret: false, dayUnlock: 3 },
        'alarm_setter': { name: '⏰ 闹钟', desc: '尝试修改闹钟时间', unlocked: false, secret: false, dayUnlock: 5 },
        'contact_click': { name: '👤 联系人', desc: '点击了通讯录里的Heeseung', unlocked: false, secret: false, dayUnlock: 4 },
        'run_heeseung': { name: '⚙️ 运行', desc: '在运行中输入了"heeseung"', unlocked: false, secret: true, dayUnlock: 5 },
        'true_ending': { name: '❤️ 真结局', desc: '达成真结局「痕迹」', unlocked: false, secret: false, dayUnlock: 7 },
        'good_ending': { name: '💬 好结局', desc: '达成好结局「我在」', unlocked: false, secret: false, dayUnlock: 7 },
        'normal_ending': { name: '😐 普通结局', desc: '达成普通结局「余温」', unlocked: false, secret: false, dayUnlock: 7 },
        'secret_ending': { name: '🌑 隐藏结局', desc: '达成隐藏结局「藏在硬盘里」', unlocked: false, secret: true, dayUnlock: 7 },
        'all_endings': { name: '🏆 结局收藏家', desc: '达成所有结局', unlocked: false, secret: true, dayUnlock: 7 },
        'week_complete': { name: '📆 七天', desc: '连续七天登录', unlocked: false, secret: false, dayUnlock: 7 },
        'no_reply': { name: '🤐 沉默的玩家', desc: '连续三次选择沉默', unlocked: false, secret: true, dayUnlock: 3 },
        'fast_reader': { name: '⚡ 速读者', desc: '一天内阅读了5个板块', unlocked: false, secret: false, dayUnlock: 4 }
    },
    
    unlockedAchievements: [],
    popupQueue: [],
    showingPopup: false,
    
    init() {
        const saved = localStorage.getItem('hee_achievements');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.unlockedAchievements = parsed;
                parsed.forEach(id => {
                    if (this.data[id]) this.data[id].unlocked = true;
                });
            } catch(e) {}
        }
        this.createUI();
    },
    
    createUI() {
        if (document.getElementById('achievements-panel')) return;
        
        const panel = document.createElement('div');
        panel.id = 'achievements-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 50px;
            left: 10px;
            width: 280px;
            background: rgba(0,0,0,0.9);
            border: 1px solid #5f8b6f;
            border-radius: 8px;
            z-index: 1000;
            display: none;
            flex-direction: column;
            max-height: 400px;
            overflow-y: auto;
            font-size: 11px;
        `;
        panel.innerHTML = `<div style="padding:10px; border-bottom:1px solid #3a5a4a; font-weight:bold;">🏆 成就</div><div id="achievements-list" style="padding:10px;"></div>`;
        document.body.appendChild(panel);
        
        // 添加成就按钮到任务栏
        const addBtn = () => {
            const tray = document.querySelector('.system-tray');
            if (tray && !document.querySelector('.achievements-btn')) {
                const btn = document.createElement('span');
                btn.className = 'tray-icon achievements-btn';
                btn.textContent = '🏆';
                btn.title = '成就';
                btn.style.cursor = 'pointer';
                btn.addEventListener('click', () => {
                    const isVisible = panel.style.display === 'flex';
                    panel.style.display = isVisible ? 'none' : 'flex';
                    this.refreshList();
                });
                tray.insertBefore(btn, tray.firstChild);
            } else {
                setTimeout(addBtn, 500);
            }
        };
        addBtn();
    },
    
    refreshList() {
        const list = document.getElementById('achievements-list');
        if (!list) return;
        list.innerHTML = '';
        for (const [id, ach] of Object.entries(this.data)) {
            const div = document.createElement('div');
            div.style.cssText = `
                padding: 6px 0;
                border-bottom: 1px solid #1a1a2a;
                opacity: ${ach.unlocked ? 1 : 0.4};
                filter: ${ach.unlocked ? 'none' : 'grayscale(0.5)'};
            `;
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between;">
                    <span>${ach.name}</span>
                    <span style="color:#5f8b6f;">${ach.unlocked ? '✓' : '🔒'}</span>
                </div>
                <div style="font-size:9px; color:#888;">${ach.desc}</div>
            `;
            list.appendChild(div);
        }
    },
    
    unlock(achievementId, silent = false) {
        const ach = this.data[achievementId];
        if (!ach || ach.unlocked) return false;
        
        ach.unlocked = true;
        this.unlockedAchievements.push(achievementId);
        localStorage.setItem('hee_achievements', JSON.stringify(this.unlockedAchievements));
        
        if (!silent) {
            this.showPopup(ach.name, ach.desc);
        }
        
        // 播放音效
        playSound('notify');
        
        // 检查所有结局成就
        this.checkAllEndings();
        
        return true;
    },
    
    showPopup(name, desc) {
        const container = document.getElementById('popup-container');
        if (!container) return;
        
        const popup = document.createElement('div');
        popup.className = 'system-popup';
        popup.style.bottom = '150px';
        popup.style.right = '20px';
        popup.style.background = '#1a1a2a';
        popup.style.borderColor = '#5f8b6f';
        popup.innerHTML = `
            <div class="system-popup-header" style="background:#2a2a3a;">
                <span>🏆 成就解锁</span>
                <button class="system-popup-close">✕</button>
            </div>
            <div class="system-popup-content" style="text-align:center;">
                <div style="font-size:16px; margin-bottom:8px;">${name}</div>
                <div style="font-size:11px; color:#888;">${desc}</div>
            </div>
        `;
        
        popup.querySelector('.system-popup-close').addEventListener('click', () => {
            playSound('close');
            popup.remove();
        });
        
        container.appendChild(popup);
        
        setTimeout(() => {
            if (popup.parentElement) popup.remove();
        }, 4000);
    },
    
    checkAllEndings() {
        const endings = ['true_ending', 'good_ending', 'normal_ending', 'secret_ending'];
        const allUnlocked = endings.every(e => this.data[e]?.unlocked);
        if (allUnlocked && !this.data.all_endings?.unlocked) {
            this.unlock('all_endings', true);
        }
    },
    
    checkResidue(residue) {
        if (residue >= 10 && !this.data.residue_10?.unlocked) this.unlock('residue_10');
        if (residue >= 20 && !this.data.residue_20?.unlocked) this.unlock('residue_20');
        if (residue >= 30 && !this.data.residue_30?.unlocked) this.unlock('residue_30');
    },
    
    checkDay(day) {
        if (day >= 2 && !this.data.day2?.unlocked) this.unlock('day2');
        if (day >= 7 && !this.data.week_complete?.unlocked) {
            const loginDays = parseInt(localStorage.getItem('hee_login_days') || '1');
            if (loginDays >= 7) this.unlock('week_complete');
        }
    },
    
    incrementLoginDays() {
        let days = parseInt(localStorage.getItem('hee_login_days') || '0');
        days++;
        localStorage.setItem('hee_login_days', days);
        if (days >= 7) this.unlock('week_complete');
    },
    
    // 成就触发点（供其他模块调用）
    trigger(event, data = null) {
        switch(event) {
            case 'first_boot': this.unlock('first_boot'); break;
            case 'first_reply': this.unlock('first_reply'); break;
            case 'diary_read': 
                const diaryCount = parseInt(localStorage.getItem('hee_diary_count') || '0') + 1;
                localStorage.setItem('hee_diary_count', diaryCount);
                if (diaryCount >= 5) this.unlock('diary_reader');
                break;
            case 'photo_view':
                const photoCount = parseInt(localStorage.getItem('hee_photo_count') || '0') + 1;
                localStorage.setItem('hee_photo_count', photoCount);
                if (photoCount >= 8) this.unlock('all_photos');
                break;
            case 'sticky_read':
                const stickyCount = parseInt(localStorage.getItem('hee_sticky_count') || '0') + 1;
                localStorage.setItem('hee_sticky_count', stickyCount);
                if (stickyCount >= 7) this.unlock('all_stickynotes');
                break;
            case 'email_read':
                const emailCount = parseInt(localStorage.getItem('hee_email_count') || '0') + 1;
                localStorage.setItem('hee_email_count', emailCount);
                if (emailCount >= 6) this.unlock('email_reader');
                break;
            case 'terminal_cmd':
                const cmdCount = parseInt(localStorage.getItem('hee_cmd_count') || '0') + 1;
                localStorage.setItem('hee_cmd_count', cmdCount);
                if (cmdCount >= 5) this.unlock('terminal_master');
                break;
            case 'calculator_secret': this.unlock('calculator_secret'); break;
            case 'secret_folder': this.unlock('secret_folder'); break;
            case 'drawing': this.unlock('drawing'); break;
            case 'notepad_write':
                const writeCount = parseInt(localStorage.getItem('hee_notepad_count') || '0') + 1;
                localStorage.setItem('hee_notepad_count', writeCount);
                if (writeCount >= 100) this.unlock('notepad_writer');
                break;
            case 'alarm_set': this.unlock('alarm_setter'); break;
            case 'contact_click': this.unlock('contact_click'); break;
            case 'run_heeseung': this.unlock('run_heeseung'); break;
            case 'photo_change': this.unlock('photo_watcher'); break;
            case 'midnight': this.unlock('midnight_oil'); break;
            case 'secret_ending': this.unlock('secret_ending'); break;
            case 'true_ending': this.unlock('true_ending'); break;
            case 'good_ending': this.unlock('good_ending'); break;
            case 'normal_ending': this.unlock('normal_ending'); break;
            case 'no_reply': this.unlock('no_reply'); break;
        }
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    Achievements.init();
});

window.Achievements = Achievements;
