export async function sendChat({
  message,
  chatId,
  signal,
}: {
  message: string;
  chatId: string;
  signal?: AbortSignal;
}) {
  const body = JSON.stringify({
    message,
    chatId,
    model: "gemini-2.0-flash",
  });

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    signal,
  });

  return response;
}
