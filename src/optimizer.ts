import { getDatasetInfo, readDataset } from "./dataset.ts";
import { OptimizerWorker } from "./helpers/optimizer_worker.ts";
import {
  getSubmissionInfo,
  readSubmission,
  writeSubmission,
} from "./submission.ts";

const datasets = await Promise.all(Deno.args.map(readDataset));
const datasetInfos = datasets.map(getDatasetInfo);
const submissions = await Promise.all(datasets.map(readSubmission));
const submissionInfos = submissions.map((submission, i) =>
  getSubmissionInfo(Deno.args[i].split("/")[1], submission)
);
const optimizerWorkers = datasets.map((dataset, i) =>
  new OptimizerWorker(dataset, submissions[i], "pair_swap")
);
const intervalId = setInterval(printProgress, 1000);
const sig = Deno.signal(Deno.Signal.SIGINT);
await Promise.race([
  Promise.all(optimizerWorkers.map(({ promise }) => promise)),
  sig.then(() => {
    optimizerWorkers.forEach((optimizerWorker) =>
      optimizerWorker.worker.terminate()
    );
  }),
]);
sig.dispose();
clearInterval(intervalId);
await Promise.all(
  optimizerWorkers
    .filter(({ submission }) => submission)
    .map(({ name, submission }) => writeSubmission(name, submission!)),
);
printProgress();
console.table(
  optimizerWorkers.map(({ name, submission }) =>
    submission ? getSubmissionInfo(name, submission) : { "Dataset": name }
  ),
);

function printProgress() {
  console.clear();
  console.table(datasetInfos);
  console.table(submissionInfos);
  optimizerWorkers.forEach((solverWorker) => solverWorker.printProgress());
}
