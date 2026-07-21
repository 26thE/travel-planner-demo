# HarmonyOS演示demoskill

> 核心模式：所有 AI 生成的内容都在**手机机框**内展示，以**卡片化应用**的形式呈现，打造沉浸式移动端体验。

---

## 一、Skill 定位

本 Skill 是一个**可复用的前端 Demo 模板**，核心解决一个问题：

> **如何让 AI 生成的内容以「手机应用」的形态呈现，而不是一个网页？**

通过「手机机框 → 卡片化应用 → 沉浸式交互」的设计，将网页 Demo 变成用户手中正在运行的 App，所有内容都在机框内闭环流转。

---

## 二、核心设计原则

### 2.1 手机机框（Phone Frame）

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
- 大图标 + 标题 + 描述 + 补充信息 的信息结构
- 可点击、可滑动、可展开

### 2.3 机框内闭环（In-Frame Closed Loop）

所有交互在机框内完成，不跳出：

| 操作 | 机框内响应 |
|------|-----------|
| 点击地图 | 弹出机框内地图 overlay，而非跳转新页面 |
| 查看详情 | 机框内弹窗/底部 sheet |
| 切换分类 | 机框内内容刷新 |
| 输入微调 | 机框内底部输入框 |
| 确认内容 | 机框内按钮点击 → 机框内展示结果 |

---

## 三、四大核心机框

### 📱 聊天机框（Chat Frame）

- **用途**：用户与 AI 对话的入口
- **内容**：逐句出现的对话气泡、打字机效果、分享卡片
- **特性**：
  - 用户消息在右侧（头像+气泡）
  - AI 消息在左侧（头像+气泡）
  - 消息逐句出现，带滚动动画
  - 底部输入栏（模拟真实聊天 App）

### 📱 确认机框（Confirm Frame）

- **用途**：中间确认环节，让用户输入微调意见
- **内容**：竖向数据卡片、输入框、确认按钮
- **出现时机**：对话流程结束后
- **特性**：
  - 粉色渐变头部（📋 请确认）
  - 按分组排列的竖向卡片
  - 每张卡片带分类标签（彩色区分）
  - 底部固定输入框 + 确认按钮
  - 卡片可点击打开详情

### 📱 结果机框（Result Frame）

- **用途**：展示最终生成的计划内容
- **内容**：时间线轴/分组轴 + 多维分类卡片
- **阶段切换**：准备中 / 进行中（默认）/ 已结束
- **特性**：
  - 时间线轴在机框顶部（可点击切换节点）
  - 分类卡片在机框中部（多维分类，大图标方块）
  - 内容列表在机框主体（竖向滑动卡片）
  - 地图 overlay 覆盖机框内容区（可返回）

### 📱 地图机框（Map Overlay）

- **用途**：在机框内全屏展示地图/图表
- **触发**：点击「路线示意」旁的「地图」小按钮
- **特性**：
  - 覆盖整个机框内容区域
  - 顶部返回按钮 + 标题
  - Leaflet 地图渲染（高德瓦片）
  - 标记点、路线、标签
  - 点击返回回到内容

---

## 四、卡片体系

### 4.1 确认卡片（Confirm Card）

```
┌─────────────────────────┐
│ ▓▓▓ 粉色渐变顶部条       │
│ 09:00        [分类A]      │
│ 🎯 项目名称               │
│ 📋 项目描述信息...        │
│ 💰 费用信息               │
└─────────────────────────┘
```

- 顶部彩色条（标识品牌）
- 时间 + 分类标签（彩色小徽章）
- 大图标（emoji）
- 标题（加粗）
- 描述（灰色，两行截断）
- 费用/补充信息（品牌色）

### 4.2 分类选择卡片（Category Selector）

```
┌────┐ ┌────┐ ┌────┐ ┌────┐
│ 🎯 │ │ 🍜 │ │ 🏨 │ │ 🚗 │
│ A  │ │ B  │ │ C  │ │ D  │
└────┘ └────┘ └────┘ └────┘
```

- 四个大方块卡片并排（数量可调整）
- 选中状态：粉色背景 + 白色图标
- 未选中状态：白色背景 + 灰色图标
- 点击切换内容

### 4.3 内容卡片（Content Card）

```
┌─────────────────────────┐
│ 🎯  项目标题             │
│     📋 项目描述信息       │
│     #标签1 #标签2         │
│              💰 费用信息   │
└─────────────────────────┘
```

- 左侧图标
- 标题 + 描述
- 标签（灰色小徽章）
- 右侧费用/补充信息

### 4.4 Checklist 卡片（Check Card）

```
┌─────────────────────────┐
│ ☑️ 待办事项               │
│ 📖 推荐参考资料           │
│ 🔗 快速流转入口           │
└─────────────────────────┘
```

- 复选框 + 标签
- 推荐参考资料链接
- 快速流转到 Agent 入口（按钮）
- 勾选后机框内下方动态生成确认卡片

---

## 五、交互流程（机框内闭环）

### 5.1 完整体验链路

