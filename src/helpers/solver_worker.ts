import { Dataset } from "../dataset.ts";
import { getSubmissionScore, Submission } from "../submission.ts";

export type SolverProgress = {
  completed: number;
  total: number;
};

export const SOLVER_DONE = "done";

let maxNameLength = 0;

export class SolverWorker {
  name: string;
  worker: Worker;
  promise: Promise<SolverWorker>;
  submission?: Submission;

  private progress: SolverProgress;
  private highestSubmissionScore: number;
  private startTime: number;

  constructor(dataset: Dataset, solverName: string) {
    this.name = dataset.name;
    this.progress = {
      completed: 0,
      total: Infinity,
    };
    this.highestSubmissionScore = -Infinity;

    maxNameLength = Math.max(maxNameLength, this.name.length);

    this.worker = new Worker(
      new URL(`../solvers/${solverName}.ts`, import.meta.url).href,
      { type: "module" },
    );
    this.promise = new Promise((resolve) => {
      this.worker.onmessage = (
        e: MessageEvent<SolverProgress | Submission | typeof SOLVER_DONE>,
      ) => {
        if (e.data === SOLVER_DONE) {
          resolve(this);
        } else if ("completed" in e.data) {
          this.progress = e.data;
        } else {
          const score = getSubmissionScore(e.data);
          if (score > this.highestSubmissionScore) {
            this.submission = e.data;
            this.highestSubmissionScore = score;
          }
        }
      };
    });
    this.worker.postMessage(dataset);
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
