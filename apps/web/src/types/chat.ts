interface ChatPart {
  text?: string;
  fileData?: {
    fileUri: string;
    mimeType: string;
  };
  buttons?: string[];
}

export interface ChatMessagePart extends ChatPart {
  text: string; 
}


export interface ChatMessage {
  role: "user" | "model";
  parts: ChatMessagePart[];
}
