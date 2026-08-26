# Vue 迁移任务清单（按 P0/P1/P2）

## 目标与原则
- 目标：先保证 Vue 在当前后端接口下可用，再补齐功能并统一体验。
- 原则：以后端现状为唯一真值，不优先改后端去适配前端。

## Phase 1（P0，可用性修复）

### P0-1 统一帖子分页契约（列表 + 用户帖子）
- 范围
  - `frontend/src/stores/posts.js`
  - `frontend/src/views/PostsView.vue`
  - `frontend/src/views/UserPostsView.vue`
- 修改要点
  - 将前端分页请求从 `page/limit` 改为 `skip/limit`。
  - 将响应解析从 `items/page` 改为 `posts/skip`。
  - 统一页码换算：`page -> skip = (page - 1) * limit`。
- 验收标准
  - 首页与用户帖子页翻页结果正确。
  - 无错页、空页、重复页。

### P0-2 修复用户帖子接口路径
- 范围
  - `frontend/src/stores/posts.js`
- 修改要点
  - 将 `/api/posts/users/{userId}` 改为 `/api/users/{userId}/posts`。
- 验收标准
  - 访问 `/users/:userId/posts` 可正常加载数据。
  - 不再出现路径导致的 404。

### P0-3 修复鉴权状态判定
- 范围
  - `frontend/src/stores/auth.js`
  - `frontend/src/router/index.js`
  - `frontend/src/components/SiteHeader.vue`
- 修改要点
  - 在 auth store 增加 `isAuthenticated` getter（至少基于 token；推荐 token+user 双态策略）。
  - 确保 router guard 与头部一致使用该 getter。
- 验收标准
  - 登录后受保护路由可访问；登出后被拦截。
  - 头部导航按钮与真实登录态一致。

### P0-4 补齐注册 action
- 范围
  - `frontend/src/stores/auth.js`
  - `frontend/src/views/RegisterView.vue`
- 修改要点
  - 在 auth store 实现 `register(payload)`，调用 `POST /api/users`。
  - 明确注册后行为：跳登录或自动登录（建议先与 templates 保持“注册成功后登录”体验）。
- 验收标准
  - 注册页可成功提交并进入后续流程。
  - 重复邮箱/用户名报错可见。

### P0-5 统一未授权链路（401）
- 范围
  - `frontend/src/services/api.js`
  - `frontend/src/App.vue`（或全局入口）
  - `frontend/src/stores/auth.js`
- 修改要点
  - 收到 401 时执行：清理会话、保留目标路由、跳转登录。
- 验收标准
  - token 失效后任一受保护 API 请求都能回收会话并引导登录。

## Phase 2（P1，功能补齐）

### P1-1 补齐账户删除能力（templates 已有）
- 范围
  - `frontend/src/views/AccountView.vue`
  - `frontend/src/stores/auth.js`（若需协作）
- 修改要点
  - 增加 `DELETE /api/users/{id}` 操作与二次确认。
- 验收标准
  - 用户可删除自身账户并退出登录。

### P1-2 完善页面级错误状态
- 范围
  - `frontend/src/views/PostDetailView.vue`
  - `frontend/src/views/UserPostsView.vue`
  - `frontend/src/views/AccountView.vue`
- 修改要点
  - 区分 401/403/404/422 的页面提示与跳转。
- 验收标准
  - 各错误码在关键页面行为一致且可理解。

### P1-3 作者操作反馈统一
- 范围
  - `frontend/src/views/PostDetailView.vue`
  - `frontend/src/views/EditPostView.vue`
- 修改要点
  - 编辑/删除失败时统一提示（尤其 403/404）。
- 验收标准
  - 非作者无法误判为成功，作者失败可定位原因。

## Phase 3（P2，体验统一）

### P2-1 统一通知策略
- 范围
  - `frontend/src/services/api.js`
  - `frontend/src/components/NotificationList.vue`
  - 各 view 的局部提示
- 修改要点
  - 统一全局通知与页面内提示的职责边界，避免重复提示。
- 验收标准
  - 同一失败场景不重复弹错，跨页反馈稳定。

### P2-2 统一分页与时间格式体验
- 范围
  - `frontend/src/views/PostsView.vue`
  - `frontend/src/views/UserPostsView.vue`
  - `frontend/src/components/PostCard.vue`
- 修改要点
  - 分页交互一致；时间展示格式统一。
- 验收标准
  - 列表与详情风格一致，不影响功能判读。

### P2-3 明确 templates 回退策略
- 范围
  - 项目文档与发布策略
- 修改要点
  - 明确保留期限、切流阈值、回滚条件。
- 验收标准
  - 出现线上回归时可快速回退。

## 建议依赖顺序
1. P0-1 + P0-2（先打通帖子数据链路）
2. P0-3 + P0-4（再打通鉴权与注册）
3. P0-5（收口未授权链路）
4. P1 全部
5. P2 全部

## 后续实施验收（联调用例）
- 鉴权链路：注册 → 登录 → `/account` → 登出 → 受保护页拦截。
- 帖子链路：列表分页、详情、创建、编辑、删除（仅作者成功）。
- 用户链路：资料更新、头像上传/删除、用户帖子分页。
- 错误链路：401/403/404/422 提示与跳转一致。
- 契约链路：Vue API 调用路径、参数、响应字段与后端逐项对齐。
