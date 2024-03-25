import { Shape } from "../serialization";

export class Job extends Shape({
  namespace: String,
  name: String,
  data: String,
}) {}

export abstract class JobRegistry {
  abstract register(job: Job): () => void;
  abstract listen(listener: () => void): () => void;
  abstract getJobs(): Job[];
}

export class InMemoryJobRegistry extends JobRegistry {
  static currentId = 0;

  private jobs: Record<string, Job> = {};
  private listeners: Record<string, () => void> = {};

  private trigger() {
    Object.values(this.listeners).forEach((listener) => listener());
  }

  register(job: Job) {
    const id = InMemoryJobRegistry.currentId++;
    this.jobs[id] = job;

    this.trigger();

    return () => {
      delete this.jobs[id];
      this.trigger();
    };
  }

  listen(listener: () => void) {
    const id = InMemoryJobRegistry.currentId++;

    this.listeners[id] = listener;

    return () => {
      delete this.listeners[id];
    };
  }

  getJobs() {
    return Object.values(this.jobs);
  }
}
