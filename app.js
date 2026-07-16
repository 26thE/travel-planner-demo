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
        setTimeout(() => {
          initMap();
          if (map) setTimeout(() => map.invalidateSize(), 300);
        }, 200);
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

  L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    attribution: '&copy; <a href="https://www.amap.com">高德地图</a>',
    subdomains: '1234',
    maxZoom: 18
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
    console.log('[debug] renderV2 called, v2Day=', v2Day, 'v2Cat=', v2Cat);
    const dayData = CATEGORIZED_DATA.byDay[v2Day];
    console.log('[debug] dayData=', dayData);

    const dayList = document.getElementById('day-list');
    const dayTransport = document.getElementById('day-transport');

    if (dayData) {
      if (v2Cat === 'transport') {
        // 行：显示路线示意
        if (dayList) dayList.style.display = 'none';
        if (dayTransport) dayTransport.style.display = 'block';
      } else {
        // 玩/食/住：显示列表
        if (dayList) dayList.style.display = 'block';
        if (dayTransport) dayTransport.style.display = 'none';

        let items = dayData[v2Cat];
        // 如果住为空，向前查找最近的住宿记录
        if (v2Cat === 'stay' && (!items || items.length === 0)) {
          for (let d = v2Day - 1; d >= 1; d--) {
            const prevDay = CATEGORIZED_DATA.byDay[d];
            if (prevDay && prevDay.stay && prevDay.stay.length > 0) {
              items = prevDay.stay;
              break;
            }
          }
        }
        renderCategoryList(dayList, items);
      }
    }

    // 更新所有带 data-day 的 axis-item
    document.querySelectorAll('.axis-item[data-day]').forEach(el => {
      el.classList.toggle('active', parseInt(el.dataset.day) === v2Day);
    });
    document.querySelectorAll('#day-categories .cat-card').forEach(el => {
      el.classList.toggle('active', el.dataset.cat === v2Cat);
    });
  }

  // 渲染版本3
  function renderV3() {
    console.log('[debug] renderV3 called, v3Place=', v3Place, 'v3Cat=', v3Cat);
    const placeData = CATEGORIZED_DATA.byPlace[v3Place];
    console.log('[debug] placeData=', placeData);

    const placeList = document.getElementById('place-list');
    const placeTransport = document.getElementById('place-transport');

    if (placeData) {
      if (v3Cat === 'transport') {
        // 行：显示路线示意
        if (placeList) placeList.style.display = 'none';
        if (placeTransport) placeTransport.style.display = 'block';
      } else {
        // 玩/食/住：显示列表
        if (placeList) placeList.style.display = 'block';
        if (placeTransport) placeTransport.style.display = 'none';

        let items = placeData[v3Cat];
        renderCategoryList(placeList, items);
      }
    }

    // 更新所有带 data-place 的 axis-item
    document.querySelectorAll('.axis-item[data-place]').forEach(el => {
      el.classList.toggle('active', el.dataset.place === v3Place);
    });
    document.querySelectorAll('#place-categories .cat-card').forEach(el => {
      el.classList.toggle('active', el.dataset.cat === v3Cat);
    });
  }

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

  // 版本2：时间线轴（绑定所有带 data-day 的 axis-item，包括机框内外）
  document.querySelectorAll('.axis-item[data-day]').forEach(el => {
    el.addEventListener('click', () => {
      console.log('[debug] day clicked:', el.dataset.day);
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

  // 版本3：地点线（绑定所有带 data-place 的 axis-item，包括机框内外）
  document.querySelectorAll('.axis-item[data-place]').forEach(el => {
    el.addEventListener('click', () => {
      console.log('[debug] place clicked:', el.dataset.place);
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

      // 控制外部版本标签显示/隐藏
      const versionTabs = document.getElementById('outside-version-tabs');
      if (versionTabs) versionTabs.style.display = phase === 'during' ? 'flex' : 'none';
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
      setTimeout(() => {
        initMap();
        if (map) setTimeout(() => map.invalidateSize(), 300);
      }, 200);
    });
  }

  // 定义对话序列
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

    // 默认显示内容、隐藏打字机
    document.querySelectorAll('.typing-indicator').forEach(t => t.style.display = 'none');
    document.querySelectorAll('.msg-content').forEach(c => c.style.display = 'block');

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

    // 重置外部控件状态
    const versionTabs = document.getElementById('outside-version-tabs');
    if (versionTabs) versionTabs.style.display = 'flex';
    document.querySelectorAll('#outside-version-tabs .v-tab').forEach(t => t.classList.remove('active'));
    const v2tab = document.querySelector('#outside-version-tabs .v-tab[data-version="v2"]');
    if (v2tab) v2tab.classList.add('active');

    chatArea.scrollTop = 0;
  }

  function playAnimation() {
    resetAnimation();

    dialogSequence.forEach(item => {
      const timer = setTimeout(() => {
        const msgEl = document.querySelector(`.chat-msg[data-msg="${item.msg}"]`);
        if (!msgEl) return;

        // 先设为 none 再重新设置，确保浏览器重新触发动画
        msgEl.style.animation = 'none';
        msgEl.offsetHeight; // 强制重排
        msgEl.style.animation = 'msgAppear 0.4s ease forwards';

        if (item.type === 'ai' && item.typing && item.content) {
          const typingEl = document.getElementById(item.typing);
          const contentEl = document.getElementById(item.content);

          // 先显示打字机、隐藏内容
          if (typingEl) typingEl.style.display = 'flex';
          if (contentEl) contentEl.style.display = 'none';

          // 1.2秒后显示内容、隐藏打字机
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
            resultPanel.classList.add('visible');
            renderV2();
          }, 1500);
          timers.push(finalTimer);
        }
      }, item.delay);
      timers.push(timer);
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

  // 保险：3秒后如果卡片还没显示，直接展示（防止动画被中断）
  setTimeout(() => {
    if (!resultPanel.classList.contains('visible')) {
      resultPanel.classList.add('visible');
      renderV2();
    }
  }, 3000);

  // 初始化预渲染内容
  renderV2();
  renderV3();

  // ===== 旅行前 Checklist 勾选奖励卡片 =====
  const rewardContainer = document.getElementById('checklist-reward');
  if (rewardContainer) {
    const rewardCards = {
      hotel: {
        icon: '🏨',
        title: '住宿已确认',
        detail: '大理古城·慢时光客栈 · 2晚<br>丽江古城·听风小筑 · 1晚',
        tag: '已预订'
      },
      ticket: {
        icon: '🎫',
        title: '门票已预约',
        detail: '玉龙雪山大索道<br>5月3日 09:00-11:00',
        tag: '已出票'
      },
      transport: {
        icon: '🚄',
        title: '交通已订票',
        detail: 'D8752 大理→丽江<br>5月2日 14:20 发车',
        tag: '已出票'
      },
      insurance: {
        icon: '🛡️',
        title: '保险已生效',
        detail: '境内旅行综合意外险<br>4天全程保障 · 含高原医疗',
        tag: '保障中'
      },
      gear: {
        icon: '🎒',
        title: '装备已备齐',
        detail: '防晒霜SPF50+ · 墨镜 · 冲锋衣<br>保暖手套 · 登山杖',
        tag: '已打包'
      },
      oxygen: {
        icon: '💨',
        title: '氧气已准备',
        detail: '便携氧气瓶×2<br>古城药店购买更便宜',
        tag: '已备货'
      }
    };

    document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(checkbox => {
      const item = checkbox.closest('.checklist-item');
      if (!item) return;
      const cardKey = item.dataset.card;
      if (!cardKey || !rewardCards[cardKey]) return;

      checkbox.addEventListener('change', () => {
        const existing = rewardContainer.querySelector(`.reward-card[data-card="${cardKey}"]`);
        if (checkbox.checked) {
          if (existing) return; // 已存在
          const data = rewardCards[cardKey];
          const card = document.createElement('div');
          card.className = 'reward-card';
          card.dataset.card = cardKey;
          card.innerHTML = `
            <div class="reward-header">
              <span class="reward-icon">${data.icon}</span>
              <span class="reward-title">${data.title}</span>
              <span class="reward-tag">${data.tag}</span>
            </div>
            <div class="reward-detail">${data.detail}</div>
          `;
          rewardContainer.appendChild(card);
          // 触发动画
          requestAnimationFrame(() => {
            card.classList.add('rewardAppear');
          });
          // 滚动到卡片可见
          setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        } else {
          if (existing) {
            existing.classList.remove('rewardAppear');
            existing.classList.add('rewardRemove');
            setTimeout(() => {
              if (existing.parentNode) existing.parentNode.removeChild(existing);
            }, 350);
          }
        }
      });
    });
  }
}
