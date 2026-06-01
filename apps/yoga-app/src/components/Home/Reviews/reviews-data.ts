export interface PublicReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
}

export const FALLBACK_REVIEWS: PublicReview[] = [
  { id: "f1", rating: 5, userName: "Sarah Chen",      comment: "Solara has completely transformed how I manage my studio. It feels like the app actually breathes with my classes.", createdAt: "" },
  { id: "f2", rating: 5, userName: "Michael Ross",    comment: "The mindfulness tools integrated into my daily workflow have helped me maintain balance during my busiest weeks.", createdAt: "" },
  { id: "f3", rating: 5, userName: "Elena Rodriguez", comment: "I love how easy it is to track progress and book classes. The interface is calm and truly reflects the yoga spirit.", createdAt: "" },
  { id: "f4", rating: 5, userName: "David Park",      comment: "Finally a platform that understands the specific needs of a yoga community. It's the backbone of my business now.", createdAt: "" },
  { id: "f5", rating: 5, userName: "Aisha Jallow",    comment: "A beautiful blend of technology and zen. Solara doesn't just manage data — it manages energy. Nothing else comes close.", createdAt: "" },
  { id: "f6", rating: 5, userName: "James Wilson",    comment: "Clean, fast, reliable. It lets me focus on my practice instead of my phone. Exactly what I needed.", createdAt: "" },
];
