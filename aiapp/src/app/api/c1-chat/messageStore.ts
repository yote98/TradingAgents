export interface DBMessage {
  role: "user" | "assistant" | "system";
  content: string;
  id?: string;
}

class MessageStore {
  private messages: DBMessage[] = [];

  addMessage(message: DBMessage) {
    this.messages.push(message);
  }

  getOpenAICompatibleMessageList() {
    return this.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  getMessages() {
    return this.messages;
  }
}

const stores = new Map<string, MessageStore>();

export function getMessageStore(threadId: string): MessageStore {
  if (!stores.has(threadId)) {
    stores.set(threadId, new MessageStore());
  }
  return stores.get(threadId)!;
}
