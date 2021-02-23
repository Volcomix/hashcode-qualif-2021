import { Dataset } from "../dataset.ts";
import { WorkerBase } from "./worker.ts";

export class SolverWorker extends WorkerBase {
  constructor(dataset: Dataset, solverName: string) {
    super(`../solvers/${solverName}.ts`, dataset.name);
    this.worker.postMessage(dataset);
  }
}
