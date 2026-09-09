import type {
  Business,
  Category,
  StatusItem,
} from "./types";

export const categories: Category[] = [
  {
    name: "Restaurants",
    icon: "🍴",
    color: "orange",
  },
  {
    name: "Doctors",
    icon: "⚕",
    color: "blue",
  },
  {
    name: "Salons",
    icon: "✂",
    color: "pink",
  },
  {
    name: "Home Services",
    icon: "⌂",
    color: "green",
  },
  {
    name: "Architects",
    icon: "⌘",
    color: "indigo",
  },
  {
    name: "Real Estate",
    icon: "⌂",
    color: "cyan",
  },
  {
    name: "Fitness",
    icon: "♨",
    color: "purple",
  },
  {
    name: "More",
    icon: "•••",
    color: "gray",
  },
];

export const statuses: StatusItem[] = [
  {
    name: "Your Status",
    icon: "+",
    online: true,
  },
  {
    name: "Spice Hub",
    icon: "🍛",
    time: "Online",
    online: true,
  },
  {
    name: "City Salon",
    icon: "👩",
    time: "2h ago",
  },
  {
    name: "Care Life",
    icon: "👩",
    time: "Online",
    online: true,
  },
  {
    name: "More",
    icon: "•••",
  },
];

export const businesses: Business[] = [
  {
    id: 1,
    name: "Spice Hub Restaurant",
    area: "Gomti Nagar, Lucknow",
    category:
      "North Indian • Chinese • Fast Food",
    rating: 4.8,
    reviews: 320,
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=85",
    offer: "20% OFF on All Combos",
  },
  {
    id: 2,
    name: "The Urban Cafe",
    area: "Hazratganj, Lucknow",
    category:
      "Cafe • Coffee • Snacks",
    rating: 4.6,
    reviews: 210,
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=85",
    offer:
      "Free Coffee on orders above ₹299",
  },
  {
    id: 3,
    name: "Royal Biryani House",
    area: "Aliganj, Lucknow",
    category:
      "Biryani • Mughlai • Tandoor",
    rating: 4.7,
    reviews: 480,
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=600&q=85",
    offer: "Buy 1 Get 1 Biryani",
  },
];