// 小红书风格旅行计划 Web App
// 功能：时间线视图 / 地图视图 / 预算视图

let map = null;
let routeLayer = null;
let markers = [];

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initXiaoai();
  initTimeline();
  initNav();
  initModal();
  initBudget();
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

      if (viewName === 'map') {
        setTimeout(initMap, 100);
      }
    });
  });
}

// ========== 时间线视图 ==========
function initTimeline() {
  const container = document.getElementById('timeline-content');
  let html = '';

  TRIP_DATA.schedule.forEach(day => {
    html += `
      <div class="day-section">
        <div class="day-header">
          <div class="day-badge">Day${day.day}</div>
          <div class="day-info">
            <h3>${day.destination} · ${day.date} ${day.weekday}</h3>
            <div class="day-meta">${day.spots.length}个行程点</div>
            <span class="day-theme">${day.theme}</span>
          </div>
        </div>
    `;

    day.spots.forEach((spot, idx) => {
      const xhsTips = spot.xiaohongshuNotes
        ? `<div class="xhs-tips">
             <div class="xhs-tips-title"><i class="fab fa-readme"></i> 小红书笔记精选</div>
             <ul>${spot.xiaohongshuNotes.map(t => `<li>${t}</li>`).join('')}</ul>
           </div>`
        : '';

      const tagsHtml = spot.tags
        ? `<div class="spot-tags">${spot.tags.map(t => `<span class="spot-tag">${t}</span>`).join('')}</div>`
        : '';

      const transportHtml = spot.transport
        ? `<span class="spot-transport"><i class="fas fa-route"></i> ${spot.transport}</span>`
        : '';

      html += `
        <div class="spot-card" data-day="${day.day}" data-spot="${idx}">
          <span class="spot-time">${spot.time}</span>
          <div class="spot-title">
            <span class="spot-icon">${spot.icon}</span>
            ${spot.title}
          </div>
          <div class="spot-desc">${spot.desc}</div>
          ${tagsHtml}
          ${xhsTips}
          <div class="spot-footer">
            <span class="spot-cost">💰 ${spot.cost}</span>
            ${transportHtml}
          </div>
        </div>
      `;
    });

    html += '</div>';
  });

  container.innerHTML = html;

  // 点击卡片打开详情
  container.querySelectorAll('.spot-card').forEach(card => {
    card.addEventListener('click', () => {
      const dayIdx = parseInt(card.dataset.day) - 1;
      const spotIdx = parseInt(card.dataset.spot);
      openSpotDetail(TRIP_DATA.schedule[dayIdx].spots[spotIdx]);
    });
  });
}

