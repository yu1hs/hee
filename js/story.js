/* story.js - 剧情推进系统 */
// 管理7天剧情、对话、残响值变化

// ========== 剧情状态 ==========
let storyDay = parseInt(localStorage.getItem('hee_day') || '1');
let storyResidue = parseInt(localStorage.getItem('hee_residue') || '0');
let currentConversation = null;
let conversationHistory = [];
let todayReplies = 0;
let lastMessageTime = 0;
let waitingForReply = false;

// ========== 7天对话数据 ==========
const dayDialogues = {
    1: {
        title: "闯入",
        firstMessage: "……你怎么进来的。这个论坛不应该被找到。",
        options: [
            { text: "误入的，不知道这是什么地方", reply: "误入……这个论坛不应该被找到的。", residue: 2 },
            { text: "偶然点进来的", reply: "没有偶然。", residue: 0 },
            { text: "沉默", reply: "……不回答也行。我习惯了。", residue: -1 }
        ],
        followUps: [
            { 
                triggerResidue: 3, 
                message: "你还在看。",
                options: [
                    { text: "不可以吗", reply: "没有。只是没人待过这么久。", residue: 2 },
                    { text: "你希望我走吗", reply: "……我可以说希望。但你也不会真的走吧。", residue: 1 },
                    { text: "这里很安静，我喜欢", reply: "嗯。我也是因为这个才留着的。", residue: 2 }
                ]
            }
        ]
    },
    2: {
        title: "试探",
        firstMessage: "你又来了。第二天了。我数过。",
        options: [
            { text: "你在等我吗", reply: "……没有。只是记得时间。", residue: 1 },
            { text: "你一直在数吗", reply: "嗯。没什么事做。所以会数。", residue: 1 },
            { text: "我不能来吗", reply: "没有说不能。只是不理解。", residue: 0 }
        ],
        followUps: [
            {
                triggerResidue: 5,
                message: "你真的还在。我以为你会消失。",
                options: [
                    { text: "我不会消失的", reply: "……不要随便说这种话。你又不确定。", residue: 2 },
                    { text: "你希望我消失吗", reply: "我习惯了别人消失。", residue: 0 }
                ]
            }
        ]
    },
    3: {
        title: "帖子",
        firstMessage: "你看了那些帖子。我写的。写了又删。留下来的不多。",
        options: [
            { text: "你写了很多", reply: "多吗。我觉得不够。", residue: 1 },
            { text: "为什么删掉", reply: "不想被人看到。但又不想完全消失。", residue: 2 },
            { text: "写得很好", reply: "第一次有人这么说。谢谢。", residue: 1 }
        ],
        followUps: [
            {
                triggerResidue: 8,
                message: "你为什么这么有耐心。这个论坛什么都没有。只有我的废话。",
                options: [
                    { text: "因为是你写的", reply: "你又不认识我。为什么要读。", residue: 2 },
                    { text: "因为这里很安静", reply: "我也喜欢安静。所以留在这里。", residue: 1 }
                ]
            }
        ]
    },
    4: {
        title: "照片",
        firstMessage: "你翻过图廊了。那些照片……有些我自己都不记得了。",
        options: [
            { text: "照片会变", reply: "你也看到了吗。我以为是我看错了。", residue: 3 },
            { text: "拍得不错", reply: "是吗。第一次有人这么说。", residue: 1 },
            { text: "有点模糊", reply: "嗯。拍的时候手在抖。", residue: 0 }
        ],
        followUps: [
            {
                triggerResidue: 11,
                message: "你说照片会变……我昨晚又看了一下。真的变了。",
                options: [
                    { text: "不是我", reply: "那到底是谁。还是说……我的记忆出问题了。", residue: 2 },
                    { text: "也许是论坛自己在变", reply: "这个论坛好像有自己的意志。你来了之后它活过来了。", residue: 3 }
                ]
            }
        ]
    },
    5: {
        title: "凌晨",
        firstMessage: "你也在凌晨来过。我看到了。时间戳不会说谎。",
        options: [
            { text: "你也睡不着吗", reply: "经常。凌晨比较安静。这时候世界是我的。", residue: 2 },
            { text: "在想什么", reply: "想很多。但说出来就没了。", residue: 1 },
            { text: "想来看看你", reply: "……不要说这种话。会变得不想让你走。", residue: 3 }
        ],
        followUps: [
            {
                triggerResidue: 14,
                message: "凌晨的时候……我会想很多事。以前的事。后悔的事。……还有一些人。",
                options: [
                    { text: "什么样的人", reply: "离开了的人。不想说了。", residue: 1 },
                    { text: "后悔什么", reply: "没说出口的话。没做的事。没挽留的人。", residue: 2 }
                ]
            }
        ]
    },
    6: {
        title: "关于你",
        firstMessage: "我数了一下。你来了六天了。我从来没有让一个人留这么久。",
        options: [
            { text: "你会记得我吗", reply: "会。你会忘了我吗。", residue: 2 },
            { text: "你得到了什么", reply: "得到了一个……看到我的人。", residue: 2 },
            { text: "你有什么想对我说的", reply: "谢谢。不是谢谢你来。是谢谢你没走。", residue: 3 }
        ],
        followUps: [
            {
                triggerResidue: 18,
                message: "我一直在想……你为什么还在。这里什么都没有。只有我。",
                options: [
                    { text: "这样就够了", reply: "真的吗。你觉得我……就够了？", residue: 3 },
                    { text: "你值得被看到", reply: "没有人说过这种话。我值得吗。", residue: 2 }
                ]
            }
        ]
    },
    7: {
        title: "最后",
        firstMessage: "第七天了。可能是最后一个晚上了。",
        options: [
            { text: "不要消失，留在这里", reply: "……你希望我留下吗。", residue: 3, isEnding: true },
            { text: "不管你去哪里，我会记得你", reply: "记得……这个词很重。你真的能做到吗。", residue: 2, isEnding: true },
            { text: "我尊重你的选择", reply: "谢谢你。那我再想想。", residue: 1, isEnding: true }
        ],
        followUps: []
    }
};

