// 随身行程单 - 减法重构版 + 8步对话动画
// 功能：对话动画入口 → 机框内行程单 / 文字路线 / 简化预算

document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initItinerary();
  initNav();
  initModal();
  initMapRoute();
  initBudget();
  initChatAnimation();
  initHarmonyCard();
});

// ========== Hero 区域 ==========
function initHero() {
  document.getElementById('trip-title').textContent = TRIP_DATA.title;
  document.getElementById('trip-subtitle').textContent = TRIP_DATA.subtitle;
  document.getElementById('trip-dates').textContent =
    `${TRIP_DATA.dates.start} ~ ${TRIP_DATA.dates.end} · ${TRIP_DATA.dates.days}天`;
  document.getElementById('trip-travelers').textContent = TRIP_DATA.travelers;
  document.getElementById('trip-budget').textContent =
    `¥${TRIP_DATA.budget.total.toLocaleString()}`;
}

// ========== 导航切换 ==========
function initNav() {
  const buttons = document.querySelectorAll('.nav-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const viewName = btn.dataset.view;
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById(`${viewName}-view`).classList.add('active');
    });
  });
}

// ========== 行程单视图（机框内） ==========
function initItinerary() {
  const container = document.getElementById('itinerary-content');
  let html = '';

  TRIP_DATA.schedule.forEach(day => {
    html += `
      <div class="day-group" data-day="${day.day}">
        <div class="day-toggle">
          <div class="day-toggle-main">
            <span class="day-toggle-badge">Day${day.day}</span>
            <div class="day-toggle-info">
              <div class="day-toggle-title">${day.destination} · ${day.date}</div>
              <div class="day-toggle-theme">${day.theme}</div>
            </div>
          </div>
          <i class="fas fa-chevron-down day-toggle-arrow"></i>
        </div>
        <div class="day-spots">
    `;

    day.spots.forEach((spot, idx) => {
      html += `
        <div class="day-spot" data-day="${day.day}" data-spot="${idx}">
          <span class="day-spot-time">${spot.time}</span>
          <div class="day-spot-main">
            <span class="day-spot-icon">${spot.icon}</span>
            <div class="day-spot-info">
              <div class="day-spot-title">${spot.title}</div>
              <div class="day-spot-desc">${spot.desc}</div>
            </div>
          </div>
        </div>
      `;
    });

    html += '</div></div>';
  });

  container.innerHTML = html;

  // 展开/折叠
  container.querySelectorAll('.day-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const group = toggle.closest('.day-group');
      group.classList.toggle('expanded');
    });
  });

  // 点击活动打开详情
  container.querySelectorAll('.day-spot').forEach(spot => {
    spot.addEventListener('click', () => {
      const dayIdx = parseInt(spot.dataset.day) - 1;
      const spotIdx = parseInt(spot.dataset.spot);
      openSpotDetail(TRIP_DATA.schedule[dayIdx].spots[spotIdx]);
    });
  });

  // 默认展开第一天
  const firstDay = container.querySelector('.day-group');
  if (firstDay) firstDay.classList.add('expanded');
}

