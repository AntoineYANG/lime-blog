"use client";

import { type HTMLAttributes, type FC, useCallback, useState, type KeyboardEventHandler, type ComponentProps, useRef, useEffect, useMemo } from "react";
import { CheckIcon, ClipboardDocumentIcon, XMarkIcon } from "@heroicons/react/16/solid";

import { copyToClipboard } from "@utils/clipboard";
import { throttle } from "@utils/functions";


interface IButtonProps {
  onTrigger(): void | Promise<void>;
  onFailed?(reason: Error): void;
  disabled?: boolean;
}

const Button: FC<IButtonProps & Omit<HTMLAttributes<HTMLButtonElement>, keyof IButtonProps>> = ({ onTrigger, onFailed, disabled, children, ...props }) => {
  const [busy, setBusy] = useState(false);
  const unusable = disabled || busy;
  const handleTrigger = useMemo(() => throttle(async () => {
    if (unusable) {
      return;
    }
    try {
      setBusy(true);
      await onTrigger();
    } catch (error) {
      onFailed?.(error instanceof Error ? error : new Error(`${error}`));
    } finally {
      setBusy(false);
    }
  }), [unusable, onTrigger, onFailed]);
  const handleKeyDown = useCallback<KeyboardEventHandler<HTMLButtonElement>>(ev => {
    if (ev.key === " ") {
      handleTrigger();
    }
  }, [handleTrigger]);

  return (
    <button
      {...props}
      disabled={unusable}
      onClick={handleTrigger}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {children}
    </button>
  );
};

export const CopyButton: FC<{ text: string } & Omit<ComponentProps<typeof Button>, "children" | "onTrigger">> = ({ text, className = "", ...props }) => {
  const [status, setStatus] = useState<"ready" | "failed" | "succeeded">("ready");

  const textRef = useRef(text);
  textRef.current = text;

  const timerRef = useRef<NodeJS.Timeout>(null);

  const handler = useMemo(() => throttle(async () => {
    if (await copyToClipboard(textRef.current)) {
      setStatus('succeeded');
    } else {
      setStatus('failed');
    }
    timerRef.current = setTimeout(() => {
      setStatus('ready');
    }, 400);
  }), []);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const Icon = ({
    ready: ClipboardDocumentIcon,
    failed: XMarkIcon,
    succeeded: CheckIcon,
  } as const)[status];

  const cn = ({
    ready: className,
    failed: `${className.replaceAll(/\W([a-zA-Z0-9\/]+:)?bg-[^\s]+/g, "")} bg-red-600`,
    succeeded: `${className.replaceAll(/\W([a-zA-Z0-9\/]+:)?bg-[^\s]+/g, "")} bg-green-600`,
  } as const)[status];

  return (
    <Button {...props} className={cn} onTrigger={handler} aria-label="Copy content to clipboard" title="Copy content to clipboard">
      <Icon aria-hidden="true" className="inline-block select-none pointer-events-none w-4 h-4" />
    </Button>
  );
};


export default Button;
