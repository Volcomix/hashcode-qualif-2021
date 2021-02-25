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

  const weights = new Array(dataset.streets.length).fill(0);
  for (const car of dataset.cars) {
    for (const street of car.paths) {
      ++weights[street.id];
    }
  }

  for (const intersection of dataset.intersections) {
    const items: ScheduleItem[] = [];

    for (const street of intersection.arrivals) {
      const duration = weights[street.id];
      if (duration > 0) {
        items.push({ duration, street });
      }
    }

    if (items.length > 0) {
      submission.schedules.push({ intersection, items });
    }
  }

  progress.completed = 1;
  self.postMessage(progress);
  //self.postMessage(submission);
  await writeSubmission(dataset.name, submission);
  self.postMessage(WORKER_DONE);
  self.close();
};
