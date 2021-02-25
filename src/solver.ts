import { getDatasetInfo, readDataset } from "./dataset.ts";
import { SolverWorker } from "./helpers/solver_worker.ts";
import { getSubmissionInfo, writeSubmission } from "./submission.ts";

const datasets = await Promise.all(Deno.args.map(readDataset));
const datasetInfos = datasets.map(getDatasetInfo);
const solverWorkers = datasets.map((dataset) =>
  new SolverWorker(dataset, "weight")
);
const intervalId = setInterval(printProgress, 1000);
const sig = Deno.signal(Deno.Signal.SIGINT);
await Promise.race([
  Promise.all(solverWorkers.map(({ promise }) => promise)),
  sig.then(() => {
    solverWorkers.forEach((solverWorker) => solverWorker.worker.terminate());
  }),
]);
sig.dispose();
clearInterval(intervalId);
await Promise.all(
  solverWorkers
    .filter(({ submission }) => submission)
    .map(({ name, submission }) => writeSubmission(name, submission!)),
);
printProgress();
console.table(
  solverWorkers.map(({ name, submission }) =>
    submission ? getSubmissionInfo(name, submission) : { "Dataset": name }
  ),
);

function printProgress() {
  console.clear();
  console.table(datasetInfos);
  solverWorkers.forEach((solverWorker) => solverWorker.printProgress());
}
