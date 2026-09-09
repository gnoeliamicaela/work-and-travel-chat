"use client";

import { useState } from "react";
import ChatWindow from "./ChatWindow";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      <div hidden={!open}>
        <ChatWindow onClose={() => setOpen(false)} />
      </div>

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-terracota-500 text-sm font-semibold text-white shadow-lg hover:bg-terracota-600"
          aria-label="Abrir chat"
        >
          Chat
        </button>
      )}
    </div>
  );
}