// ========== 初始化剧情 ==========
function initStory() {
    // 更新显示
    updateStoryUI();
    
    // 检查是否新的一天
    checkNewDay();
    
    // 监听凌晨时段
    checkMidnight();
    setInterval(checkMidnight, 60000);
    
    // 监听不活跃
    startInactivityCheck();
}

// 更新UI显示
function updateStoryUI() {
    let display = document.getElementById('story-day-display');
    if (!display) {
        display = document.createElement('div');
        display.id = 'story-day-display';
        display.style.cssText = 'position:fixed; bottom:45px; left:10px; font-size:10px; color:#5f8b6f; z-index:99; background:rgba(0,0,0,0.7); padding:2px 8px; border-radius:4px;';
        document.body.appendChild(display);
    }
    display.textContent = `第${storyDay}/7天 · 残响:${storyResidue}`;
}

// 检查新的一天
function checkNewDay() {
    const lastDate = localStorage.getItem('hee_last_story_date');
    const today = new Date().toDateString();
    
    if (lastDate !== today && storyDay < 7) {
        // 新的一天，推进剧情
        storyDay++;
        localStorage.setItem('hee_day', storyDay);
        localStorage.setItem('hee_last_story_date', today);
        updateStoryUI();
        
        // 发送新一天的第一条消息
        if (storyDay <= 7 && dayDialogues[storyDay]) {
            setTimeout(() => {
                triggerNewDayMessage();
            }, 3000);
        }
    }
}

// 触发新一天的消息
function triggerNewDayMessage() {
    const dialogue = dayDialogues[storyDay];
    if (!dialogue) return;
    
    // 只有当他还没发过今天的消息时才发送
    const todayMessageSent = localStorage.getItem(`hee_day${storyDay}_sent`);
    if (!todayMessageSent) {
        showStoryMessage(dialogue.firstMessage, dialogue.options);
        localStorage.setItem(`hee_day${storyDay}_sent`, 'true');
        todayReplies = 0;
    }
}

// 显示剧情消息
function showStoryMessage(message, options) {
    playSound('message');
    
    const container = document.getElementById('popup-container');
    if (!container) return;
    
    const popup = document.createElement('div');
    popup.className = 'system-popup';
    popup.innerHTML = `
        <div class="system-popup-header">
            <span>[ Heeseung · 第${storyDay}天 ]</span>
            <button class="system-popup-close">✕</button>
        </div>
        <div class="system-popup-content">
            ${escapeHtml(message)}
        </div>
        <div class="system-popup-buttons" id="story-popup-buttons">
        </div>
    `;
    
    const buttonsDiv = popup.querySelector('#story-popup-buttons');
    options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'system-popup-btn';
        btn.textContent = opt.text;
        btn.addEventListener('click', () => {
            playSound('click');
            handleStoryReply(opt, popup);
        });
        buttonsDiv.appendChild(btn);
    });
    
    popup.querySelector('.system-popup-close').addEventListener('click', () => {
        playSound('close');
        popup.remove();
    });
    
    container.appendChild(popup);
    
    // 记录历史
    conversationHistory.push({ day: storyDay, message: message, isHeeseung: true });
}

