import { Dataset } from "../dataset.ts";
import { Submission } from "../submission.ts";
import { WorkerBase } from "./worker.ts";

export type OptimizerMessageEventData = {
  dataset: Dataset;
  submission: Submission;
};

export class OptimizerWorker extends WorkerBase {
  constructor(dataset: Dataset, submission: Submission, optimizerName: string) {
    super(`../optimizers/${optimizerName}.ts`, dataset.name);
    this.worker.postMessage({
      dataset,
      submission,
    } as OptimizerMessageEventData);
  }
}
