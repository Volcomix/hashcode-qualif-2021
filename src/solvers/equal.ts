import { WORKER_DONE, WorkerProgress } from "../helpers/worker.ts";
import { Dataset, ScheduleItem, Submission } from "../model.ts";
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
    const items: ScheduleItem[] = [];

    for (const street of intersection.arrivals) {
      items.push({
        duration: 1,
        street,
      });
    }

    submission.schedules.push({ intersection, items });
  }

  progress.completed = 1;
  self.postMessage(progress);
  //self.postMessage(submission);
  await writeSubmission(dataset.name, submission);
  self.postMessage(WORKER_DONE);
  self.close();
};
