export const chatControllerStore = {
  controllers: new Map<string, AbortController>(),

  setController({
    chatId,
    controller,
  }: {
    chatId: string;
    controller: AbortController;
  }) {
    this.controllers.set(chatId, controller);
  },

  getController(chatId: string): AbortController | undefined {
    return this.controllers.get(chatId) as AbortController;
  },

  removeController(chatId: string) {
    this.controllers.delete(chatId);
  },
};
