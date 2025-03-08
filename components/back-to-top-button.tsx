"use client";

import { useCallback, useEffect, useState, type FC } from "react";
import { ChevronUpIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";

import Button from "@cp/button.client";
import { throttle } from "@utils/functions";


const THRESHOLD_HEIGHT_RATIO = 0.8;

const BackToTopButton: FC = () => {
  const pathname = usePathname();

  const handleClick = useCallback(() => {
    window.scrollTo(0, 0);
  }, []);

  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const body = document.body;
    if (!body) {
      setVisible(false);
      return;
    }
    const checkScrollY = throttle(() => {
      const main = document.body;
      if (!main) {
        return;
      }
      setVisible(window.scrollY >= THRESHOLD_HEIGHT_RATIO * window.innerHeight);
    }, { interval: 200, trailing: true });
    checkScrollY();
    window.addEventListener('scroll', checkScrollY);
    return () => {
      window.removeEventListener('scroll', checkScrollY);
    };
  }, [pathname]);
  
  return (
    <div
      className={
        `fixed right-[calc(2rem+1vw)] bottom-[25vh] rounded-full w-10 h-10 backdrop-brightness-150 backdrop-blur-2xl overflow-hidden
        ${visible ? 'opacity-50 hover:opacity-80 duration-200' : 'opacity-0 pointer-events-none duration-1000'} transition-opacity
      `}
    >
      <Button
        onTrigger={handleClick}
        aria-label="Back to top"
        title="Back to top"
        className="w-full h-full flex items-center justify-center cursor-pointer"
      >
        <ChevronUpIcon
          aria-hidden="true"
          className="w-8 h-8"
        />
      </Button>
    </div>
  );
};


export default BackToTopButton;
