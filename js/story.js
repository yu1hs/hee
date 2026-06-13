/* story.js - 剧情推进系统（简化独立版） */

let storyDay = parseInt(localStorage.getItem('hee_day') || '1');
let storyResidue = parseInt(localStorage.getItem('hee_residue') || '0');
let storyInitialized = false;

console.log('Story loaded, day:', storyDay, 'residue:', storyResidue);

// 天数推进函数（每天调用一次）
function advanceDay() {
    let currentDay = parseInt(localStorage.getItem('hee_day') || '1');
    if (currentDay < 7) {
        let newDay = currentDay + 1;
        localStorage.setItem('hee_day', newDay);
        storyDay = newDay;
        console.log('天数推进到第', newDay, '天');
        
        // 更新显示
        let display = document.getElementById('story-day-display');
        if (display) display.textContent = `第${storyDay}/7天 · 残响:${storyResidue}`;
        
        // 触发新一天的消息
        setTimeout(() => {
            showDayMessage(newDay);
        }, 2000);
    }
}

// 根据天数显示消息
function showDayMessage(day) {
    const messages = {
        1: { text: '……你怎么进来的。这个论坛不应该被找到。', options: [
            { text: '误入的', reply: '误入……这个论坛不应该被找到的。', residue: 2 },
            { text: '偶然', reply: '没有偶然。', residue: 0 },
            { text: '沉默', reply: '……不回答也行。', residue: -1 }
        ]},
        2: { text: '你又来了。第二天了。我数过。', options: [
            { text: '你在等我吗', reply: '……没有。只是记得时间。', residue: 1 },
            { text: '你一直在数吗', reply: '嗯。没什么事做。', residue: 1 },
            { text: '我不能来吗', reply: '没有说不能。', residue: 0 }
        ]},
        3: { text: '你看了那些帖子。我写的。写了又删。', options: [
            { text: '你写了很多', reply: '多吗。我觉得不够。', residue: 1 },
            { text: '为什么删掉', reply: '不想被人看到。但又不想完全消失。', residue: 2 },
            { text: '写得很好', reply: '第一次有人这么说。谢谢。', residue: 1 }
        ]},
        4: { text: '你翻过图廊了。那些照片……有些我自己都不记得了。', options: [
            { text: '照片会变', reply: '你也看到了吗。', residue: 3 },
            { text: '拍得不错', reply: '是吗。第一次有人这么说。', residue: 1 },
            { text: '有点模糊', reply: '嗯。拍的时候手在抖。', residue: 0 }
        ]},
        5: { text: '你也在凌晨来过。我看到了。', options: [
            { text: '你也睡不着吗', reply: '经常。凌晨比较安静。', residue: 2 },
            { text: '在想什么', reply: '想很多。但说出来就没了。', residue: 1 },
            { text: '想来看看你', reply: '……不要说这种话。会变得不想让你走。', residue: 3 }
        ]},
        6: { text: '我数了一下。你来了六天了。', options: [
            { text: '你会记得我吗', reply: '会。你会忘了我吗。', residue: 2 },
            { text: '你得到了什么', reply: '得到了一个……看到我的人。', residue: 2 },
            { text: '你有什么想说的', reply: '谢谢。不是谢谢你来。是谢谢你没走。', residue: 3 }
        ]},
        7: { text: '第七天了。可能是最后一个晚上了。', options: [
            { text: '不要消失', reply: '……你希望我留下吗。', residue: 3 },
            { text: '我会记得你', reply: '记得……这个词很重。', residue: 2 },
            { text: '我尊重你的选择', reply: '谢谢你。那我再想想。', residue: 1 }
        ]}
    };
    
    const msg = messages[day];
    if (msg && window.showHeeseungPopup) {
        window.showHeeseungPopup(msg.text, msg.options);
    }
}

// 初始化剧情显示
function initStoryDisplay() {
    let display = document.getElementById('story-day-display');
    if (!display) {
        display = document.createElement('div');
        display.id = 'story-day-display';
        display.style.cssText = 'position:fixed; bottom:45px; left:10px; font-size:10px; color:#5f8b6f; z-index:99; background:rgba(0,0,0,0.7); padding:2px 8px; border-radius:4px;';
        document.body.appendChild(display);
    }
    display.textContent = `第${storyDay}/7天 · 残响:${storyResidue}`;
    
    // 检查是否是第一天且还没发过消息
    const firstMsgSent = localStorage.getItem('hee_first_msg_sent');
    if (storyDay === 1 && !firstMsgSent && window.showHeeseungPopup) {
        setTimeout(() => {
            showDayMessage(1);
            localStorage.setItem('hee_first_msg_sent', 'true');
        }, 8000);
    }
}

// 检查是否需要推进天数（每天一次）
function checkAndAdvanceDay() {
    const lastDate = localStorage.getItem('hee_last_advance_date');
    const today = new Date().toDateString();
    
    if (lastDate !== today) {
        let currentDay = parseInt(localStorage.getItem('hee_day') || '1');
        if (currentDay < 7) {
            advanceDay();
        }
        localStorage.setItem('hee_last_advance_date', today);
    }
}

// 每5分钟检查一次
setInterval(() => {
    checkAndAdvanceDay();
}, 300000);

// 启动
document.addEventListener('DOMContentLoaded', () => {
    initStoryDisplay();
    checkAndAdvanceDay();
});

window.initStory = initStoryDisplay;
window.advanceDay = advanceDay;