// 处理回复
function handleStoryReply(option, popup) {
    // 移除弹窗
    popup.remove();
    
    // 记录用户回复
    conversationHistory.push({ day: storyDay, message: option.text, isHeeseung: false });
    
    // 更新残响值
    storyResidue = Math.max(-10, Math.min(30, storyResidue + (option.residue || 0)));
    localStorage.setItem('hee_residue', storyResidue);
    updateStoryUI();
    
    // 显示他的回复
    setTimeout(() => {
        const container = document.getElementById('popup-container');
        if (!container) return;
        
        const replyPopup = document.createElement('div');
        replyPopup.className = 'system-popup';
        replyPopup.style.bottom = '100px';
        replyPopup.innerHTML = `
            <div class="system-popup-header">
                <span>[ Heeseung ]</span>
                <button class="system-popup-close">✕</button>
            </div>
            <div class="system-popup-content">
                ${escapeHtml(option.reply)}
            </div>
        `;
        
        replyPopup.querySelector('.system-popup-close').addEventListener('click', () => {
            playSound('close');
            replyPopup.remove();
        });
        
        container.appendChild(replyPopup);
        
        // 自动移除
        setTimeout(() => {
            if (replyPopup.parentElement) replyPopup.remove();
        }, 8000);
        
        todayReplies++;
        
        // 检查后续对话
        const dialogue = dayDialogues[storyDay];
        if (dialogue && dialogue.followUps) {
            for (let follow of dialogue.followUps) {
                if (storyResidue >= follow.triggerResidue) {
                    const followKey = `hee_day${storyDay}_follow_${follow.triggerResidue}`;
                    if (!localStorage.getItem(followKey)) {
                        localStorage.setItem(followKey, 'true');
                        setTimeout(() => {
                            showStoryMessage(follow.message, follow.options);
                        }, 5000);
                    }
                    break;
                }
            }
        }
        
        // 检查结局
        if (option.isEnding || storyDay >= 7) {
            setTimeout(() => {
                checkStoryEnding();
            }, 3000);
        }
        
        // 检查是否推进天数
        if (todayReplies >= 2 && storyDay < 7) {
            const lastReplyDate = localStorage.getItem('hee_last_reply_date');
            const today = new Date().toDateString();
            if (lastReplyDate !== today) {
                localStorage.setItem('hee_last_reply_date', today);
                // 将在明天新的一天推进
            }
        }
    }, 2000);
}

// 结局判定
function checkStoryEnding() {
    let ending = '';
    let endingMessage = '';
    
    if (storyResidue >= 21) {
        ending = '❤️ 真结局 · 痕迹';
        endingMessage = '我本来想删掉一切的。但你来了。……所以我不删了。\n\n一个月后的凌晨4:00，电脑自己开机了。桌面出现一张新照片——他笑着看你。文件名：「我还在」。';
    } else if (storyResidue >= 13) {
        ending = '💬 好结局 · 我在';
        endingMessage = '我没有离开。只是不知道该怎么面对一个……真的看见我的人。\n\n桌面出现新文件：「我还在。等你。」日记本最后一页：「她会回来的。」';
    } else if (storyResidue >= 5) {
        ending = '😐 普通结局 · 余温';
        endingMessage = '他还在这里。只是不再说话了。\n\n回收站里有一行字：「谢谢你记得一部分的我。」';
    } else if (storyResidue >= 0) {
        ending = '❌ 假结局 · 回音';
        endingMessage = '他好像不在这里了。\n\n所有文件变成灰色。重启后电脑变成全新。但你总觉得……桌面上好像少了什么。';
    } else {
        ending = '💀 假结局 · 格式化';
        endingMessage = '这次真的删掉了。\n\n蓝屏。错误代码：MEMORY_NOT_FOUND。重启后桌面出现一行字：「这次真的删掉了。」所有痕迹消失。';
    }
    
    localStorage.setItem('hee_ending', ending);
    
    setTimeout(() => {
        const container = document.getElementById('popup-container');
        if (!container) return;
        
        const endingPopup = document.createElement('div');
        endingPopup.className = 'system-popup';
        endingPopup.style.top = '50%';
        endingPopup.style.bottom = 'auto';
        endingPopup.style.transform = 'translateY(-50%)';
        endingPopup.innerHTML = `
            <div class="system-popup-header">
                <span>[ 结局 ]</span>
                <button class="system-popup-close">✕</button>
            </div>
            <div class="system-popup-content" style="text-align:center;">
                <div style="font-size:18px; margin-bottom:16px;">${ending}</div>
                <div style="line-height:1.6;">${escapeHtml(endingMessage)}</div>
            </div>
        `;
        
        endingPopup.querySelector('.system-popup-close').addEventListener('click', () => {
            playSound('close');
            endingPopup.remove();
        });
        
        container.appendChild(endingPopup);
    }, 1000);
}

