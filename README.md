# 📅 DayPlan · 轻日程

极简、开箱即用的网页版日程管理工具。打开浏览器即用，数据存储在浏览器本地，无需注册登录。

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

## 🌐 在线体验

👉 **[dayplan.vercel.app](https://test-omega-inky-39.vercel.app/)**

## ✨ 功能

| 功能 | 说明 |
|------|------|
| 📋 **日/周/月三视图** | 日视图事件列表、周视图七列卡片、月视图日历网格 |
| ⚡ **自然语言快速添加** | 输入「明天下午3点面试」自动解析日期和时间 |
| 🏷️ **六色标签图标** | 💼工作 🔥紧急 💬会议 🏠个人 ❤️健康 📌其他 |
| 💾 **本地存储** | localStorage 持久化，刷新/关闭不丢失 |
| ⌨️ **键盘快捷键** | `N` 新建、`← →` 切换日期、`Esc` 关闭弹窗 |
| 📱 **响应式布局** | 桌面、平板、手机均可使用 |
| 🔄 **拖拽调整** | 日视图中拖拽日程卡片即可调整时间 |
| ↩️ **撤销删除** | 删除后 3 秒内可撤销 |

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/wzbis666/test.git
cd test

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build
```

浏览器打开 `http://localhost:5173` 即可使用。

## 🧠 自然语言解析

在顶部输入框直接输入，支持以下格式：

| 输入 | 解析结果 |
|------|----------|
| `明天下午3点面试` | 明天 15:00–16:00 「面试」 |
| `周三 14:00 周会` | 本周三 14:00–15:00 「周会」 |
| `产品评审 09:00-10:30` | 今天 09:00–10:30 「产品评审」 |
| `后天 10:00 看牙` | 后天 10:00–11:00 「看牙」 |
| `下周一 9点 站会` | 下周一 09:00–10:00 「站会」 |
| `7月25日 全天 团建` | 7月25日 09:00–18:00 「团建」 |
| `下午4点健身` | 今天 16:00–17:00 「健身」 |

## 🛠 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite |
| 样式 | CSS Modules |
| 日期 | dayjs |
| ID 生成 | nanoid |
| 部署 | Vercel / GitHub Pages |

## 📁 项目结构

```
src/
├── main.tsx                    # 入口
├── App.tsx                     # 根组件（路由、键盘快捷键、localStorage 同步）
├── types/index.ts              # 类型定义 + 标签配置
├── context/AppContext.tsx      # 全局状态 (useReducer)
├── hooks/
│   ├── useLocalStorage.ts      # 持久化 hook
│   └── useEvents.ts           # 日程 CRUD
├── utils/
│   ├── date.ts                 # dayjs 工具函数
│   ├── id.ts                   # nanoid 封装
│   └── parser.ts               # 自然语言时间解析器
├── styles/global.css           # 全局样式 + CSS 变量
└── components/
    ├── Header/                 # 顶部导航（日期 + 视图切换）
    ├── DayView/                # 日视图（事件列表 + 快速添加）
    ├── WeekView/               # 周视图（7 列卡片）
    ├── MonthView/              # 月视图（日历网格）
    ├── EventCard/              # 日程卡片
    ├── EventModal/             # 新建/编辑弹窗
    └── Toast/                  # 轻提示（撤销删除）
```

## 🔧 数据结构

```typescript
interface Event {
  id: string;            // nanoid 唯一 ID
  title: string;         // 日程标题
  date: string;          // 日期 YYYY-MM-DD
  startTime: string;     // 开始时间 HH:mm
  endTime: string;       // 结束时间 HH:mm
  tag: TagColor;          // 标签：red | orange | blue | green | purple | gray
  note: string;           // 备注
  createdAt: number;      // 创建时间戳
  updatedAt: number;      // 更新时间戳
}
```

## 🎨 设计风格

温暖极简风格，借鉴 Todoist 设计哲学——列表优先、快速添加、克制配色、大量留白。

## 📄 License

MIT
