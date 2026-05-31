class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class JobQueue {
  constructor() {
    this.head = null;   
    this.tail = null;  
    this._size = 0;
    this._processing = false;
  }

  get size() {
    return this._size;
  }

  isEmpty() {
    return this._size === 0;
  }

  
  enqueue(job) {
    const node = new Node(job);
    if (this.tail) {
      this.tail.next = node;
    }
    this.tail = node;
    if (!this.head) {
      this.head = node;
    }
    this._size++;
    console.log(`[Queue] Enqueued job: "${job.title}" — queue size: ${this._size}`);
  }

  dequeue() {
    if (this.isEmpty()) return null;
    const value = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this._size--;
    return value;
  }


  peek() {
    return this.head ? this.head.value : null;
  }

  async processAll() {
    if (this._processing || this.isEmpty()) return;
    this._processing = true;

    while (!this.isEmpty()) {
      const job = this.dequeue();
      try {
        await job.save();
        console.log(`[Queue] Saved job: "${job.title}" to MongoDB`);
      } catch (err) {
        console.error(`[Queue] Failed to save job: "${job.title}"`, err.message);
      }
    }

    this._processing = false;
  }
}


module.exports = new JobQueue();