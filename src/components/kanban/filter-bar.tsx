"use client";

import * as React from "react";
import { Search, X, Filter, User, Flag, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { KanbanUser, Priority } from "@/lib/kanban-types";

export interface FilterState {
  search: string;
  assignees: string[];
  priorities: Priority[];
  tags: string[];
}

interface FilterBarProps {
  users: KanbanUser[];
  allTags: string[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const priorityDot: Record<Priority, string> = {
  P0: "bg-red-500",
  P1: "bg-orange-500",
  P2: "bg-blue-500",
  P3: "bg-gray-400",
};

export function FilterBar({ users, allTags, filters, onFiltersChange }: FilterBarProps) {
  const hasActiveFilters =
    filters.assignees.length > 0 ||
    filters.priorities.length > 0 ||
    filters.tags.length > 0;

  const toggleAssignee = (userId: string) => {
    const next = filters.assignees.includes(userId)
      ? filters.assignees.filter((id) => id !== userId)
      : [...filters.assignees, userId];
    onFiltersChange({ ...filters, assignees: next });
  };

  const togglePriority = (priority: Priority) => {
    const next = filters.priorities.includes(priority)
      ? filters.priorities.filter((p) => p !== priority)
      : [...filters.priorities, priority];
    onFiltersChange({ ...filters, priorities: next });
  };

  const toggleTag = (tag: string) => {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: next });
  };

  const clearFilters = () => {
    onFiltersChange({ search: filters.search, assignees: [], priorities: [], tags: [] });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
        <Input
          placeholder="搜索..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="h-8 w-44 pl-8 pr-7 text-xs bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-border/60"
        />
        {filters.search && (
          <button
            onClick={() => onFiltersChange({ ...filters, search: "" })}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={hasActiveFilters ? "secondary" : "ghost"}
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium px-2.5"
          >
            <Filter className="h-3.5 w-3.5" />
            筛选
            {hasActiveFilters && (
              <span className="ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {filters.assignees.length + filters.priorities.length + filters.tags.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="flex items-center gap-1.5 text-xs">
            <User className="h-3 w-3" />
            负责人
          </DropdownMenuLabel>
          {users.map((user) => (
            <DropdownMenuCheckboxItem
              key={user.id}
              checked={filters.assignees.includes(user.id)}
              onCheckedChange={() => toggleAssignee(user.id)}
              className="text-xs"
            >
              <div className="flex items-center gap-2">
                <img src={user.avatar} alt="" className="h-4 w-4 rounded-full" />
                {user.name}
              </div>
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="flex items-center gap-1.5 text-xs">
            <Flag className="h-3 w-3" />
            优先级
          </DropdownMenuLabel>
          {(["P0", "P1", "P2", "P3"] as Priority[]).map((p) => (
            <DropdownMenuCheckboxItem
              key={p}
              checked={filters.priorities.includes(p)}
              onCheckedChange={() => togglePriority(p)}
              className="text-xs"
            >
              <span className={`mr-2 h-1.5 w-1.5 rounded-full ${priorityDot[p]}`} />
              {p}
            </DropdownMenuCheckboxItem>
          ))}

          {allTags.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center gap-1.5 text-xs">
                <Tag className="h-3 w-3" />
                标签
              </DropdownMenuLabel>
              {allTags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={filters.tags.includes(tag)}
                  onCheckedChange={() => toggleTag(tag)}
                  className="text-xs"
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground px-2"
        >
          <X className="h-3 w-3" />
          清除
        </Button>
      )}
    </div>
  );
}
