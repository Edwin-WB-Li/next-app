测试用例测的是

- 功能性：功能是否正确工作

- 可靠性：各种情况下是否稳定（空值、错误、边界）

- 契约性：模块之间的约定是否被遵守（Props、API 参数）

- 不要测实现细节，要测行为契约


测试 React Server Component (RSC)

```tsx
- Server Component，直接在服务端渲染

- 不需要模拟浏览器事件

- 重点测试 props 处理和异步数据获取

- 可能需要使用 `renderToString` 或测试输出 JSX 结构
```

## Vitest — 测试框架核心 API

### 1. 测试结构

| API | 说明 |
| --- | --- |
| `describe(name, fn)` | 分组，把相关测试组织在一起 |
| `it(name, fn)` / `test(name, fn)` | 定义单个测试用例（两者完全等价） |
| `beforeAll(fn)` | 当前 describe 内所有测试开始前执行一次 |
| `afterAll(fn)` | 当前 describe 内所有测试结束后执行一次 |
| `beforeEach(fn)` | 每个测试开始前都执行 |
| `afterEach(fn)` | 每个测试结束后都执行 |

### 2. 断言（expect）

| API | 说明 |
| --- | --- |
| `expect(value).toBe(expected)` | 严格相等（`===`） |
| `expect(value).toEqual(expected)` | 深度相等（对象/数组内容比较） |
| `expect(value).toBeTruthy()` / `toBeFalsy()` | 是否为真/假值 |
| `expect(value).toBeNull()` / `toBeUndefined()` | 是否为 null / undefined |
| `expect(value).toContain(item)` | 数组/字符串是否包含某项 |
| `expect(value).toHaveLength(n)` | 数组/字符串长度是否为 n |
| `expect(fn).toThrow(error?)` | 函数是否抛出异常 |
| `expect(promise).resolves.toBe(x)` | Promise 成功时的断言 |
| `expect(promise).rejects.toThrow()` | Promise 失败时的断言 |

### 3. Mock 函数

| API | 说明 |
| --- | --- |
| `vi.fn()` | 创建一个 mock 函数 |
| `vi.fn(impl)` | 创建并指定默认实现 |
| `vi.spyOn(obj, method)` | 监听对象上的某个方法（不替换实现） |
| `vi.mock(module, factory?)` | Mock 整个模块 |
| `vi.stubGlobal(name, value)` | 全局变量 mock |


### @testing-library/react — React 组件测试工具

#### 1. 渲染

| API | 说明 |
| --- | --- |
| `render(<Component />)` | 渲染组件到虚拟 DOM |
| `renderHook(() => useHook())` | 专门测试 Hook |

#### 2. 查询 DOM（screen 对象上的方法）

按优先级排列（推荐优先使用上面的）：

| 优先级 | API | 说明 |
| ------ | --- | --- |
| 推荐 | `getByRole` | 通过 ARIA role 查找（最推荐，无障碍友好） |
| 推荐 | `getByLabelText` | 通过 label 文本查找表单元素 |
| 推荐 | `getByPlaceholderText` | 通过 placeholder 查找 |
| | `getByText` | 通过文本内容查找 |
| | `getByDisplayValue` | 通过当前值查找输入框 |
| | `getByAltText` | 通过 alt 属性查找图片 |
| | `getByTitle` | 通过 title 属性查找 |
| | `getByTestId` | 通过 data-testid 查找（最后手段） |

**查询前缀变体**：

| 前缀 | 行为 | 示例 |
| ---- | ---- | ---- |
| `getBy*` | 找一个，找不到报错 | `screen.getByRole("button")` |
| `queryBy*` | 找一个，找不到返回 null | `screen.queryByText("404")` |
| `findBy*` | 找一个，异步等待 | `await screen.findByText("加载完成")` |
| `getAllBy*` | 找多个，返回数组 | `screen.getAllByRole("listitem")` |
| `queryAllBy*` | 找多个，可能返回空数组 | `screen.queryAllByRole("option")` |
| `findAllBy*` | 找多个，异步等待 | `await screen.findAllByText("item")` |

**选择指南**：

- 确定元素必须存在 → `getBy*`
- 验证元素不存在 → `queryBy*`（返回 null 不会抛错）
- 元素异步出现（如数据加载后）→ `findBy*`

#### 3. 用户交互

| API | 作用 |
| --- | --- |
| `fireEvent.click(element)` | 模拟点击 |
| `fireEvent.change(input, { target: { value: "xxx" } })` | 模拟输入 |
| `fireEvent.submit(form)` | 模拟表单提交 |
| `fireEvent.focus(element)` / `blur(element)` | 模拟聚焦/失焦 |
| `fireEvent.keyDown(element, { key: "Enter" })` | 模拟键盘事件 |
| `fireEvent.mouseOver(element)` / `mouseOut` | 模拟鼠标悬停/离开 |

新版推荐：`@testing-library/user-event` 比 `fireEvent` 更接近真实用户行为。

```typescript
import userEvent from "@testing-library/user-event";

const user = userEvent.setup();
await user.click(button);
await user.type(input, "hello");
```

#### 4. 辅助方法

| API | 作用 |
| --- | --- |
| `waitFor(fn)` | 等待异步条件满足 |
| `act(fn)` | 包裹 React 状态更新（通常不需要手动调用） |
| `cleanup()` | 每次测试后自动清理 DOM（通常 afterEach 自动做） |

```typescript
await waitFor(() => {
  expect(screen.getByText("成功")).toBeInTheDocument();
});
```

### 三、jest-dom（自定义匹配器，配合 testing-library 使用）

安装后导入（如 `@testing-library/jest-dom`），可以大幅增强可读性：

| API | 作用 |
| --- | --- |
| `expect(el).toBeInTheDocument()` | 元素是否在文档中 |
| `expect(el).toBeVisible()` | 元素是否可见（非 `display: none` / `visibility: hidden`） |
| `expect(el).toHaveTextContent("xxx")` | 元素文本是否包含 |
| `expect(el).toHaveClass("btn-primary")` | 元素是否有某 class |
| `expect(el).toHaveAttribute("href", "/link")` | 元素属性是否符合 |
| `expect(el).toBeDisabled()` / `toBeEnabled()` | 是否禁用/可用 |
| `expect(el).toHaveValue("input-value")` | 表单元素值是否为 |
| `expect(el).toBeChecked()` | 复选框/单选框是否选中 |
| `expect(el).toHaveFocus()` | 元素是否获得焦点 |