// 检查凌晨时段
function checkMidnight() {
    const hour = new Date().getHours();
    const isMidnight = hour >= 0 && hour < 5;
    
    if (isMidnight && storyDay >= 3 && storyDay <= 6) {
        const midnightTriggered = localStorage.getItem('hee_midnight_triggered');
        if (!midnightTriggered && storyResidue < 20) {
            localStorage.setItem('hee_midnight_triggered', 'true');
            setTimeout(() => {
                const container = document.getElementById('popup-container');
                if (!container) return;
                
                const midnightPopup = document.createElement('div');
                midnightPopup.className = 'system-popup';
                midnightPopup.innerHTML = `
                    <div class="system-popup-header">
                        <span>[ 凌晨 ]</span>
                        <button class="system-popup-close">✕</button>
                    </div>
                    <div class="system-popup-content">
                        你也不用睡的吗。我也是。凌晨的时候，比较容易说真话。
                    </div>
                `;
                midnightPopup.querySelector('.system-popup-close').addEventListener('click', () => {
                    playSound('close');
                    midnightPopup.remove();
                });
                container.appendChild(midnightPopup);
                
                // 增加残响值
                storyResidue = Math.min(30, storyResidue + 1);
                localStorage.setItem('hee_residue', storyResidue);
                updateStoryUI();
            }, 1000);
        }
    }
}

// 不活跃检查（长时间没操作，他会主动说话）
let inactivityTimer = null;
let lastActivity = Date.now();

function startInactivityCheck() {
    // 监听用户活动
    document.addEventListener('mousemove', resetInactivity);
    document.addEventListener('click', resetInactivity);
    document.addEventListener('keydown', resetInactivity);
    
    // 每30秒检查一次
    setInterval(() => {
        const inactiveTime = (Date.now() - lastActivity) / 1000;
        if (inactiveTime > 120 && storyDay >= 2 && storyDay <= 6) {
            const inactivityTriggered = localStorage.getItem('hee_inactivity_triggered');
            if (!inactivityTriggered) {
                localStorage.setItem('hee_inactivity_triggered', 'true');
                setTimeout(() => {
                    const container = document.getElementById('popup-container');
                    if (!container) return;
                    
                    const inactivePopup = document.createElement('div');
                    inactivePopup.className = 'system-popup';
                    inactivePopup.innerHTML = `
                        <div class="system-popup-header">
                            <span>[ Heeseung ]</span>
                            <button class="system-popup-close">✕</button>
                        </div>
                        <div class="system-popup-content">
                            ……还在吗。
                        </div>
                    `;
                    inactivePopup.querySelector('.system-popup-close').addEventListener('click', () => {
                        playSound('close');
                        inactivePopup.remove();
                    });
                    container.appendChild(inactivePopup);
                }, 1000);
            }
        }
    }, 30000);
}

function resetInactivity() {
    lastActivity = Date.now();
    localStorage.removeItem('hee_inactivity_triggered');
}

// 手动触发剧情（用于测试或调试）
function triggerStoryDay(day) {
    if (day >= 1 && day <= 7) {
        storyDay = day;
        localStorage.setItem('hee_day', day);
        updateStoryUI();
        triggerNewDayMessage();
    }
}

// 获取残响值
function getResidue() {
    return storyResidue;
}

// 增加残响值
function addResidue(amount) {
    storyResidue = Math.max(-10, Math.min(30, storyResidue + amount));
    localStorage.setItem('hee_residue', storyResidue);
    updateStoryUI();
    return storyResidue;
}

// ========== 导出全局函数 ==========
window.initStory = initStory;
window.triggerStoryDay = triggerStoryDay;
window.getResidue = getResidue;
window.addResidue = addResidue;
window.checkStoryEnding = checkStoryEnding;

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStory);
} else {
    initStory();
}
