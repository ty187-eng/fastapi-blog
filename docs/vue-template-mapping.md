# Vue 与 Templates 页面能力对照（以后端 API 现状为准）

## 对照基线
- 后端接口真值：`/api/posts`、`/api/users/*`（以当前 `routers/posts.py`、`routers/users.py`、`schemas.py` 为准）。
- 本文聚焦可用性与契约，不比较视觉样式。
- 判定维度：功能一致、Vue 缺失、Vue 新增、行为不一致。

## 页面映射矩阵

### 1) `templates/home.html` ↔ `frontend/src/views/PostsView.vue`
- 功能一致
  - 帖子列表展示与翻页入口。
- Vue 缺失
  - 无明显功能性缺失（以当前代码看主要问题在契约，而非页面能力）。
- Vue 新增
  - 使用 store 统一帖子状态（`frontend/src/stores/posts.js`）。
- 行为不一致
  - **P0**：Vue 当前使用 `page/limit` 请求参数，但后端为 `skip/limit`。
  - **P0**：Vue 当前读取 `data.items`、`data.page`，后端返回 `posts`、`skip`。

### 2) `templates/login.html` ↔ `frontend/src/views/LoginView.vue`
- 功能一致
  - 都调用 `POST /api/users/token` 完成登录。
- Vue 缺失
  - 细粒度错误文案（401/422）可进一步统一。
- Vue 新增
  - 路由 `next` 参数回跳能力（由 router guard 支持）。
- 行为不一致
  - **P0**：`auth` store 缺少 `isAuthenticated`，但路由与头部使用该字段，导致登录态判断异常。

### 3) `templates/register.html` ↔ `frontend/src/views/RegisterView.vue`
- 功能一致
  - 注册表单能力。
- Vue 缺失
  - 无（但实现未打通）。
- Vue 新增
  - 无关键新增。
- 行为不一致
  - **P0**：`RegisterView` 调用 `auth.register(...)`，但 `frontend/src/stores/auth.js` 未实现 `register`。

### 4) `templates/account.html` ↔ `frontend/src/views/AccountView.vue`
- 功能一致
  - 用户资料更新、头像上传与头像删除。
- Vue 缺失
  - **P1**：账户删除能力（templates 已支持删除账户，Vue 缺失）。
- Vue 新增
  - 局部响应式状态管理（编辑体验更前端化）。
- 行为不一致
  - **P1**：若未提供账户删除，迁移后能力回退。

### 5) `templates/post.html` ↔ `frontend/src/views/PostDetailView.vue`
- 功能一致
  - 帖子详情、作者可编辑/删除。
- Vue 缺失
  - 无关键缺失。
- Vue 新增
  - 基于前端路由的详情页跳转。
- 行为不一致
  - **P1**：错误态（404/403）文案与跳转策略需与 templates 统一。

### 6) `templates/user_posts.html` ↔ `frontend/src/views/UserPostsView.vue`
- 功能一致
  - 指定用户帖子列表与分页。
- Vue 缺失
  - 无关键缺失。
- Vue 新增
  - 可与全局 store 共享帖子状态。
- 行为不一致
  - **P0**：Vue 当前调用 `/api/posts/users/{userId}`，后端真实路径是 `/api/users/{user_id}/posts`。
  - **P0**：Vue 当前分页参数/响应字段仍使用 `page/items`，后端为 `skip/posts`。

### 7) `templates/error.html` ↔ `frontend/src/views/NotFoundView.vue`
- 功能一致
  - 404 页面兜底。
- Vue 缺失
  - **P1**：401/403/422 页面级反馈体系较弱，主要依赖通知。
- Vue 新增
  - 前端路由级兜底可覆盖未知路径。
- 行为不一致
  - **P1**：不同错误码的展示与跳转未形成统一规范。

### 8) `templates/layout.html` ↔ `frontend/src/components/SiteHeader.vue` + `frontend/src/App.vue`
- 功能一致
  - 导航栏登录态切换、退出登录。
- Vue 缺失
  - 无关键缺失。
- Vue 新增
  - 主题切换与通知中心。
- 行为不一致
  - **P0**：登录态依赖 `auth.isAuthenticated`，当前 store 未提供，导致导航与路由守卫异常。

## 接口契约差异汇总（后端真值 vs Vue 现状）
- `GET /api/posts`
  - 后端：`skip` + `limit`；响应 `{ posts, total, skip, limit, has_more }`。
  - Vue 现状：发送 `page` + `limit`；读取 `{ items, page, has_more, total }`。
  - 结论：**P0**，会直接导致列表分页异常或空渲染。

- `GET /api/users/{user_id}/posts`
  - 后端路径：`/api/users/{user_id}/posts`。
  - Vue 现状：`/api/posts/users/{userId}`。
  - 结论：**P0**，路径错误会直接 404。

- 鉴权状态字段
  - 路由守卫与头部依赖：`auth.isAuthenticated`。
  - Vue auth store 现状：未提供 getter。
  - 结论：**P0**，登录态判断与访问控制不可靠。

- 注册调用
  - 页面调用：`auth.register(...)`。
  - Vue auth store 现状：无该 action。
  - 结论：**P0**，注册页无法工作。

## 鉴权与权限对照结论
- 登录入参：Vue 与 templates 都按 OAuth2 表单传 `username/password`，与后端 `/api/users/token` 一致。
- `401` 处理：`frontend/src/services/api.js` 已有全局拦截与未授权回调机制，但需与 router/store 行为统一（清 token、回登录、保留 next）。
- 页面权限：`/account`、`/posts/new`、`/posts/:id/edit` 由 router meta 控制，需以稳定的 `isAuthenticated` 为前提。
- 作者专属操作：前端按钮显示仅作体验优化，最终以后端 `403` 为准并统一错误提示。
