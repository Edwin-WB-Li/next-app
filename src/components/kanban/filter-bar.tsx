"use client";

import { Search, X, Filter, User, Flag, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  toggleAssignee: (userId: string) => void;
  togglePriority: (priority: Priority) => void;
  toggleTag: (tag: string) => void;
  setSearch: (search: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const priorityDot: Record<Priority, string> = {
  P0: "bg-red-500",
  P1: "bg-orange-500",
  P2: "bg-blue-500",
  P3: "bg-gray-400",
};

export function FilterBar({
  users,
  allTags,
  filters,
  toggleAssignee,
  togglePriority,
  toggleTag,
  setSearch,
  clearFilters,
  hasActiveFilters,
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="text-muted-foreground/60 absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
        <Input
          placeholder="搜索..."
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-muted/50 focus-visible:bg-background focus-visible:border-border/60 h-8 w-44 border-transparent pr-7 pl-8 text-xs"
        />
        {filters.search ? (
          <button
            onClick={() => setSearch("")}
            className="text-muted-foreground/50 hover:text-muted-foreground focus-visible:ring-primary/50 absolute top-1/2 right-2 -translate-y-1/2 rounded focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
            aria-label="清除搜索"
          >
            <X className="h-3 w-3" />
          </button>
        ) : null}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={hasActiveFilters ? "secondary" : "ghost"}
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs font-medium"
          >
            <Filter className="h-3.5 w-3.5" />
            筛选
            {hasActiveFilters && (
              <span className="bg-primary text-primary-foreground ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold">
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
                <Avatar className="h-4 w-4">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-[6px]">{user.name[0]}</AvatarFallback>
                </Avatar>
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
          className="text-muted-foreground hover:text-foreground h-8 gap-1 px-2 text-xs"
        >
          <X className="h-3 w-3" />
          清除
        </Button>
      )}
    </div>
  );
}
