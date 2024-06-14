"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EmojiPickerProps {
  children: React.ReactNode;
  getValue?: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ children, getValue }) => {
  const route = useRouter();
  //   const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });
  const Picker = dynamic(
    () => import("emoji-picker-react").then((mod) => mod.default),
    { ssr: false }
  );

  const onClick = (event: any, emojiObject: any) => {
    if (getValue) {
      getValue(emojiObject.emoji);
    }
  };
  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger className="cursor-pointer">{children}</PopoverTrigger>
        <PopoverContent
          className="p-0
          border-none
        "
        >
          <Picker onEmojiClick={onClick} />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EmojiPicker;
