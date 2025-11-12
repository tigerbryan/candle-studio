# 🕯️ 香薰蜡烛 DIY 工作室

专业的香薰蜡烛配方计算器 - 帮助你精准计算用量、颜色、成本

## ✨ 功能特点

- 🎯 **多种蜡烛类型模板**：容器蜡、模具蜡、裱花蜡、淋面蜡、冰花蜡
- 📊 **智能配方计算**：基于"装水称重"法精准计算蜡材用量
- 🎨 **灵活的染色方案**：支持色块染料和液体染料两种方式
- 💰 **成本核算**：自动计算批次成本和单只成本（AUD）
- 💾 **数据持久化**：自动保存所有输入数据到本地
- 📱 **响应式设计**：支持桌面端和移动端

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 部署到 Vercel

#### 方法 1：通过 Vercel CLI（推荐）

1. 安装 Vercel CLI：
```bash
npm install -g vercel
```

2. 登录 Vercel：
```bash
vercel login
```

3. 部署项目：
```bash
cd /Users/bryanchen/candle-studio/candle-studio
vercel
```

4. 首次部署时，Vercel 会询问：
   - Set up and deploy? 选择 `Y`
   - Which scope? 选择你的账号
   - Link to existing project? 选择 `N`（第一次部署）
   - What's your project's name? 输入 `candle-studio` 或自定义名称
   - In which directory is your code located? 按 Enter（使用当前目录）

5. 部署到生产环境：
```bash
vercel --prod
```

#### 方法 2：通过 Vercel 网站

1. 访问 [Vercel](https://vercel.com)
2. 点击 "Add New Project"
3. 导入你的 Git 仓库
4. Vercel 会自动检测到 Vite 项目并配置好构建设置
5. 点击 "Deploy"

#### 方法 3：通过 GitHub（自动部署）

1. 将代码推送到 GitHub：
```bash
git add .
git commit -m "feat: 完成蜡烛工作室应用"
git push origin main
```

2. 在 Vercel 中：
   - 选择 "Import Project"
   - 连接 GitHub 仓库
   - 选择 `candle-studio` 仓库
   - Vercel 会自动配置并部署

之后每次 push 到 main 分支都会自动部署！

## 🛠️ 技术栈

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **LocalStorage** - 数据持久化

## 📦 项目结构

```
candle-studio/
├── src/
│   ├── constants.ts      # 常量定义（颜色、蜡材信息等）
│   ├── App.tsx            # 主应用组件
│   ├── main.tsx           # 应用入口
│   ├── index.css          # 全局样式（Tailwind）
│   └── App.css            # 组件样式
├── public/                # 静态资源
├── dist/                  # 构建输出
├── vercel.json            # Vercel 配置
├── tailwind.config.js     # Tailwind 配置
└── package.json           # 项目配置
```

## 📝 使用说明

1. **选择制作类型**：从容器蜡、模具蜡、裱花蜡等中选择
2. **选择配方方案**：每种类型都有多个推荐配方（标注最佳方案）
3. **设置库存优先级**：勾选你拥有的蜡材（464/454/C3/蜂蜡等）
4. **输入单价**：填写各种材料的单价（AUD）
5. **计算用量**：输入模具水重、数量、换算因子
6. **选择上色方式**：色块或液体染料
7. **查看配方**：系统自动计算并显示详细配方和成本

## 🎨 配方模板

### 容器蜡（玻璃杯/罐）
- 100% 大豆蜡
- 大豆 80% + 蜂蜡 20% ⭐ 最佳
- 100% 椰子蜡
- 更多配方...

### 模具/公仔蜡
- 蜂蜡 60% + 大豆 40% ⭐ 最佳
- 100% 蜂蜡
- 更多配方...

### 裱花/淋面蜡
- 464 55% + C3 30% + 蜂蜡 15% ⭐ 最佳
- 464 70% + C3 20% + 蜂蜡 10% ⭐ 最佳

### 冰花蜡
- 100% 冰花/晶体蜡 ⭐ 最佳

## 🔧 环境要求

- Node.js 18+ 
- npm 或 yarn
- 现代浏览器（支持 ES6+）

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

Made with ❤️ for candle makers
