"use client";

import Link from "next/link";
import { memo } from "react";
import { IconArrowRight } from "@/shared/components/icons";

function CtaSection() {
  return (
    <section className="py-12">
      <div className="border-border bg-muted/50 flex flex-col items-center rounded-2xl border px-6 py-10 text-center">
        <h2 className="text-foreground text-xl font-bold sm:text-2xl">开始创作你的故事</h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          记录技术成长、分享生活感悟，让每一次思考都留下痕迹。
        </p>
        <Link
          href="/admin"
          className="bg-foreground text-background hover:bg-foreground/90 focus-visible:ring-ring focus-visible:ring-offset-background mt-5 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          前往后台
          <IconArrowRight />
        </Link>
      </div>
    </section>
  );
}

export default memo(CtaSection);
