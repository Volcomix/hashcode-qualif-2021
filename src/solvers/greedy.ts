import {
  countTotalPeople,
  countTotalPizzas,
  Dataset,
  Pizza,
} from "../dataset.ts";
import { NumberSet } from "../helpers/number_set.ts";
import { WORKER_DONE, WorkerProgress } from "../helpers/worker.ts";
import { Submission } from "../submission.ts";

self.onmessage = ({ data: dataset }: MessageEvent<Dataset>) => {
  const { teams } = dataset;
  const maxPizzaCount = Math.min(
    countTotalPeople(dataset),
    countTotalPizzas(dataset),
  );
  const submission: Submission = { deliveries: [] };
  const progress: WorkerProgress = { completed: 0, total: maxPizzaCount };
  self.postMessage(progress);
  teams.reverse();
  let pizzas = toLinkedList(dataset.pizzas);
  const ingredients = new NumberSet(10000);
  let startTime = Date.now();
  for (const { personCount, teamCount } of teams) {
    for (let teamIdx = 0; teamIdx < teamCount && pizzas; teamIdx++) {
      // Always ends with 3-person + 2-person deliveries
      if (
        dataset.pizzas.length - progress.completed === 5 && personCount === 4
      ) {
        break;
      }
      const pizzasToDeliver: Pizza[] = [];
      ingredients.clear();
      let ingredientCount = 0;
      for (let personIdx = 0; personIdx < personCount && pizzas; personIdx++) {
        pizzas = deliverPizza(pizzas, ingredients, pizzasToDeliver);
        const pizza = pizzasToDeliver[pizzasToDeliver.length - 1];
        for (const ingredient of pizza.ingredients) {
          if (!ingredients.has(ingredient)) {
            ingredients.add(ingredient);
            ingredientCount++;
          }
        }
      }
      if (pizzasToDeliver.length === personCount) {
        submission.deliveries.push({
          score: ingredientCount * ingredientCount,
          pizzas: pizzasToDeliver,
        });
        progress.completed += pizzasToDeliver.length;
        self.postMessage(progress);
        const endTime = Date.now();
        if (endTime - startTime >= 30000) {
          self.postMessage(submission);
          startTime = endTime;
        }
      } else {
        while (pizzasToDeliver.length) {
          pizzas = {
            pizza: pizzasToDeliver.pop()!,
            next: pizzas,
          };
        }
        break;
      }
    }
  }
  progress.completed = maxPizzaCount;
  self.postMessage(progress);
  self.postMessage(submission);
  self.postMessage(WORKER_DONE);
  self.close();
};

type PizzaNode = {
  pizza: Pizza;
  next: PizzaNode | null;
};

function toLinkedList(pizzas: Pizza[]): PizzaNode | null {
  return pizzas
    .sort((a, b) => a.ingredients.length - b.ingredients.length)
    .reduce(
      (pizzaNode, pizza) => ({ pizza, next: pizzaNode }),
      null as PizzaNode | null,
    );
}

function deliverPizza(
  pizzas: PizzaNode,
  ingredients: NumberSet,
  pizzasToDeliver: Pizza[],
): PizzaNode | null {
  let bestPizzaPrevious: PizzaNode | null = null;
  let bestPizza: PizzaNode = null!;
  let highestNewIngredientCount = -1;

  let previous: PizzaNode | null = null;
  let current: PizzaNode | null = pizzas;
  while (current) {
    let newIngredientCount = 0;
    for (const ingredient of current.pizza.ingredients) {
      if (!ingredients.has(ingredient)) {
        newIngredientCount++;
      }
    }
    if (
      newIngredientCount > highestNewIngredientCount ||
      (newIngredientCount === highestNewIngredientCount &&
        current.pizza.ingredients.length < bestPizza.pizza.ingredients.length)
    ) {
      bestPizzaPrevious = previous;
      bestPizza = current;
      highestNewIngredientCount = newIngredientCount;
    }
    previous = current;
    current = current.next;
  }
  pizzasToDeliver.push(bestPizza.pizza);
  if (bestPizzaPrevious) {
    bestPizzaPrevious.next = bestPizza.next;
    return pizzas;
  } else {
    return bestPizza.next;
  }
}
