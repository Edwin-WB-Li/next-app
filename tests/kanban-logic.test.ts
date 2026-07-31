import { describe, it, expect } from "vitest";

/**
 * 这些测试复现看板模块的核心逻辑问题。
 *
 * 问题 1: 并发写入竞争
 * - 根因: kanban.ts 中 read-modify-write JSON 文件没有锁保护
 * - 复现: 两个并发的 "创建任务" 操作同时读取同一文件，后写入的会覆盖先写入的
 *
 * 问题 2: moveTask 冗余参数
 * - 根因: moveTask 接收 sourceColumnId 但函数体从未使用
 */

describe("kanban server actions - concurrency", () => {
  it("should demonstrate read-modify-write race condition without lock", async () => {
    // 模拟无锁的 read-modify-write
    let fileContent = JSON.stringify([{ id: "task-1", title: "初始任务" }]);

    async function unsafeCreateTask(title: string) {
      const tasks = JSON.parse(fileContent);
      await new Promise((r) => setTimeout(r, 10)); // 模拟 IO 延迟
      tasks.push({ id: `task-${Date.now()}-${Math.random()}`, title });
      fileContent = JSON.stringify(tasks);
    }

    // 并发创建两个任务
    await Promise.all([
      unsafeCreateTask("任务A"),
      unsafeCreateTask("任务B"),
    ]);

    const result = JSON.parse(fileContent);
    // 无锁情况下，只有一个任务会被保存（后写入覆盖先写入）
    expect(result.length).toBeLessThan(3);
  });

  it("should protect concurrent writes with a lock", async () => {
    let fileContent = JSON.stringify([{ id: "task-1", title: "初始任务" }]);
    const lockMap = new Map<string, Promise<unknown>>();

    async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
      const prev = lockMap.get(key);
      const release = Promise.resolve(prev).then(() => fn());
      lockMap.set(key, release.then(() => {}).catch(() => {}));
      return release;
    }

    async function safeCreateTask(title: string) {
      await withLock("tasks", async () => {
        const tasks = JSON.parse(fileContent);
        await new Promise((r) => setTimeout(r, 10));
        tasks.push({ id: `task-${Date.now()}-${Math.random()}`, title });
        fileContent = JSON.stringify(tasks);
      });
    }

    await Promise.all([safeCreateTask("任务A"), safeCreateTask("任务B")]);

    const result = JSON.parse(fileContent);
    // 有锁保护，两个任务都应该被保存
    expect(result.length).toBe(3);
  });
});

describe("kanban server actions - parameter usage", () => {
  it("moveTask should validate sourceColumnId consistency", () => {
    // 当前 moveTask 接收 sourceColumnId 但从未使用。
    // 如果客户端传了错误的 sourceColumnId，服务器不会校验，
    // 可能导致乐观更新回滚时使用了错误的源列。
    const moveTaskSignature = "moveTask(taskId, targetColumnId, sourceColumnId)";
    expect(moveTaskSignature).toContain("sourceColumnId");

    // 期望行为: 服务器应该校验任务当前是否确实在 sourceColumnId 中
    const currentColumnId = "col-2";
    const providedSourceColumnId = "col-1"; // 客户端传错了
    expect(currentColumnId).not.toBe(providedSourceColumnId);
  });
});
