"use client";

import Link from "next/link";
import { memo } from "react";
import { IconArrowRight } from "@/shared/components/icons";

function CtaSection() {
  return (
    <section className="py-12">
      <div className="flex flex-col items-center rounded-2xl border border-border bg-muted/50 px-6 py-10 text-center">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">
          开始创作你的故事
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          记录技术成长、分享生活感悟，让每一次思考都留下痕迹。
        </p>
        <Link
          href="/admin"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          前往后台
          <IconArrowRight />
        </Link>
      </div>
    </section>
  );
}

export default memo(CtaSection);
