import { Submission } from "../model.ts";
import { getSubmissionScore } from "../submission.ts";

export type WorkerProgress = {
  completed: number;
  total: number;
};

export const WORKER_DONE = "done";

let maxNameLength = 0;

export abstract class WorkerBase {
  name: string;
  worker: Worker;
  promise: Promise<WorkerBase>;
  submission?: Submission;

  private progress: WorkerProgress;
  private startTime: number;

  constructor(workerUrl: string, name: string) {
    maxNameLength = Math.max(maxNameLength, name.length);
    this.name = name;
    this.progress = {
      completed: 0,
      total: Infinity,
    };
    this.worker = new Worker(new URL(workerUrl, import.meta.url).href, {
      type: "module",
      deno: {
        namespace: true,
      },
    });
    this.promise = new Promise((resolve) => {
      let highestSubmissionScore = -Infinity;
      this.worker.onmessage = (
        e: MessageEvent<WorkerProgress | Submission | typeof WORKER_DONE>,
      ) => {
        if (e.data === WORKER_DONE) {
          resolve(this);
        } else if ("completed" in e.data) {
          this.progress = e.data;
        } else {
          const score = getSubmissionScore(e.data);
          if (score > highestSubmissionScore) {
            this.submission = e.data;
            highestSubmissionScore = score;
          }
        }
      };
    });
    this.startTime = Date.now();
  }

  printProgress() {
    const elapsedTime = Date.now() - this.startTime;
    const { completed, total } = this.progress;
    const completedRatio = completed / total;
    const remainingSeconds = elapsedTime * (total / completed - 1) / 1000;
    const completedPercent = Math.floor(100 * completedRatio);
    console.log(
      this.name.padEnd(maxNameLength, " "),
      [
        `${completed}/${total === Infinity ? "-" : total}`,
        remainingSeconds === Infinity ? "--:--" : [
          `${Math.floor(remainingSeconds / 60)}`.padStart(2, "0"),
          `${Math.floor(remainingSeconds % 60)}`.padStart(2, "0"),
        ].join(":"),
      ].join(" ").padStart(25),
      `[${"#".repeat(completedPercent).padEnd(100, "-")}]`,
      `${completedPercent}%`.toString().padStart(4, " "),
    );
  }
}
