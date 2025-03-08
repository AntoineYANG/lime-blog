"use client";

import { useEffect, useState, type FC } from "react";
import { usePathname } from "next/navigation";

import { throttle } from "@utils/functions";


const THRESHOLD_HEIGHT_RATIO = 3.5;

const ArticleProgress: FC = () => {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  
  useEffect(() => {
    const checkPageSize = () => {
      setVisible(document.body.offsetHeight > THRESHOLD_HEIGHT_RATIO * window.innerHeight);
    };
    checkPageSize();
    document.addEventListener('resize', checkPageSize);
    return () => {
      document.removeEventListener('resize', checkPageSize);
    };
  }, [pathname]);

  const [val, setVal] = useState(0);
  
  useEffect(() => {
    const body = document.body;
    if (!visible || !body) {
      return;
    }
    const checkProgress = throttle(() => {
      const main = document.getElementById("main");
      if (!main) {
        setVal(0);
        return;
      }
      const { height } = main.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const originTop = main.offsetTop;
      const originalBottom = originTop + Math.min(viewportH, height);
      const distance = Math.max(1, height - originalBottom - viewportH);
      const viewed = window.scrollY;
      const progress = Math.max(0, Math.min(1, viewed / distance));
      setVal(progress * 100);
    }, { trailing: true });
    checkProgress();
    window.addEventListener('scroll', checkProgress);
    return () => {
      window.removeEventListener('scroll', checkProgress);
    };
  }, [visible, pathname]);

  if (!visible) {
    return null;
  }

  return (
    <div
      role="progressbar"
      aria-label="Article progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={val}
      className="relative left-0 right-0 w-full h-[2px] pointer-events-none"
    >
      <div
        role="presentation"
        aria-hidden="true"
        className="absolute top-0 left-0 bottom-0 w-full bg-black transition-transform"
        style={{
          transform: `translateX(${val-100}%)`,
        }}
      />
    </div>
  );
};


export default ArticleProgress;
