export type Category = {
  name: string;
  icon: string;
  color: string;
};

export type StatusItem = {
  name: string;
  time?: string;
  icon: string;
  online?: boolean;
};

export type Business = {
  id: number;
  name: string;
  area: string;
  category: string;
  rating: number;
  reviews: number;
  image: string;
  offer: string;
};