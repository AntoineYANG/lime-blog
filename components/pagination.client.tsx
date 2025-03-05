"use client";

import { useMemo, type FC } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

import { font } from "@cp/theme";
import Button from "@cp/button.client";

// TODO: i18n


export interface IPaginationProps {
  total: number;
  /** beginning from 0 */
  current: number;
  disabled?: boolean;
  onChange(value: number, ctx: { router: ReturnType<typeof useRouter> }): void;
}

const Pagination: FC<IPaginationProps> = ({ total, current, onChange, disabled }) => {
  const router = useRouter();
  
  const pages = useMemo(() => {
    const pagesSet = new Set<number>();
    pagesSet.add(0);
    for (let i = current - 1; i <= current + 2 && i < total; i++) {
      if (i >= 0) {
        pagesSet.add(i);
      }
    }
    if (total !== 0) {
      pagesSet.add(total - 1);
    }
    const allPages = Array.from(pagesSet).sort((a, b) => a - b);
    const labels: ({ type: "ellipsis" }|{ type: "page"; value: number })[] = [];
    for (let i = 0; i < allPages.length; i++) {
      if (i > 0 && allPages[i] - allPages[i - 1] > 1) {
        labels.push({ type: "ellipsis" });
      }
      labels.push({ type: "page", value: allPages[i] });
    }
    return labels;
  }, [total, current]);

  return (
    <div className={`w-full border-t-[1.2px] border-gray-400 ${font.sometypeMono.className} mt-16`}>
      <div className="flex items-stretch w-full text-gray-700 mt-8 h-[2em]">
        <Button
          className={`${current > 0 && !disabled ? 'cursor-pointer opacity-80 focus:opacity-100 hover:opacity-100 focus:bg-gray-600/5 hover:bg-gray-600/5' : 'opacity-50'}`}
          aria-label="Previous Page"
          disabled={!disabled && current < 1}
          onTrigger={() => onChange(current - 1, { router })}
        >
          <ChevronLeftIcon
            width="1em" height="1em"
            stroke="currentColor"
            role="presentation"
            aria-hidden="true"
            className="mx-2 pointer-events-none select-none"
          />
        </Button>
        {pages.map((item, i) => {
          if (item.type === 'ellipsis') {
            return (
              <span key={i} className="select-none opacity-60 self-center">
                <EllipsisHorizontalIcon
                  width="1em" height="1em"
                  stroke="currentColor"
                  role="presentation"
                  aria-hidden="true"
                  className="mx-1.5 pointer-events-none"
                />
              </span>
            );
          } else {
            return (
              <Button
                key={i}
                className={`inline-block min-w-6 px-[0.6em] leading-[2em] text-center ${disabled || item.value === current ? 'opacity-50' : 'cursor-pointer opacity-80 focus:opacity-100 hover:opacity-100 focus:bg-gray-600/5 hover:bg-gray-600/5'}`}
                disabled={disabled || item.value === current}
                onTrigger={() => onChange(item.value, { router })}
              >
                <span>{item.value + 1}</span>
              </Button>
            );
          }
        })}
        <Button
          className={`${!disabled && current < total - 1 ? 'cursor-pointer opacity-80 focus:opacity-100 hover:opacity-100 focus:bg-gray-600/5 hover:bg-gray-600/5' : 'opacity-50'}`}
          aria-label="Next Page"
          disabled={disabled || current >= total - 1}
          onTrigger={() => onChange(current + 1, { router })}
        >
          <ChevronRightIcon
            width="1em" height="1em"
            stroke="currentColor"
            role="presentation"
            aria-hidden="true"
            className="mx-2 pointer-events-none select-none"
          />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
