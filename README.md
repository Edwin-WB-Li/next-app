This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## skills

```
code-review-and-quality    →  专业审查，抓代码质量和规范

systematic-debugging       →  审查中发现的问题，按流程定位根因

react-best-practices       →  前端性能专项审查（如果是 React 项目）

web-design-guidelines      →  UI 可访问性审查（如果涉及界面）

verification-before-completion →  审查后强制验证，没证据不算完成
```

### 需求描述
```
# 阶段 1：项目背景与目标
我在做一个 [React/Next.js] 项目，需要 [开发新功能 / 重构老模块]。
[如果是重构：目前代码库的 [用户/订单] 模块耦合严重，需要优化架构]

# 阶段 2：设计要求
- 视觉风格要 [独特/专业/粗野主义/极简]，不要 AI 默认审美
- 必须通过 UI 可访问性规范（键盘导航、对比度、错误提示清晰）

# 阶段 3：架构要求
- [如果是重构：先分析现有架构问题，给出模块拆分方案]
- 组件设计要用可扩展的组合模式，避免 props 膨胀

# 阶段 4：实现要求
- 开发流程走 TDD，先写测试再写实现
- 代码必须符合 React 性能最佳实践（避免瀑布请求、不必要的重渲染）

# 阶段 5：验收要求
- 完成后做代码审查，检查逻辑、安全、性能
- 必须通过验证才能算完成
- [如果有 Bug：用系统化调试流程定位根因，不要猜]
```

---

我在做一个 Next.js + Typescript + tailwind 项目，需要在项目中开发一个答题系统功能。要求视觉风格独特，不要千篇一律的 AI 审美。开发时先写测试再写实现，走 TDD 流程。代码要符合 React 性能最佳实践，最终页面要通过 可访问性和 UI 规范审查

大致需求：

1. 题库管理

  题型支持：单选、多选、判断、填空、简答、编程题、组合题
  题目属性：难度等级（易/中/难）、知识点标签、分值、答案解析
  导入导出：Excel/Word/JSON 批量导入，支持模板下载
  题库分类：按科目、章节、知识点多级分类
  题目查重：导入时检测重复题目

2. 试卷/练习管理

  组卷方式：固定试卷、随机抽题、按规则组卷（按难度/知识点比例）
  试卷设置：总分、及格线、允许重考次数、成绩是否公开
  模式区分：练习模式（即时看答案）vs 考试模式（交卷后看答案）

3. 答题体验

  答题界面：题目导航栏、标记不确定题目、已答/未答状态
  时间控制：倒计时显示、到时自动交卷、提前交卷
  进度保存：意外刷新恢复答题进度（localStorage/服务端）
  防作弊：切屏检测、禁止复制粘贴、乱序出题、选项乱序

4. 评分与反馈

  自动评分：客观题即时评分，主观题人工/AI辅助评分
  成绩分析：正确率、耗时分析、知识点薄弱点分析
  答案解析：交卷后查看详细解析、标准答案、相关知识点
  排行榜：分数排名、用时排名

5. 用户个人中心

  错题本：自动收录错题，支持反复练习
  收藏题目：标记重点题目
  历史记录：考试/练习历史、成绩趋势图
  学习报告：周/月学习统计

6. 管理后台

  用户管理：考生列表、分组管理、权限控制
  考试监控：查看正在进行中的考试、强制交卷
  成绩管理：成绩导出、成绩分析报表
  通知公告：发布考试通知、系统公告

7. 技术/体验优化

  响应式设计：适配 PC、平板、手机
  暗色模式：支持主题切换
  多语言：中英文切换
  离线支持：PWA 离线答题（可选）

  