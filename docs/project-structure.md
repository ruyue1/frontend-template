# 项目结构与代码放置规则

本文档以当前仓库为准，说明模块职责、依赖边界和平台维护区域。新增代码应先按职责归类，再通过已有入口完成组装。

## 目录与职责

```text
src/
├── apis/          接口请求与响应解包
├── assets/        经构建处理的图片、SVG 等资源
├── components/    可复用 UI 组件及通用授权组件
├── constants/     常量、资源键和页面路由声明
├── hooks/         可复用 React Hook
├── layout/        应用公共布局及布局专用组件
├── pages/         路由级业务页面
├── providers/     全局 Context 与鉴权状态提供者
├── routes/        React Router 路由树装配
├── styles/        全局主题、变量和基础样式
├── typings/       手写类型与生成类型的统一出口
└── utils/         无 UI 的可复用纯工具与路由转换逻辑

public/            不经打包处理、按原路径提供的静态文件
scripts/           构建或开发辅助脚本
devtools/          仅用于开发调试的工具
tests/             Jest 测试、测试配置与 mock
```

## 代码放置规则

- 一个可由路由直接访问的业务界面放在 `src/pages/<Feature>/`；页面特有的子组件、样式和状态可与页面同目录存放。
- 被两个及以上页面或布局复用的展示组件放在 `src/components/`；只服务于布局的组件放在 `src/layout/components/`。
- HTTP 调用、请求参数和响应解包放在 `src/apis/`。页面和组件不得直接重复实现 Axios 调用；共享请求能力通过 `src/apis/service.ts` 提供。
- 页面地址、菜单元数据、业务 `pageId` 和可选权限资源键统一声明在 `src/constants/routes.tsx`。业务页由 pageId 确定性转换：`asset_list` 对应 `src/pages/AssetList/index.tsx` 和 `/page/asset-list`。平台系统页可使用显式 `modulePath`。资源键集中维护在 `src/constants/resources.ts`。
- 跨模块类型放在 `src/typings/`，仅供某个模块内部使用的类型应优先就近放置。可复用状态逻辑放在 `src/hooks/`，无 React/UI 依赖的转换逻辑放在 `src/utils/`。
- 全局样式、主题和 Less 变量放在 `src/styles/`；组件或页面的局部样式应与其代码同目录，避免把业务样式写入全局文件。
- 构建期处理的资源放在 `src/assets/`，需要原样按 URL 提供的资源放在 `public/`。

## 层级依赖

推荐依赖方向如下：

```text
应用入口 / Provider / 路由
            ↓
      页面与公共布局
            ↓
组件、Hook、接口模块
            ↓
类型、常量、工具、样式与资源
```

- 上层可以组合下层；下层不得反向导入页面、布局、路由树或应用入口。
- `pages` 负责业务编排，不应成为公共组件、通用 Hook 或 API 模块的依赖来源。
- `constants/routes.tsx` 是页面路由、菜单和前端权限声明的唯一配置来源；`routes/` 只负责将该配置转换为 React Router 路由。
- 业务导航使用树形 `PageRouteDefinition`；根数组中的页面节点天然兼容扁平菜单。业务页面 URL 始终以 `/page/...` 开头，无路径目录仅用于菜单分组。
- 业务页面通过 `pageId` 自动发现和懒加载：pageId 必须为小写 snake_case，目录转换为 PascalCase，路由段将下划线转换为短横线。`utils/pageRoutes.tsx` 负责共享路由树生成，auth 的 `utils/route.tsx` 负责权限菜单过滤，`utils/protectedRoutes.tsx` 负责 `RouteGuard` 包装。
- 需要权限控制的页面仅在平台授权清单已绑定对应资源时设置 `resourceKey`；未设置时不参与前端业务权限判断，也不自动补充资源点。

## 平台托管与禁止直接修改区域

以下约束均由仓库中的明确标记、生成声明或生成命令证实；未列出的目录不应仅因属于模板骨架而被视为禁止修改。

| 区域 | 规则 | 正确修改方式 |
| --- | --- | --- |
| `src/constants/routes.tsx` 的 `XCODEAGENT_BUSINESS_ROUTES_START/END` 标记区 | 业务页面、目录和外链只能在标记之间添加；保留标记及其外部的基础授权路由。 | XcodeAgent 先按 pageId 创建页面目录，再在标记区内添加 `pageId`、菜单和可选 `resourceKey` 配置。 |

`scripts/sourcePathPlugin.mjs`、`devtools/elementInspector.ts` 和 `vite.config.ts` 属于开发辅助与构建集成代码，但当前仓库没有将它们标记为平台托管或禁止修改。变更这些文件前应评估对本地开发、源码定位和构建流程的影响，并同步补充测试。

## 新增业务页面清单

1. 在 `src/pages/<Feature>/` 创建页面，并将可复用部分拆分到正确的组件、Hook 或 API 模块。
2. 如需后端数据，在 `src/apis/` 增加接口封装，并在 `src/typings/` 声明或引用对应类型。
3. 在 `src/constants/routes.tsx` 的业务标记区注册 `pageId`、菜单信息与可选 `resourceKey`；不得手工填写业务页面 path。
4. 为路由转换、鉴权分支或页面关键交互补充 `tests/` 中的测试，并确认不引入逆向依赖。
