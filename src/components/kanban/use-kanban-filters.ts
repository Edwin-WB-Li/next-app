"use client";

import type { KanbanTask, Priority } from "@/lib/kanban-types";
import { useCallback, useMemo, useState } from "react";

export interface FilterState {
  search: string;
  assignees: string[];
  priorities: Priority[];
  tags: string[];
}

function filterTasks(tasks: KanbanTask[], filters: FilterState): KanbanTask[] {
  return tasks.filter((task) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchId = task.id.toLowerCase().includes(q);
      if (!matchTitle && !matchId) return false;
    }
    if (filters.assignees.length > 0 && !filters.assignees.includes(task.assignee ?? "")) {
      return false;
    }
    if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) {
      return false;
    }
    if (filters.tags.length > 0 && !task.tags.some((t) => filters.tags.includes(t))) {
      return false;
    }
    return true;
  });
}

export function useKanbanFilters(allTasks: KanbanTask[]) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    assignees: [],
    priorities: [],
    tags: [],
  });

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    allTasks.forEach((t) => t.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [allTasks]);

  const filteredTasks = useMemo(() => filterTasks(allTasks, filters), [allTasks, filters]);

  const toggleAssignee = useCallback((userId: string) => {
    setFilters((prev) => {
      const next = prev.assignees.includes(userId)
        ? prev.assignees.filter((id) => id !== userId)
        : [...prev.assignees, userId];
      return { ...prev, assignees: next };
    });
  }, []);

  const togglePriority = useCallback((priority: Priority) => {
    setFilters((prev) => {
      const next = prev.priorities.includes(priority)
        ? prev.priorities.filter((p) => p !== priority)
        : [...prev.priorities, priority];
      return { ...prev, priorities: next };
    });
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setFilters((prev) => {
      const next = prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags: next };
    });
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters((prev) => ({ ...prev, assignees: [], priorities: [], tags: [] }));
  }, []);

  const hasActiveFilters =
    filters.assignees.length > 0 || filters.priorities.length > 0 || filters.tags.length > 0;

  return {
    filters,
    allTags,
    filteredTasks,
    toggleAssignee,
    togglePriority,
    toggleTag,
    setSearch,
    clearFilters,
    hasActiveFilters,
  };
}