// ========== 地图视图 ==========
function initMap() {
  if (map) {
    map.invalidateSize();
    return;
  }

  // 中心点：大理和丽江中间
  map = L.map('map').setView([26.3, 100.2], 8);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // 绘制路线
  const allPoints = [];
  const dayColors = ['#ff2442', '#ff6b8a', '#ff8fab', '#ffb3c6'];

  TRIP_DATA.schedule.forEach((day, dayIdx) => {
    const dayPoints = [];

    day.spots.forEach((spot, spotIdx) => {
      if (spot.location) {
        const [lat, lng] = spot.location;
        dayPoints.push([lat, lng]);
        allPoints.push([lat, lng]);

        // 标记点
        const markerHtml = `<div class="custom-marker" style="background:${dayColors[dayIdx]}">
          ${day.day}-${spotIdx + 1}
        </div>`;

        const icon = L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([lat, lng], { icon })
          .bindPopup(`
            <div class="popup-title">${spot.icon} ${spot.title}</div>
            <div class="popup-desc">${spot.time} · ${spot.cost}</div>
          `)
          .addTo(map);

        markers.push(marker);
      }
    });

    // 绘制当天的路线
    if (dayPoints.length > 1) {
      L.polyline(dayPoints, {
        color: dayColors[dayIdx],
        weight: 3,
        opacity: 0.7,
        dashArray: dayIdx % 2 === 0 ? null : '8,6'
      }).addTo(map);
    }
  });

  // 大理到丽江的连线
  const dali = TRIP_DATA.destinations[0].coordinates;
  const lijiang = TRIP_DATA.destinations[1].coordinates;
  L.polyline([dali, lijiang], {
    color: '#ff2442',
    weight: 4,
    opacity: 0.5,
    dashArray: '10,8'
  }).addTo(map);

  // 目的地大标记
  TRIP_DATA.destinations.forEach(dest => {
    const icon = L.divIcon({
      html: `<div class="custom-marker destination">${dest.name}</div>`,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    L.marker(dest.coordinates, { icon })
      .bindPopup(`<div class="popup-title">${dest.name}</div><div class="popup-desc">${dest.tagline}</div>`)
      .addTo(map);
  });

  // 自动适应所有点
  if (allPoints.length > 0) {
    const bounds = L.latLngBounds(allPoints);
    map.fitBounds(bounds, { padding: [40, 40] });
  }

  // 渲染路线指引侧边栏
  renderRouteGuide();
}

function renderRouteGuide() {
  const container = document.getElementById('route-guide');
  let html = '';

  TRIP_DATA.route.segments.forEach(seg => {
    html += `
      <div class="route-item">
        <div class="route-places">
          <i class="fas fa-map-pin" style="color:var(--primary)"></i>
          ${seg.from} <i class="fas fa-arrow-right" style="color:var(--text-lighter);font-size:10px"></i> ${seg.to}
        </div>
        <div class="route-detail">
          <span class="route-mode"><i class="fas fa-${getTransportIcon(seg.mode)}"></i> ${seg.mode}</span>
          <span><i class="fas fa-road"></i> ${seg.distance}</span>
          <span><i class="fas fa-clock"></i> ${seg.time}</span>
        </div>
        <div style="margin-top:6px;font-size:12px;color:var(--primary)">
          <i class="fas fa-info-circle"></i> ${seg.note}
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

// ========== 预算视图 ==========
function initBudget() {
  const b = TRIP_DATA.budget;
  document.getElementById('budget-total').textContent = `¥${b.total}`;

  // 图表
  const chartContainer = document.getElementById('budget-chart');
  const maxAmount = Math.max(...Object.values(b.breakdown).map(x => x.amount));
  let chartHtml = '';

  Object.entries(b.breakdown).forEach(([key, item]) => {
    const pct = (item.amount / maxAmount * 100).toFixed(0);
    chartHtml += `
      <div class="chart-bar">
        <div class="chart-visual">
          <div class="chart-fill" style="height:${pct}%"></div>
        </div>
        <span class="chart-icon">${item.icon}</span>
        <span class="chart-label">${item.label}</span>
        <span class="chart-value">¥${item.amount}</span>
      </div>
    `;
  });

  chartContainer.innerHTML = chartHtml;

  // 明细列表
  const breakdownContainer = document.getElementById('budget-breakdown');
  let breakdownHtml = `
    <div class="breakdown-header">
      <span>💰 预算明细</span>
      <span>总计 ¥${b.total}</span>
    </div>
  `;

  Object.entries(b.breakdown).forEach(([key, item]) => {
    const pct = (item.amount / b.total * 100).toFixed(1);
    breakdownHtml += `
      <div class="breakdown-item">
        <div class="breakdown-info">
          <span class="breakdown-icon">${item.icon}</span>
          <span class="breakdown-name">${item.label}</span>
        </div>
        <div class="breakdown-bar-wrap">
          <div class="breakdown-bar" style="width:${pct}%"></div>
        </div>
        <span class="breakdown-amount">¥${item.amount}</span>
      </div>
    `;
  });

  breakdownContainer.innerHTML = breakdownHtml;

  // 省钱攻略
  const tipsContainer = document.getElementById('budget-tips-list');
  tipsContainer.innerHTML = TRIP_DATA.xiaohongshuTips.map(tip => `
    <div class="tip-item">
      <span class="tip-icon">💡</span>
      <span>${tip.replace(/^💡\s*/, '')}</span>
    </div>
  `).join('');
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

// ========== 小艺生成视图 ==========
function initXiaoai() {
  const chatArea = document.getElementById('chat-area');
  const resultPanel = document.getElementById('result-panel');
  const flowSteps = document.querySelectorAll('.flow-step');
  const replayBtn = document.getElementById('replay-btn');

  // 版本状态
  let v2Day = 1, v2Cat = 'play';
  let v3Place = 'dali', v3Cat = 'play';

  // 渲染单个spot
  function renderSpotItem(spot) {
    const tagsHtml = spot.tags
      ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">${spot.tags.map(t => `<span style="padding:2px 6px;border-radius:6px;background:#f8f4f2;font-size:10px;color:var(--text-light)">${t}</span>`).join('')}</div>`
      : '';
    return `
      <div class="category-item" data-title="${spot.title}">
        <span class="cat-icon">${spot.icon}</span>
        <div class="cat-info">
          <div class="cat-title">${spot.title}</div>
          <div class="cat-desc">${spot.desc}</div>
          ${tagsHtml}
        </div>
        <span class="cat-cost">${spot.cost}</span>
      </div>
    `;
  }

  // 渲染分类列表
  function renderCategoryList(container, items) {
    if (!items || items.length === 0) {
      container.innerHTML = `<div class="cat-empty">暂无</div>`;
      return;
    }
    container.innerHTML = items.map(renderSpotItem).join('');
  }

  // 渲染版本2
  function renderV2() {
    const dayData = CATEGORIZED_DATA.byDay[v2Day];
    if (dayData) {
      let items = dayData[v2Cat];
      // 玩乐行：合并 play + transport
      if (v2Cat === 'play') {
        items = [...dayData.play, ...dayData.transport];
      }
      renderCategoryList(document.getElementById('day-list'), items);
    }
    document.querySelectorAll('#day-axis .axis-item').forEach(el => {
      el.classList.toggle('active', parseInt(el.dataset.day) === v2Day);
    });
    document.querySelectorAll('#day-categories .cat-card').forEach(el => {
      el.classList.toggle('active', el.dataset.cat === v2Cat);
    });
  }

  // 渲染版本3
  function renderV3() {
    const placeData = CATEGORIZED_DATA.byPlace[v3Place];
    if (placeData) {
      let items = placeData[v3Cat];
      // 玩乐行：合并 play + transport
      if (v3Cat === 'play') {
        items = [...placeData.play, ...placeData.transport];
      }
      renderCategoryList(document.getElementById('place-list'), items);
    }
    document.querySelectorAll('#place-axis .axis-item').forEach(el => {
      el.classList.toggle('active', el.dataset.place === v3Place);
    });
    document.querySelectorAll('#place-categories .cat-card').forEach(el => {
      el.classList.toggle('active', el.dataset.cat === v3Cat);
    });
  // 版本切换标签
  document.querySelectorAll('.v-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.v-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const version = tab.dataset.version;
      document.querySelectorAll('.version-content').forEach(c => c.classList.remove('active'));
      document.getElementById(`${version}-content`).classList.add('active');
      if (version === 'v2') renderV2();
      if (version === 'v3') renderV3();
    });
  });

  // 版本2：时间线轴
  document.querySelectorAll('#day-axis .axis-item').forEach(el => {
    el.addEventListener('click', () => {
      v2Day = parseInt(el.dataset.day);
      renderV2();
    });
  });

  // 版本2：三板块
  document.querySelectorAll('#day-categories .cat-card').forEach(el => {
    el.addEventListener('click', () => {
      v2Cat = el.dataset.cat;
      renderV2();
    });
  });

  // 版本3：地点线
  document.querySelectorAll('#place-axis .axis-item').forEach(el => {
    el.addEventListener('click', () => {
      v3Place = el.dataset.place;
      renderV3();
    });
  });

  // 版本3：三板块
  document.querySelectorAll('#place-categories .cat-card').forEach(el => {
    el.addEventListener('click', () => {
      v3Cat = el.dataset.cat;
      renderV3();
    });
  });

  // 旅行阶段大tab切换
  document.querySelectorAll('.phase-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.phase-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const phase = tab.dataset.phase;
      document.querySelectorAll('.phase-content').forEach(c => c.classList.remove('active'));
      document.getElementById(`${phase}-content`).classList.add('active');
    });
  });

  // 跳转地图按钮
  const gotoMapBtn = document.getElementById('goto-map-btn');
  if (gotoMapBtn) {
    gotoMapBtn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('.nav-btn[data-view="map"]').classList.add('active');
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById('map-view').classList.add('active');
      setTimeout(initMap, 100);
    });
  }

  // 定义对话序列
  const dialogSequence = [
    { msg: 1, type: 'user', delay: 0 },
    { msg: 2, type: 'user', delay: 1200 },
    { msg: 3, type: 'ai', delay: 2400, typing: 'typing-1', content: 'content-1', step: 1 },
    { msg: 4, type: 'ai', delay: 4000, typing: 'typing-2', content: 'content-2', step: 2 },
    { msg: 5, type: 'user', delay: 6000 },
    { msg: 6, type: 'ai', delay: 7200, typing: 'typing-3', content: 'content-3', step: 3 },
    { msg: 7, type: 'user', delay: 9000 },
    { msg: 8, type: 'ai', delay: 10200, typing: 'typing-4', content: 'content-4', step: 4 },
  ];

  function resetAnimation() {
    document.querySelectorAll('.chat-msg').forEach(msg => {
      msg.style.opacity = '0';
      msg.style.transform = 'translateY(10px)';
      msg.style.animation = 'none';
    });

    document.querySelectorAll('.typing-indicator').forEach(t => t.style.display = 'flex');
    document.querySelectorAll('.msg-content').forEach(c => c.style.display = 'none');

    resultPanel.classList.remove('visible');

    flowSteps.forEach(s => {
      s.classList.remove('active', 'completed');
    });
    if (flowSteps[0]) flowSteps[0].classList.add('active');

    // 重置阶段tab为旅行中
    document.querySelectorAll('.phase-tab').forEach(t => t.classList.remove('active'));
    const duringTab = document.querySelector('.phase-tab[data-phase="during"]');
    if (duringTab) duringTab.classList.add('active');
    document.querySelectorAll('.phase-content').forEach(c => c.classList.remove('active'));
    const duringContent = document.getElementById('during-content');
    if (duringContent) duringContent.classList.add('active');

    chatArea.scrollTop = 0;
  }

  function playAnimation() {
    resetAnimation();

    dialogSequence.forEach(item => {
      setTimeout(() => {
        const msgEl = document.querySelector(`.chat-msg[data-msg="${item.msg}"]`);
        if (!msgEl) return;

        msgEl.style.animation = '';
        msgEl.offsetHeight;
        msgEl.style.animation = 'msgAppear 0.4s ease forwards';

        chatArea.scrollTop = chatArea.scrollHeight;

        if (item.type === 'ai' && item.typing && item.content) {
          const typingEl = document.getElementById(item.typing);
          const contentEl = document.getElementById(item.content);

          if (typingEl) typingEl.style.display = 'flex';
          if (contentEl) contentEl.style.display = 'none';

          setTimeout(() => {
            if (typingEl) typingEl.style.display = 'none';
            if (contentEl) contentEl.style.display = 'block';
            chatArea.scrollTop = chatArea.scrollHeight;
          }, 1200);
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
          setTimeout(() => {
            resultPanel.classList.add('visible');
            renderV2();
          }, 1500);
        }
      }, item.delay);
    });
  }

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      playAnimation();
    });
  }

  let hasPlayed = false;
  const xiaoaiView = document.getElementById('xiaoai-view');
  const observer = new MutationObserver(() => {
    if (xiaoaiView.classList.contains('active') && !hasPlayed) {
      hasPlayed = true;
      setTimeout(playAnimation, 300);
    }
  });
  observer.observe(xiaoaiView, { attributes: true, attributeFilter: ['class'] });

  // 如果初始已经是 active（默认视图），直接播放动画
  if (xiaoaiView.classList.contains('active') && !hasPlayed) {
    hasPlayed = true;
    setTimeout(playAnimation, 300);
  }
}
  const xiaoaiView = document.getElementById('xiaoai-view');
  const observer = new MutationObserver(() => {
    if (xiaoaiView.classList.contains('active') && !hasPlayed) {
      hasPlayed = true;
      setTimeout(playAnimation, 300);
    }
  });
  observer.observe(xiaoaiView, { attributes: true, attributeFilter: ['class'] });
}
