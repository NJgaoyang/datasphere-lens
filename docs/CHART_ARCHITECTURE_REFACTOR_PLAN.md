# DataSphere Lens 图表架构重构执行计划

## 1. 目标

将当前 Datart 图表体系逐步重构为：

`Chart Registry + ChartSpec + Renderer + Config Schema + Visual Plugin`

目标不是一次性重写全部图表，而是在保持现有图表可用、Dashboard 可用、历史配置可打开的前提下，建立一套可扩展到 100+ 图表的统一架构。

## 2. 当前代码现状

当前前端目录：`frontend/src/app`。

已存在的关键能力：

- `models/ChartManager.ts`：当前内置图表注册与插件图表加载入口。
- `models/PluginChartLoader.ts`：当前自定义 JS 图表插件加载器。
- `components/ChartGraph/*`：各类图表实现。
- `components/ChartGraph/*/config.ts`：各图表数据槽位、样式、设置、交互配置。
- `types/ChartConfig.ts`：现有配置 Schema 类型。
- `migration/*`：已有图表、Dashboard、View 配置迁移机制。
- 已依赖 `echarts`、`@antv/g2`、`@antv/s2`、`react-grid-layout`、`monaco-editor`。

当前主要问题：

1. `ChartManager._basicCharts()` 硬编码所有内置图表。
2. 内置图表与外部 Plugin Chart 使用两套生命周期和注册方式。
3. 图表类型与 ECharts 实现耦合较重。
4. `ChartConfig` 已具备 Schema 雏形，但还没有形成稳定、统一的 Config Schema 协议。
5. 新增图表仍需要修改多个位置，扩展成本高。
6. 历史配置兼容风险较高，必须依赖 migration 渐进迁移。

## 3. 重构原则

- 不删除现有 ChartGraph，实现双轨兼容后再逐步迁移。
- 不直接把 ECharts Option 作为持久化协议。
- 新架构所有图表统一走 Registry。
- 内置图表和第三方图表统一成 Visual Plugin。
- Renderer 只负责渲染，不负责业务字段定义。
- Config Schema 只描述配置项，不直接绑定具体页面。
- ChartSpec 必须有 `version`，所有历史配置通过 migration 转换。
- 每一阶段只测试本阶段修改的核心链路，不做无意义的全量回归。

## 4. 目标目录结构

```text
frontend/src/app/visualization/
  core/
    ChartSpec.ts
    ChartData.ts
    ChartContext.ts
    FieldBinding.ts
  registry/
    ChartRegistry.ts
    RendererRegistry.ts
  renderer/
    VisualRenderer.tsx
    echarts/EChartsRenderer.tsx
    table/TableRenderer.tsx
    s2/S2Renderer.tsx
  config/
    ConfigSchema.ts
    ConfigPanel.tsx
    ConfigItemRenderer.tsx
```  fields/
    FieldBindingPanel.tsx
    FieldSlot.tsx
  builders/
    echarts/
      common/
      bar.ts
      line.ts
      pie.ts
      scatter.ts
  plugins/
    bar/
    line/
    pie/
    table/
  migration/
    migrateChartSpec.ts
