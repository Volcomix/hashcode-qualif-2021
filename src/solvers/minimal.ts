import {
  countTotalPeople,
  countTotalPizzas,
  Dataset,
  Pizza,
} from "../dataset.ts";
import { SOLVER_DONE, SolverProgress } from "../helpers/solver_worker.ts";
import { Submission } from "../submission.ts";

self.onmessage = async ({ data: dataset }: MessageEvent<Dataset>) => {
  const { teams, pizzas } = dataset;
  const maxPizzaCount = Math.min(
    countTotalPeople(dataset),
    countTotalPizzas(dataset),
  );
  const submission: Submission = { deliveries: [] };
  const progress: SolverProgress = { completed: 0, total: maxPizzaCount };
  self.postMessage(progress);
  let startTime = Date.now();
  let pizzaIdx = 0;
  for (const { personCount, teamCount } of teams) {
    for (
      let teamIdx = 0;
      teamIdx < teamCount && pizzaIdx < pizzas.length &&
      personCount <= pizzas.length - pizzaIdx;
      teamIdx++
    ) {
      const pizzasToDeliver: Pizza[] = [];
      const ingredients = new Set<number>();
      for (
        let personIdx = 0;
        personIdx < personCount && pizzaIdx < pizzas.length;
        personIdx++
      ) {
        // Uncomment next line to simulate long processing
        // await new Promise((resolve) => setTimeout(resolve));

        const pizza = pizzas[pizzaIdx++];
        pizzasToDeliver.push(pizza);
        for (const ingredient of pizza.ingredients) {
          ingredients.add(ingredient);
        }
      }
      if (pizzasToDeliver.length === personCount) {
        submission.deliveries.push({
          score: ingredients.size * ingredients.size,
          pizzas: pizzasToDeliver,
        });
      } else {
        pizzaIdx -= pizzasToDeliver.length;
      }
      const endTime = Date.now();
      if (endTime - startTime > 500) {
        progress.completed = pizzaIdx;
        self.postMessage(progress);
        startTime = endTime;
      }
    }
  }
  progress.completed = maxPizzaCount;
  self.postMessage(progress);
  self.postMessage(submission);
  self.postMessage(SOLVER_DONE);
  self.close();
};
