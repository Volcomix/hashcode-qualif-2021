export type Intersection = {
  id: number;
  arrivals: Street[];
  departures: Street[];
};

export type Dataset = {
  name: string;
  duration: number;
  streets: Street[];
  intersections: Intersection[];
  cars: Car[];
  bonusPerCar: number;
};

export type Street = {
  name: string;
  from: Intersection;
  to: Intersection;
  duration: number;
};

export type Car = {
  paths: Street[];
};

export type Submission = {
  schedules: Schedule[];
};

export type ScheduleItem = {
  street: Street;
  duration: number;
};

export type Schedule = {
  intersection: Intersection;
  items: ScheduleItem[];
};
