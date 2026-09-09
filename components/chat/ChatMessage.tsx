import clsx from "clsx";

export interface ChatMessageData {
  role: "user" | "assistant";
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageData) {
  const isUser = role === "user";

  return (
    <div className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm",
          isUser
            ? "bg-terracota-500 text-white"
            : "bg-arena-100 text-carbon-800"
        )}
      >
        {content}
      </div>
    </div>
  );
}
