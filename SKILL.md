# 🎯 鸿蒙手机机框 Demo Skill

> 核心模式：所有 AI 生成的内容都在**鸿蒙手机机框**内展示，以**卡片化应用**的形式呈现，打造沉浸式移动端体验。

---

## 一、Skill 定位

本 Skill 是一个**可复用的前端 Demo 模板**，核心解决一个问题：

> **如何让 AI 生成的内容以「手机应用」的形态呈现，而不是一个网页？**

通过「鸿蒙手机机框 → 卡片化应用 → 沉浸式交互」的设计，将网页 Demo 变成用户手中正在运行的 App，所有内容都在机框内闭环流转。

---

## 二、核心设计原则

### 2.1 鸿蒙手机机框（HarmonyOS Phone Frame）

所有内容必须在手机机框内展示，机框特征：

- 顶部状态栏（时间、信号、WiFi、电量）
- 刘海/挖孔区域
- 圆角边框（36px radius）
- 底部无实体按键（全面屏手势区）
- 外框阴影（模拟手机厚度）

```css
.phone-mockup {
  width: 380px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 36px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 0 0 8px #e8e8e8;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 640px;
}
```

### 2.2 卡片即应用（Cards as Apps）

每个功能模块都是一张独立卡片，卡片特征：

- 圆角卡片（14-16px）
- 阴影层次（区分信息层级）
- 彩色顶部条（粉色渐变标识品牌色）
- 大图标 + 标题 + 描述 + 费用的信息结构
- 可点击、可滑动、可展开

### 2.3 机框内闭环（In-Frame Closed Loop）

所有交互在机框内完成，不跳出：

| 操作 | 机框内响应 |
|------|-----------|
| 点击地图 | 弹出机框内地图 overlay，而非跳转新页面 |
| 查看详情 | 机框内弹窗/底部 sheet |
| 切换分类 | 机框内内容刷新 |
| 输入微调 | 机框内底部输入框 |
| 确认行程 | 机框内按钮点击 → 机框内展示结果 |

---

## 三、四大核心机框

### 📱 聊天机框（Chat Frame）

- **用途**：用户与 AI 对话的入口
- **内容**：逐句出现的对话气泡、打字机效果、分享卡片
- **位置**：工作区左侧（或单独展示）
- **特性**：
  - 用户消息在右侧（头像+气泡）
  - AI 消息在左侧（头像+气泡）
  - 消息逐句出现，带滚动动画
  - 底部输入栏（模拟真实聊天 App）

### 📱 确认机框（Confirm Frame）

- **用途**：中间确认环节，让用户输入微调意见
- **内容**：竖向行程卡片、输入框、确认按钮
- **出现时机**：对话流程结束后
- **特性**：
  - 粉色渐变头部（📋 请确认行程）
  - 按天分组的竖向卡片（Day1 · 5月1日 · 大理）
  - 每张卡片带分类标签（玩/食/住/行，彩色区分）
  - 底部固定输入框 + 确认按钮
  - 卡片可点击打开详情

### 📱 结果机框（Result Frame）

- **用途**：展示最终生成的计划内容
- **内容**：时间线轴/地点线 + 玩/食/住/行卡片
- **阶段切换**：旅行前 / 旅行中（默认）/ 旅行后
- **特性**：
  - 时间线轴在机框顶部（可点击切换天）
  - 分类卡片在机框中部（玩/食/住/行，大图标方块）
  - 内容列表在机框主体（竖向滑动卡片）
  - 地图 overlay 覆盖机框内容区（可返回）

### 📱 地图机框（Map Overlay）

- **用途**：在机框内全屏展示地图
- **触发**：点击「路线示意」旁的「地图」小按钮
- **特性**：
  - 覆盖整个机框内容区域
  - 顶部返回按钮 + 标题
  - Leaflet 地图渲染（高德瓦片）
  - 标记点、路线、目的地标签
  - 点击返回回到行程内容

---

## 四、卡片体系

### 4.1 确认卡片（Confirm Card）

```
┌─────────────────────────┐
│ ▓▓▓ 粉色渐变顶部条       │
│ 09:00        [玩]        │
│ 🎯 抵达大理               │
│ ✈️ 昆明转机或直飞大理...   │
│ 💰 机场大巴25元           │
└─────────────────────────┘
```

- 顶部彩色条（标识品牌）
- 时间 + 分类标签（彩色小徽章）
- 大图标（emoji）
- 标题（加粗）
- 描述（灰色，两行截断）
- 费用（品牌色）

### 4.2 分类选择卡片（Category Selector）

```
┌────┐ ┌────┐ ┌────┐ ┌────┐
│ 🎯 │ │ 🍜 │ │ 🏨 │ │ 🚗 │
│ 玩 │ │ 食 │ │ 住 │ │ 行 │
└────┘ └────┘ └────┘ └────┘
```