```

## 5. 第一阶段：建立兼容层和核心协议

### 5.1 新增 ChartSpec

新增 `visualization/core/ChartSpec.ts`，定义与具体渲染引擎无关的持久化协议。

最少包含：`version`、`type`、`datasetId`、`dimensions`、`measures`、`filters`、`sorts`、`encoding`、`options`、`interactions`。

约束：ChartSpec 中禁止保存完整 `EChartsOption`，禁止把 ECharts `series/xAxis/grid` 直接作为核心协议。

### 5.2 新增 ChartRegistry

新增 `visualization/registry/ChartRegistry.ts`，负责 Visual Plugin 注册、查找、分类、能力查询。

第一阶段保留 `ChartManager`，由 ChartManager 适配 Registry，避免立即影响 ChartWorkbench 和 Dashboard。

### 5.3 新增 RendererRegistry

新增 `visualization/registry/RendererRegistry.ts`，统一注册渲染器：

- `echarts`
- `table`
- `s2`
- 后续可增加 `g2`、`maplibre`、`g6`。

### 5.4 新增 VisualRenderer

新增统一渲染入口 `visualization/renderer/VisualRenderer.tsx`。

流程固定为：

`ChartSpec -> ChartRegistry -> Visual Plugin -> RendererRegistry -> Renderer`

验收标准：在不修改现有 Bar/Line/Pie 实现的情况下，可以通过 VisualRenderer 调用兼容适配器渲染一个现有图表。

## 6. 第二阶段：统一 Config Schema

复用当前 `types/ChartConfig.ts` 的 datas/styles/settings/interactions 思路，不直接全部推翻。

先新增一层新的稳定接口 `visualization/config/ConfigSchema.ts`，提供：

- 字段槽位 Schema
- 样式 Schema
- 设置 Schema
- 交互 Schema
- 默认值
- 条件显示/禁用规则

实现 `ConfigPanel` 和 `ConfigItemRenderer`，优先映射现有 FormGenerator 组件，避免重新开发全部表单控件。

## 7. 第三阶段：迁移第一批核心图表

第一批只迁移四类：

1. 柱状图族：Cluster/Stack/Percentage Stack Column/Bar。
2. 折线图：LineChart。
3. 饼图族：Pie/Doughnut/Rose。
4. 表格：MingXiTable/PivotSheet。

迁移方法：

- 每个图表创建 `plugins/<type>/definition.ts`。
- 定义 `type/name/category/icon/renderer/fieldSlots/configSchema/capabilities`。
- ECharts 图表增加 builder，将 ChartSpec + 查询结果转换成 ECharts Option。
- 表格根据类型路由到普通 Table 或 S2 Renderer。
- ChartManager 改成从 Registry 读取新图表，同时继续兼容未迁移旧图表。

验收标准：

- 图表工作台可选择四类新架构图表。
- 字段拖拽、聚合、过滤、排序正常。
- 样式配置正常。
- 保存后重新打开正常。
- Dashboard 中显示正常。
- 钻取、联动至少完成现有主要能力回归。

## 8. 第四阶段：ChartSpec 持久化与迁移

新增 `visualization/migration/migrateChartSpec.ts`。

ChartSpec 必须从 v1 开始版本化。

保存策略：短期继续兼容现有 chart config DTO，同时生成新的 ChartSpec；稳定后再切换为 ChartSpec 为主协议。历史图表打开时执行：

`Legacy ChartConfig -> Adapter -> ChartSpec v1`

新版本升级时执行：

`ChartSpec vN -> migration -> ChartSpec latest`

验收标准：已有 Dashboard 和 ChartWorkbench 中的历史图表不丢字段、不丢样式、不出现白屏。

## 9. 第五阶段：统一 Visual Plugin

定义统一插件接口：

- `manifest/definition`
- `configSchema`
- `fieldSlots`
- `builder`
- `renderer`
- `capabilities`
- `version`

将现有 `PluginChartLoader` 改造成 Visual Plugin Loader 的兼容入口。

现有外部 JS 插件继续支持，但内部先转换为统一 PluginDefinition 后再注册到 ChartRegistry。

目标：内置图表与外部插件在 Registry 层不再区分两套调用方式。

## 10. 第六阶段：批量迁移剩余图表

第二批：Area、StackArea、Scatter、Radar、Funnel、Gauge、Scorecard、Waterfall、WordCloud。

第三批：DoubleY、地图、关系型图表、更多统计图表。

第四批：G2/G6/MapLibre/D3 等扩展 Renderer，仅在 ECharts 不适合的场景引入。

原则：优先通过一个核心 Renderer 派生多种视觉类型，不为每个细分图表复制完整实现。


### 第六阶段当前进度

- [x] Area、StackArea、Scatter、Radar、Funnel、Gauge、Waterfall、WordCloud 已接入统一 ECharts Renderer。
- [x] StackColumn、StackBar、PercentageStackColumn、PercentageStackBar、Doughnut、Rose 已接入统一 ECharts Renderer。
- [x] DoubleY 已接入统一 ECharts Renderer。
- [x] PivotSheet 已建立独立 S2 Renderer 边界。
- [x] Scorecard、RichText 已建立独立 React Renderer 边界。
- [x] Outline Map、Scatter Outline Map 已建立独立 Map Renderer 边界并保留现有资源加载兼容。
- [x] 关系型/统计型新图表已新增纯 V2 Visual Plugin：Sankey、Graph、Tree、Treemap、Sunburst、Heatmap、Boxplot。
- [ ] G2/G6/MapLibre/D3 Renderer 按实际新增图表需要再引入，避免提前增加依赖和复杂度。

## 11. 开发任务拆分

### P0：架构骨架

- [x] 创建 `visualization/core`。
- [x] 创建 `ChartSpec`、`FieldBinding`、`ChartContext`。
- [x] 创建 `ChartRegistry`。
- [x] 创建 `RendererRegistry`。
- [x] 创建 `VisualRenderer`。
- [x] 建立 Legacy Chart Adapter。
- [x] 为 Registry/Adapter 添加单元测试。

### P1：配置体系

- [x] 创建新版 `ConfigSchema`。
- [x] 创建统一 `ConfigPanel`。
- [x] 复用现有 FormGenerator 控件。
- [x] 创建统一 FieldSlot/FieldBindingPanel。
- [x] 加入 Schema 校验和默认值合并。

### P2：第一批图表

- [x] Bar Visual Plugin。
- [x] Line Visual Plugin。
- [x] Pie Visual Plugin。
- [x] Table Visual Plugin。
- [x] ECharts Builder 公共 axis/legend/tooltip/label/theme。
- [x] S2/Table Renderer 适配。

### P3：持久化兼容

- [x] ChartSpec v1 migration。
- [x] Legacy config -> ChartSpec adapter。
- [x] 保存/读取双协议兼容。
- [x] Dashboard 历史图表回归。
### P4：插件统一与扩展

- [x] 定义统一 Visual Plugin Manifest。
- [x] 改造 `PluginChartLoader` 为兼容适配器。
- [x] ChartManager 内置硬编码逐步移除。
- [x] 图表选择器改为 Registry 驱动。
- [x] 支持按 category/capability 动态展示。
- [x] 增加插件异常隔离和降级页。


### 架构验收补充

- [x] 纯 V2 插件无需新增 `ChartGraph` 类即可进入 Chart Registry。
- [x] 纯 V2 插件可通过 `VisualPluginChartAdapter` 自动兼容现有 ChartWorkbench。
- [x] ChartManager 集成测试确认纯 V2 插件可被现有图表选择器发现。
- [x] 新增关系/统计图表仅增加 Plugin + Schema + Builder，没有修改 ChartManager 图表硬编码清单。

## 12. 测试策略

遵循“修改哪里，重点验证哪里”的方式，不要求每次全量回归。

每个阶段至少执行：

1. `npm run checkTs`，保证新增类型无错误。
2. 针对新增 Registry、Adapter、Builder 执行 Vitest。
3. 手工打开本阶段迁移的核心图表。
4. 验证创建、配置、保存、刷新、重新打开。
5. 如果修改交互，额外验证钻取和联动。
6. 如果修改 Dashboard Renderer，额外验证 Dashboard 展示。

第一批图表完成后再做一次集中回归：Bar、Line、Pie、Table + 一个旧图表，证明新旧体系可并存。

## 13. 每阶段提交策略

建议拆成独立提交，便于回滚：

- `refactor(chart): add visualization core contracts`
- `refactor(chart): add chart and renderer registries`
- `refactor(chart): add config schema adapter`
- `refactor(chart): migrate bar visual plugin`
- `refactor(chart): migrate line and pie plugins`
- `refactor(chart): migrate table visual plugin`
- `refactor(chart): add chart spec migration`
- `refactor(chart): unify visual plugin loader`

不得把现有未提交的页面修改混入本次图表架构提交。

## 14. 完成标准

本轮重构完成的判断标准不是“所有图表都重写完”，而是：

- 新增图表不再要求修改 `ChartManager._basicCharts()`。
- 新增图表通过 Visual Plugin 注册即可进入图表选择器。
- 图表配置由统一 Config Schema 驱动。
- ECharts Option 由 Builder 生成，不进入核心持久化协议。
- ChartSpec 有版本和 migration。
- 内置图表、历史图表、第三方插件能在统一 Registry 下运行。
- 第一批 Bar/Line/Pie/Table 已完整跑通编辑、保存、加载、Dashboard 展示链路。
- 后续新增 1 个图表原则上只需要增加 Plugin + Schema + Builder（必要时增加 Renderer）。

## 15. 推荐实施顺序

第一步只做 P0，不迁图表；骨架稳定后再开始 P1。

第二步完成 P1 后，只迁 Bar，确认字段、配置、保存、渲染全链路。

第三步复制成熟模式迁移 Line/Pie/Table，而不是四类并行开发。

第四步完成 ChartSpec migration 和历史兼容，再批量迁移剩余图表。

第五步才引入新的 Renderer 或大量新增图表，避免架构尚未稳定时扩大范围。

## 16. 本次禁止事项

- 不一次性删除 `components/ChartGraph`。
- 不一次性重写全部 ChartConfig。
- 不在第一阶段引入大量新依赖。
- 不修改无关数据源、数据集、调度模块。
- 不将现有未提交的 SelectDataSource/StructView 修改混入本任务。
- 不在单个提交中同时做架构、UI 大改和几十种图表迁移。

执行计划文件位置：`/root/datasphere-lens/docs/CHART_ARCHITECTURE_REFACTOR_PLAN.md`
