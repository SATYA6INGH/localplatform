const CATEGORY_ICONS = {
  food: "🍛",
  cafe: "☕",
  doctor: "⚕",
  salon: "✂",
  architect: "⌂",
  construction: "🏗",
  realestate: "🏢",
  fitness: "🏋",
  home: "🛠",
} as const;

function categoryKey(category: string | null | undefined = "") {
  const value = (category ?? "").toLowerCase();
  if (/(architect|interior|design)/.test(value)) return "architect";
  if (/(construction|builder|contractor|civil)/.test(value)) return "construction";
  if (/(real estate|property|realtor)/.test(value)) return "realestate";
  if (/(doctor|clinic|hospital|medical|health|dentist)/.test(value)) return "doctor";
  if (/(salon|beauty|spa|barber)/.test(value)) return "salon";
  if (/(cafe|coffee|bakery)/.test(value)) return "cafe";
  if (/(fitness|gym|yoga)/.test(value)) return "fitness";
  if (/(home service|electrician|plumber|repair|cleaning)/.test(value)) return "home";
  if (/(food|restaurant|biryani|dhaba|fast food|catering)/.test(value)) return "food";
  return "food";
}

export function getBusinessImage(_category?: string | null, imageUrl?: string | null) {
  // A business visual must be uploaded/provided by its owner. Never invent a
  // category photo or borrow an image from another listing.
  return imageUrl || "";
}

export function getBusinessIcon(category?: string | null) {
  return CATEGORY_ICONS[categoryKey(category)];
}
