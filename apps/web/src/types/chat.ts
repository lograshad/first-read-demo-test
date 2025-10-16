interface ChatPart {
  text?: string;
  fileData?: {
    fileUri: string;
    mimeType: string;
  };
  buttons?: string[];
}

export interface ChatMessagePart extends ChatPart {
  text: string; // Make text required for message parts
}


export interface ChatMessage {
  role: "user" | "model";
  parts: ChatMessagePart[];
}
