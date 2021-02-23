import { OptimizerMessageEventData } from "../helpers/optimizer_worker.ts";

self.onmessage = (
  { data: { dataset, submission } }: MessageEvent<OptimizerMessageEventData>,
) => {
  // TODO Implement this optimizer
};