```
[聊天机框]
用户 → 分享参考资料
用户 → 导入 Skill
AI  → 确认导入（打字机效果）
AI  → 导入成功（资源列表卡片）
用户 → 输入约束条件
AI  → 生成计划
用户 → 想看完整内容
AI  → 引导查看卡片
      ↓
[确认机框弹出]（替换聊天机框）
用户 → 浏览数据卡片
用户 → 输入微调意见（可选）
用户 → 点击「确认」
      ↓
[结果机框展示]（替换确认机框）
      ├── 准备中：Checklist 卡片
      │   └── 勾选 → 机框内下方生成确认卡片
      ├── 进行中（默认）：
      │   ├── 时间线轴（机框顶部，可点击）
      │   ├── 分类卡片（机框中部，可点击）
      │   ├── 内容卡片（机框主体，可滑动）
      │   └── 点击可视化 → 路线/图表 SVG
      │       └── 点击「地图」小按钮 → 地图 overlay（机框内全屏）
      │           └── 点击「返回」→ 回到内容
      └── 已结束：回顾（成果 + 感悟 + 讨论区）
```

### 5.2 机框切换动画

- 聊天机框 → 确认机框：淡入 + 上滑（新内容从下方滑入）
- 确认机框 → 结果机框：淡入 + 缩放（确认机框缩小，结果机框放大）
- 内容 → 地图 overlay：覆盖式弹出（从底部滑上或淡入覆盖）
- 地图 → 内容：返回按钮点击 → overlay 消失，露出下方内容

---

## 六、适用场景改造

| 场景 | 机框内展示 | 卡片分类 | 可视化替换 |
|------|-----------|---------|-----------|
| **旅行计划** | 行程卡片 | 玩/食/住/行 | 路线地图 |
| **学习规划** | 学习计划卡片 | 学/练/测/评 | 知识图谱 |
| **装修方案** | 装修卡片 | 设计/材料/预算/工期 | 户型图 |
| **健身计划** | 训练卡片 | 力量/有氧/饮食/恢复 | 身体数据图 |
| **活动策划** | 活动卡片 | 流程/物料/人员/场地 | 场地地图 |
| **产品原型** | 功能卡片 | 设计/开发/测试/上线 | 架构图 |

**核心不变：** 手机机框 → 卡片化应用 → 机框内闭环交互

---

## 七、数据结构

### 7.1 核心数据对象（通用版）

```javascript
const DEMO_DATA = {
  title: "🌸 项目标题",
  subtitle: "项目副标题描述",
  budget: {
    total: 3000,
    breakdown: {
      category1: { label: "分类1", amount: 800, icon: "✈️" },
      // ...
    }
  },
  participants: 1,
  dates: { start: "2026-05-01", end: "2026-05-04", days: 4 },
  locations: [
    { id: "loc1", name: "地点A", coordinates: [25.6065, 100.2676], days: [1, 2] },
    { id: "loc2", name: "地点B", coordinates: [26.8721, 100.2295], days: [3, 4] }
  ],
  schedule: [
    {
      day: 1, date: "5月1日", weekday: "周五", location: "地点A", theme: "阶段主题",
      spots: [
        {
          time: "09:00", title: "项目节点", desc: "...", cost: "费用信息",
          transport: "交通方式", duration: "1.5小时",
          location: [25.6065, 100.2676], icon: "✈️",
          tags: ["标签1", "标签2"],
          notes: ["💡 备注提示信息"]
        }
      ]
    }
  ],
  route: { segments: [ ... ] },
  tips: [ ... ]
};
```

### 7.2 自动分类规则

```javascript
function categorizeSpots() {
  // 根据标题+描述关键词自动分类
  // 示例分类维度（可自定义）：
  // 分类A: 关键词组1
  // 分类B: 关键词组2
  // 分类C: 关键词组3
  // 分类D: 关键词组4
  // 其余 → 默认分类
}
```

---

## 八、关键代码片段

### 8.1 手机机框 HTML

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
    <!-- 各阶段内容 -->
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
      <i class="fas fa-map-marked-alt"></i> 可视化展示
    </span>
  </div>
  <div class="map-overlay-body" id="phone-map"></div>
</div>
```

### 8.3 分类卡片

```javascript
const CAT_LABELS = {
  catA: { label: '分类A', color: '#ff6b35', bg: '#fff4ef' },
  catB: { label: '分类B', color: '#e91e63', bg: '#fdeff4' },
  catC: { label: '分类C', color: '#6366f1', bg: '#f0f0fe' },
  catD: { label: '分类D', color: '#0288d1', bg: '#e3f4fd' }
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

修改 `data.js` 中的 `DEMO_DATA`：
- `title`、`subtitle` → 你的主题
- `locations` → 地点列表 + 坐标
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

1. **机框即设备** — 用户看到的不是网页，是手中正在运行的手机
2. **卡片即应用** — 每个卡片都是一个微型应用，有独立的信息层级和交互
3. **闭环不跳出** — 所有操作在机框内完成，地图、详情、弹窗都在机框内
4. **对话即引导** — 逐句出现的对话自然推进流程，不是说明书
5. **确认即参与** — 中间确认让用户感到「这是我确认的内容」

---

*本 Skill 核心是「手机机框 + 卡片化应用」的展示模式，可复用于任何需要在机框内展示 AI 生成内容的场景。*