- 四个大方块卡片并排
- 选中状态：粉色背景 + 白色图标
- 未选中状态：白色背景 + 灰色图标
- 点击切换内容

### 4.3 内容卡片（Content Card）

```
┌─────────────────────────┐
│ 🎯  大理古城漫步         │
│     🚶‍♀️ 从南门进，逛复兴路 │
│     #五华楼 #床单厂       │
│                    💰 免费 │
└─────────────────────────┘
```

- 左侧图标
- 标题 + 描述
- 标签（灰色小徽章）
- 右侧费用

### 4.4 Checklist 卡片（Check Card）

```
┌─────────────────────────┐
│ ☑️ 已定好酒店/客栈         │
│ 📖「大理古城客栈挑选指南」 │
│ 🏨 用携程订酒店          │
└─────────────────────────┘
```

- 复选框 + 标签
- 推荐小红书攻略链接
- 快速流转到 Agent 入口（按钮）
- 勾选后机框内下方动态生成确认卡片

---

## 五、交互流程（机框内闭环）

### 5.1 完整体验链路

```
[聊天机框]
用户 → 分享小红书攻略
用户 → 导入 Skill
AI  → 确认导入（打字机）
AI  → 导入成功（资源列表卡片）
用户 → 输入预算 3000
AI  → 生成计划（预算+天数）
用户 → 想看完整计划
AI  → 引导查看卡片
      ↓
[确认机框弹出]（替换聊天机框）
用户 → 浏览行程卡片
用户 → 输入微调意见（可选）
用户 → 点击「确认行程」
      ↓
[结果机框展示]（替换确认机框）
      ├── 旅行前：Checklist 卡片
      │   └── 勾选 → 机框内下方生成确认卡片
      ├── 旅行中（默认）：
      │   ├── 时间线轴（机框顶部，可点击）
      │   ├── 分类卡片（机框中部，可点击）
      │   ├── 内容卡片（机框主体，可滑动）
      │   └── 点击「行」→ 路线示意 SVG
      │       └── 点击「地图」小按钮 → 地图 overlay（机框内全屏）
      │           └── 点击「返回」→ 回到行程内容
      └── 旅行后：照片 + 感悟 + 讨论区
```

### 5.2 机框切换动画

- 聊天机框 → 确认机框：淡入 + 上滑（新内容从下方滑入）
- 确认机框 → 结果机框：淡入 + 缩放（确认机框缩小，结果机框放大）
- 内容 → 地图 overlay：覆盖式弹出（从底部滑上或淡入覆盖）
- 地图 → 内容：返回按钮点击 → overlay 消失，露出下方内容

---

## 六、适用场景改造

| 场景 | 机框内展示 | 卡片分类 | 地图替换 |
|------|-----------|---------|---------|
| **旅行计划** | 行程卡片 | 玩/食/住/行 | 路线地图 |
| **学习规划** | 学习计划卡片 | 学/练/测/评 | 知识图谱 |
| **装修方案** | 装修卡片 | 设计/材料/预算/工期 | 户型图 |
| **健身计划** | 训练卡片 | 力量/有氧/饮食/恢复 | 身体数据图 |
| **活动策划** | 活动卡片 | 流程/物料/人员/场地 | 场地地图 |
| **产品原型** | 功能卡片 | 设计/开发/测试/上线 | 架构图 |

**核心不变：** 鸿蒙手机机框 → 卡片化应用 → 机框内闭环交互

---

## 七、数据结构

### 7.1 核心数据对象

```javascript
const TRIP_DATA = {
  title: "🌸 云南大理丽江 · 4天3夜慢旅行",
  subtitle: "苍山雪，洱海月，古城烟火气",
  budget: { total: 3000, breakdown: { ... } },
  travelers: 1,
  dates: { start: "2026-05-01", end: "2026-05-04", days: 4 },
  destinations: [
    { id: "dali", name: "大理", coordinates: [25.6065, 100.2676], days: [1, 2] },
    { id: "lijiang", name: "丽江", coordinates: [26.8721, 100.2295], days: [3, 4] }
  ],
  schedule: [
    {
      day: 1, date: "5月1日", weekday: "周五", destination: "大理", theme: "初见大理",
      spots: [
        {
          time: "09:00", title: "抵达大理", desc: "...", cost: "机场大巴25元",
          transport: "机场大巴 → 古城南门", duration: "1.5小时",
          location: [25.6065, 100.2676], icon: "✈️",
          tags: ["白族建筑", "庭院"],
          xiaohongshuNotes: ["📸 五华楼二楼是拍古城全景的最佳机位"]
        }
      ]
    }
  ],
  route: { segments: [ ... ] },
  xiaohongshuTips: [ ... ]
};
```

### 7.2 自动分类规则