// ========== 地图视图（简化文字路线） ==========
function initMapRoute() {
  const container = document.getElementById('route-list');
  let html = '';

  TRIP_DATA.route.segments.forEach((seg, idx) => {
    html += `
      <div class="route-list-item">
        <div class="route-list-step">${idx + 1}</div>
        <div class="route-list-main">
          <div class="route-list-places">
            ${seg.from} <i class="fas fa-arrow-right" style="color:var(--text-lighter);font-size:10px"></i> ${seg.to}
          </div>
          <div class="route-list-detail">
            <span><i class="fas fa-${getTransportIcon(seg.mode)}"></i> ${seg.mode}</span>
            <span><i class="fas fa-road"></i> ${seg.distance}</span>
            <span><i class="fas fa-clock"></i> ${seg.time}</span>
          </div>
          <div class="route-list-note">${seg.note}</div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function getTransportIcon(mode) {
  if (mode.includes('动车') || mode.includes('火车')) return 'train';
  if (mode.includes('飞机')) return 'plane';
  if (mode.includes('自行车') || mode.includes('骑行') || mode.includes('电动车')) return 'bicycle';
  if (mode.includes('包车') || mode.includes('拼车') || mode.includes('打车')) return 'taxi';
  if (mode.includes('大巴') || mode.includes('公交')) return 'bus';
  return 'route';
}

// ========== 预算视图（简化） ==========
function initBudget() {
  const b = TRIP_DATA.budget;
  document.getElementById('budget-total').textContent = `¥${b.total}`;

  const container = document.getElementById('budget-bars');
  const maxAmount = Math.max(...Object.values(b.breakdown).map(x => x.amount));

  let html = '';
  Object.entries(b.breakdown).forEach(([key, item]) => {
    const pct = (item.amount / maxAmount * 100).toFixed(0);
    html += `
      <div class="budget-bar-item">
        <div class="budget-bar-header">
          <span class="budget-bar-icon">${item.icon}</span>
          <span class="budget-bar-label">${item.label}</span>
          <span class="budget-bar-value">¥${item.amount}</span>
        </div>
        <div class="budget-bar-track">
          <div class="budget-bar-fill" style="width:${pct}%"></div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ========== 弹窗详情 ==========
function initModal() {
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

function openSpotDetail(spot) {
  const content = document.getElementById('modal-content');

  const tagsHtml = spot.tags
    ? `<div class="modal-tags">${spot.tags.map(t => `<span class="modal-tag">${t}</span>`).join('')}</div>`
    : '';

  const transportHtml = spot.transport
    ? `<div class="modal-section">
         <h4><i class="fas fa-route"></i> 交通方式</h4>
         <p>${spot.transport}</p>
         ${spot.duration ? `<p><i class="fas fa-clock"></i> 预计耗时：${spot.duration}</p>` : ''}
       </div>`
    : '';

  const xhsHtml = spot.xiaohongshuNotes
    ? `<div class="modal-section">
         <h4><i class="fab fa-readme"></i> 小红书笔记精选</h4>
         <div class="modal-note">
           ${spot.xiaohongshuNotes.map(n => `<p>${n}</p>`).join('')}
         </div>
       </div>`
    : '';

  content.innerHTML = `
    <div class="modal-header">
      <div class="modal-title">${spot.icon} ${spot.title}</div>
      <span class="modal-time">${spot.time}</span>
    </div>
    <div class="modal-body">
      <p>${spot.desc}</p>
      ${tagsHtml}
      <div class="modal-section">
        <h4><i class="fas fa-coins"></i> 费用</h4>
        <p style="color:var(--primary);font-weight:700;font-size:18px">${spot.cost}</p>
      </div>
      ${transportHtml}
      ${xhsHtml}
    </div>
  `;

  document.getElementById('modal-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

// ========== 8步对话动画 ==========
function initChatAnimation() {
  const chatArea = document.getElementById('chat-area');
  const flowSteps = document.querySelectorAll('.flow-step');
  const replayBtn = document.getElementById('replay-btn');
  const chatPhone = document.getElementById('chat-phone');
  const itineraryResult = document.getElementById('itinerary-result');
  const replayArea = document.getElementById('replay-area');

  if (!chatArea) return;

  let timers = [];

  function clearAllTimers() {
    timers.forEach(t => clearTimeout(t));
    timers = [];
  }

  const dialogSequence = [
    { msg: 1, type: 'user', delay: 0 },
    { msg: 2, type: 'user', delay: 2000 },
    { msg: 3, type: 'ai', delay: 4500, typing: 'typing-1', content: 'content-1', step: 1 },
    { msg: 4, type: 'ai', delay: 7500, typing: 'typing-2', content: 'content-2', step: 2 },
    { msg: 5, type: 'user', delay: 11000 },
    { msg: 6, type: 'ai', delay: 14500, typing: 'typing-3', content: 'content-3', step: 3 },
    { msg: 7, type: 'user', delay: 19000 },
    { msg: 8, type: 'ai', delay: 23000, typing: 'typing-4', content: 'content-4', step: 4 },
  ];

  function resetAnimation() {
    clearAllTimers();
    document.querySelectorAll('.chat-msg').forEach(msg => {
      msg.style.opacity = '0';
      msg.style.transform = 'translateY(10px)';
      msg.style.animation = 'none';
    });
    document.querySelectorAll('.typing-indicator').forEach(t => t.style.display = 'none');
    document.querySelectorAll('.msg-content').forEach(c => c.style.display = 'block');
    flowSteps.forEach(s => s.classList.remove('active', 'completed'));
    if (flowSteps[0]) flowSteps[0].classList.add('active');
    if (chatPhone) chatPhone.style.display = 'flex';
    if (itineraryResult) itineraryResult.style.display = 'none';
    if (replayArea) replayArea.style.display = 'none';
    const harmonyCardPreview = document.getElementById('harmony-card-preview');
    if (harmonyCardPreview) harmonyCardPreview.style.display = 'none';
    if (chatArea) chatArea.scrollTop = 0;
  }

  function showItinerary() {
    if (chatPhone) chatPhone.style.display = 'none';
    if (itineraryResult) itineraryResult.style.display = 'block';
    if (replayArea) replayArea.style.display = 'flex';
    const harmonyCardPreview = document.getElementById('harmony-card-preview');
    if (harmonyCardPreview) harmonyCardPreview.style.display = 'block';
  }

  function playAnimation() {
    resetAnimation();
    dialogSequence.forEach(item => {
      const timer = setTimeout(() => {
        const msgEl = document.querySelector(`.chat-msg[data-msg="${item.msg}"]`);
        if (!msgEl) return;
        msgEl.style.animation = 'none';
        msgEl.offsetHeight;
        msgEl.style.animation = 'msgAppear 0.4s ease forwards';
        if (item.type === 'ai' && item.typing && item.content) {
          const typingEl = document.getElementById(item.typing);
          const contentEl = document.getElementById(item.content);
          if (typingEl) typingEl.style.display = 'flex';
          if (contentEl) contentEl.style.display = 'none';
          const typingTimer = setTimeout(() => {
            if (typingEl) typingEl.style.display = 'none';
            if (contentEl) contentEl.style.display = 'block';
          }, 1200);
          timers.push(typingTimer);
        }
        if (item.step) {
          flowSteps.forEach((s, idx) => {
            if (idx < item.step - 1) {
              s.classList.add('completed');
              s.classList.remove('active');
            } else if (idx === item.step - 1) {
              s.classList.add('active');
            }
          });
        }
        if (item.msg === 8) {
          const finalTimer = setTimeout(() => {
            const viewBtn = document.createElement('div');
            viewBtn.className = 'chat-msg ai-msg view-itinerary-btn';
            viewBtn.innerHTML = `
              <div class="msg-avatar">🤖</div>
              <div class="msg-bubble" style="background:linear-gradient(135deg,var(--primary),var(--secondary));color:white;cursor:pointer;">
                <i class="fas fa-map"></i> 点击查看行程单
              </div>
            `;
            viewBtn.style.opacity = '0';
            chatArea.appendChild(viewBtn);
            requestAnimationFrame(() => {
              viewBtn.style.animation = 'msgAppear 0.4s ease forwards';
            });
            viewBtn.addEventListener('click', () => {
              showItinerary();
              viewBtn.remove();
            });
            chatArea.scrollTop = chatArea.scrollHeight;
          }, 1500);
          timers.push(finalTimer);
        }
        chatArea.scrollTop = chatArea.scrollHeight;
      }, item.delay);
      timers.push(timer);
    });
  }

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      const viewBtn = chatArea.querySelector('.view-itinerary-btn');
      if (viewBtn) viewBtn.remove();
      playAnimation();
    });
  }

  setTimeout(playAnimation, 500);
}

// ========== 鸿蒙桌面卡片 - 4天切换+地点显示 ==========
function initHarmonyCard() {
  const hcDays = document.getElementById('hc-days');
  const hcList = document.getElementById('hc-list');
  const hcTimeline = document.getElementById('hc-timeline');

  if (!hcDays || !hcList || !hcTimeline) return;

  let currentDay = 1;

  // 渲染指定天的行程列表
  function renderDay(dayNum) {
    const dayData = TRIP_DATA.schedule.find(d => d.day === dayNum);
    if (!dayData) return;

    // 更新列表（取前3条）
    const spots = dayData.spots.slice(0, 3);
    hcList.innerHTML = spots.map(spot => `
      <div class="hc-item">
        <span class="hc-time">${spot.time}</span>
        <span class="hc-text">${spot.title} ${spot.icon}</span>
      </div>
    `).join('');

    // 更新时间线高亮
    const dots = hcTimeline.querySelectorAll('.hc-dot');
    dots.forEach((dot, idx) => {
      if (idx < dayNum) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // 更新Day标签高亮
    const dayLabels = hcDays.querySelectorAll('.hc-day');
    dayLabels.forEach(label => {
      const labelDay = parseInt(label.dataset.day);
      if (labelDay === dayNum) {
        label.classList.add('active');
      } else {
        label.classList.remove('active');
      }
    });

    currentDay = dayNum;
  }

  // 初始化Day标签文本（带地点）
  const dayLabels = hcDays.querySelectorAll('.hc-day');
  dayLabels.forEach(label => {
    const dayNum = parseInt(label.dataset.day);
    const dayData = TRIP_DATA.schedule.find(d => d.day === dayNum);
    if (dayData) {
      label.textContent = `Day${dayNum}·${dayData.destination}`;
    }
    label.addEventListener('click', () => {
      renderDay(dayNum);
    });
  });

  // 默认渲染第一天
  renderDay(1);
}
