import { Pizza } from "../dataset.ts";
import { OptimizerMessageEventData } from "../helpers/optimizer_worker.ts";
import { WorkerProgress } from "../helpers/worker.ts";
import { Delivery, getDeliveryScore } from "../submission.ts";

self.onmessage = (
  { data: { dataset, submission } }: MessageEvent<OptimizerMessageEventData>,
) => {
  const progress: WorkerProgress = { completed: 0, total: 1000000 };
  self.postMessage(progress);
  const { deliveries } = submission;
  const remainingPizzasSet = new Set(dataset.pizzas);
  for (const delivery of deliveries) {
    delivery.pizzas.forEach((pizza) => remainingPizzasSet.delete(pizza));
  }
  // TODO Try to also swap delivered pizzas with remaining ones
  const remainingPizzas = [...remainingPizzasSet];
  let startTime = Date.now();
  while (true) {
    const delivery1 = randomDelivery(deliveries);
    const delivery2 = randomDelivery(deliveries);
    const pizzaIdx1 = randomPizzaIdx(delivery1.pizzas);
    const pizzaIdx2 = randomPizzaIdx(delivery2.pizzas);
    swapPizzas(delivery1, delivery2, pizzaIdx1, pizzaIdx2);
    const score1 = getDeliveryScore(delivery1.pizzas);
    const score2 = getDeliveryScore(delivery2.pizzas);
    if (score1 + score2 > delivery1.score + delivery2.score) {
      delivery1.score = score1;
      delivery2.score = score2;
      self.postMessage(submission);
    } else {
      swapPizzas(delivery1, delivery2, pizzaIdx1, pizzaIdx2);
    }
    progress.completed = (progress.completed + 1) % progress.total;
    const endTime = Date.now();
    if (endTime - startTime > 500) {
      self.postMessage(progress);
      startTime = endTime;
    }
  }
};

function randomDelivery(deliveries: Delivery[]) {
  return deliveries[Math.floor(Math.random() * deliveries.length)];
}

function randomPizzaIdx(pizzas: Pizza[]) {
  return Math.floor(Math.random() * pizzas.length);
}

function swapPizzas(
  delivery1: Delivery,
  delivery2: Delivery,
  pizzaIdx1: number,
  pizzaIdx2: number,
) {
  const tmp = delivery1.pizzas[pizzaIdx1];
  delivery1.pizzas[pizzaIdx1] = delivery2.pizzas[pizzaIdx2];
  delivery2.pizzas[pizzaIdx2] = tmp;
}
