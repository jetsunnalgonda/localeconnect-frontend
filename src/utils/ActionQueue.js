export default class ActionQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  // Add an action to the queue
  enqueue(action) {
    this.queue.push(action);
    this.processNext(); // Start processing if not already in progress
  }

  // Process the next action in the queue
  async processNext() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    // Get the next action from the queue
    const action = this.queue.shift();
    try {
      await action();
    } catch (error) {
      console.error('Error processing action:', error);
    }

    this.processing = false;

    // Process the next action in the queue
    this.processNext();
  }
}

//   export const likeQueue = new ActionQueue();
