# jfrs Candy Admin

轻量级博客管理后台，使用 Vue 3、Vite 与 Element Plus 构建。

该仓库包含前端管理面板，用于管理文章、分类、标签以及站点设置。

### 功能

- Vue 3 + Vite
- Pinia 状态管理
- Element Plus 组件库
- 个人资料与设置页、文章编辑器、仪表盘与基础认证流程

---

### 快速开始

1. 复制环境变量模板并根据需求修改：

```bash
cp .env.example .env.local
# 然后编辑 .env.local
```

2. 安装依赖：

```bash
pnpm install
```

3. 启动开发服务器：

```bash
pnpm dev
```

4. 打包生产环境：

```bash
pnpm build
```

5. 本地预览生产构建：

```bash
pnpm preview
```

说明：如果你使用 npm 或 yarn，请使用对应命令（npm install / npm run dev / 等）。

### 环境变量

项目使用 Vite，环境变量以 `VITE_` 前缀命名。参见 `.env.example` 获取完整列表。关键项包括：

- `VITE_API_BASE_URL` — 后端 API 基础地址（例如 http://localhost:3000）
- `VITE_API_TIMEOUT` — 请求超时时长（毫秒）
- `VITE_UPLOAD_URL` — 上传接口基础路径或 URL
- `VITE_APP_TITLE`、`VITE_APP_VERSION`、`VITE_APP_TECH_SUPPORT` — 在 UI 中展示

### 项目结构（重要目录）

- `src/api` — API 封装
- `src/views` — 页面视图
- `src/components` — 可复用组件
- `src/stores` — Pinia 状态管理
- `src/utils` — 工具函数

### 贡献

1. Fork 本仓库
2. 新建功能分支：`feat/your-feature`
3. 提交并推送代码
4. 提交 Pull Request 并描述你的改动

请遵循现有代码风格并在适当时添加测试。

---

### 许可证

MIT
