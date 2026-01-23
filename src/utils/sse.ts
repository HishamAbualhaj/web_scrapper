import { SSEEvent } from "@/types/server";

export function sendSSE(
  controller: ReadableStreamDefaultController,
  event: SSEEvent
) {
  controller.enqueue(
    new TextEncoder().encode(`${JSON.stringify(event) + "\n"}`)
  );
}
