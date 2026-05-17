export interface Expert {
  id: string;
  name: string;
  role: string;
  bio: string;
  fullBio: string;
  specialties: string[];
  image: string;
  rating: number;
  students: number;
}

export const EXPERTS: Expert[] = [
  {
    id: "sarah-chen",
    name: "Sarah Chen",
    role: "Vinyasa Flow Master",
    bio: "Sarah brings 15 years of experience in rhythmic vinyasa and breathwork.",
    fullBio: "Sarah Chen is a world-renowned yoga instructor specializing in Vinyasa Flow. With over 15 years of experience, she has taught in sanctuaries across Bali, India, and California. Her teaching philosophy centers on the marriage of rhythmic movement and conscious breathing, helping practitioners find their unique flow in a modern world.",
    specialties: ["Vinyasa", "Breathwork", "Power Yoga"],
    image: "/images/experts/sarah.jpg",
    rating: 4.9,
    students: 1200,
  },
  {
    id: "michael-ross",
    name: "Michael Ross",
    role: "Restorative Therapy Specialist",
    bio: "Focusing on deep tissue release and nervous system regulation.",
    fullBio: "Michael Ross specializes in the therapeutic aspects of yoga. After a career in physical therapy, Michael transitioned to restorative yoga to help people heal from chronic stress and physical injury. His classes are a blend of deep tissue release and meditative stillness designed to regulate the nervous system.",
    specialties: ["Restorative", "Therapy", "Nervous System"],
    image: "/images/experts/michael.jpg",
    rating: 4.8,
    students: 850,
  },
  {
    id: "aisha-jallow",
    name: "Aisha Jallow",
    role: "Mindfulness Coach",
    bio: "Guiding you through Vedic meditation and conscious living practices.",
    fullBio: "Aisha Jallow is a leading voice in the mindfulness community. Trained in Vedic meditation techniques, she focuses on bringing ancient wisdom into daily corporate and personal routines. Her approach is gentle yet profound, emphasizing the importance of 'micro-mindfulness' in every action.",
    specialties: ["Meditation", "Vedic Wisdom", "Conscious Living"],
    image: "/images/experts/aisha.jpg",
    rating: 5.0,
    students: 2100,
  },
];
