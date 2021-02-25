import { WORKER_DONE, WorkerProgress } from "../helpers/worker.ts";
import { Dataset, Submission } from "../model.ts";
import { readDataset } from "../dataset.ts";
import { writeSubmission } from "../submission.ts";

self.onmessage = async ({ data: inputFilePath }: MessageEvent<string>) => {
  const dataset = await readDataset(inputFilePath);
  const submission: Submission = { schedules: [] };

  const progress: WorkerProgress = {
    completed: 0,
    total: 1,
  };

  self.postMessage(progress);

  //let startTime = Date.now();

  for (const intersection of dataset.intersections) {
    submission.schedules.push({
      intersection,
      items: [{ duration: dataset.duration, street: intersection.arrivals[0] }],
    });
  }

  progress.completed = 1;
  self.postMessage(progress);
  //self.postMessage(submission);
  await writeSubmission(dataset.name, submission);
  self.postMessage(WORKER_DONE);
  self.close();
};