```javascript
function categorizeSpots() {
  // 食: 午餐|晚餐|早餐|小吃|美食|火锅|米线|咖啡|啤酒|饮品|茶饮|点心|甜品|吃
  // 住: 入住|客栈|酒店|住宿|民宿|休整|放行李
  // 行: 抵达|动车|火车|飞机|大巴|骑行|交通|返程|前往|机场|打车|包车|租车|索道
  // 其余 → 玩
}
```

---

## 八、关键代码片段

### 8.1 鸿蒙手机机框 HTML

```html
<div class="phone-mockup">
  <!-- 状态栏 -->
  <div class="phone-statusbar">
    <span class="phone-time">10:08</span>
    <div class="phone-notch"></div>
    <div class="phone-icons">
      <i class="fas fa-signal"></i>
      <i class="fas fa-wifi"></i>
      <i class="fas fa-battery-full"></i>
    </div>
  </div>
  
  <!-- 内容区（机框内所有内容放在这里） -->
  <div class="result-panel" id="result-panel">
    <!-- 旅行前/中/后 内容 -->
    <!-- 地图 overlay（机框内弹出） -->
  </div>
</div>
```

### 8.2 机框内地图 Overlay

```html
<div class="map-overlay" id="map-overlay" style="display:none">
  <div class="map-overlay-header">
    <button class="map-overlay-back" id="map-overlay-back">
      <i class="fas fa-chevron-left"></i> 返回
    </button>
    <span class="map-overlay-title">
      <i class="fas fa-map-marked-alt"></i> 路线地图
    </span>
  </div>
  <div class="map-overlay-body" id="phone-map"></div>
</div>
```

### 8.3 分类卡片

```javascript
const CAT_LABELS = {
  play:  { label: '玩', color: '#ff6b35', bg: '#fff4ef' },
  food:  { label: '食', color: '#e91e63', bg: '#fdeff4' },
  stay:  { label: '住', color: '#6366f1', bg: '#f0f0fe' },
  transport: { label: '行', color: '#0288d1', bg: '#e3f4fd' }
};
```

### 8.4 对话动画

```javascript
const dialogSequence = [
  { msg: 1, type: 'user', delay: 0 },
  { msg: 2, type: 'user', delay: 2000 },
  { msg: 3, type: 'ai', delay: 4500, typing: 'typing-1', content: 'content-1', step: 1 },
  // ...
];
```

---

## 九、自定义指南

### 9.1 替换场景数据

修改 `data.js` 中的 `TRIP_DATA`：
- `title`、`subtitle` → 你的主题
- `destinations` → 地点列表 + 坐标
- `schedule` → 按时间顺序的数据点
- 自动分类基于关键词，无需手动标注

### 9.2 修改分类维度

1. 修改 `index.html` 中的 `cat-card` 文字和图标
2. 修改 `data.js` 中的 `categorizeSpots()` 关键词
3. 修改 `CAT_LABELS` 颜色和标签
4. 更新 `renderV2()` / `renderV3()` 分类逻辑

### 9.3 调整机框切换时机

```javascript
// 聊天 → 确认
if (item.msg === 8) {
  confirmPhone.style.display = 'flex';
  confirmPhone.classList.add('visible');
  renderConfirmList();
}

// 确认 → 结果
confirmBtn.addEventListener('click', () => {
  confirmPhone.style.display = 'none';
  resultPanel.classList.add('visible');
  renderV2();
});
```

### 9.4 地图瓦片替换

```javascript
L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
  attribution: '&copy; <a href="https://www.amap.com">高德地图</a>',
  subdomains: '1234'
});
```

---

## 十、技术栈

| 技术 | 用途 |
|------|------|
| HTML5 + CSS3 | 页面结构与样式 |
| Vanilla JS | 交互逻辑（无框架依赖） |
| Leaflet | 机框内地图渲染 |
| Font Awesome | 图标 |
| 高德地图瓦片 | 国内地图底图 |

---

## 十一、文件结构

```
travel-demo/
├── index.html      # 页面骨架 + 所有 DOM 结构（含机框）
├── style.css       # 全部样式（机框 + 卡片 + 动画）
├── app.js          # 全部交互逻辑（机框切换 + 卡片渲染）
├── data.js         # Mock 数据 + 自动分类
└── server.js       # 本地开发服务器（可选）
```

---

## 十二、设计原则总结

1. **机框即设备** — 用户看到的不是网页，是手中正在运行的鸿蒙手机
2. **卡片即应用** — 每个卡片都是一个微型应用，有独立的信息层级和交互
3. **闭环不跳出** — 所有操作在机框内完成，地图、详情、弹窗都在机框内
4. **对话即引导** — 逐句出现的对话自然推进流程，不是说明书
5. **确认即参与** — 中间确认让用户感到「这是我确认的计划」

---

*本 Skill 核心是「鸿蒙手机机框 + 卡片化应用」的展示模式，可复用于任何需要在机框内展示 AI 生成内容的场景。*

---

**存储位置：** https://gitcode.com/user/Fe26/
