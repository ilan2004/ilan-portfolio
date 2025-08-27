// Cloudinary-seeded videos. We'll swap `link` to modal playback later.
export const CLOUD_NAME = "dkwgl0ek8";

function poster(publicId, second = 2) {
  // Generate a 16:9 JPG at a chosen second from the video
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/so_${second}/w_1200,ar_16:9,c_fill/${publicId}.jpg`;
}

const videos = [
  {
    id: "vid-into-the-mist",
    title: "Into The Mist",
    publicId: "into_the_mist",
    poster: poster("into_the_mist", 2),
    link: "https://res.cloudinary.com/dkwgl0ek8/video/upload/v1756284365/into_the_mist.mp4",
    tags: [ "nature", "travel","friends"],
  },
  {
    id: "vid-green-peace",
    title: "Green Peace",
    publicId: "green_peace",
    poster: poster("green_peace", 2),
    link: "https://res.cloudinary.com/dkwgl0ek8/video/upload/v1756284507/green_peace.mov",
    tags: ["nature","peace"],
  },
  {
    id: "vid-2023",
    title: "2023",
    publicId: "2023",
    poster: poster("2023", 2),
    link: "https://res.cloudinary.com/dkwgl0ek8/video/upload/v1756284626/2023.mov",
    tags: ["life"],
  },
  {
    id: "vid-acadamia-hsrvia",
    title: "Acadamia",
    publicId: "acadamia_hsrvia",
    poster: poster("acadamia_hsrvia", 2),
    link: "https://res.cloudinary.com/dkwgl0ek8/video/upload/v1756284782/acadamia_hsrvia.mp4",
    tags: ["Uni"],
  },
  // New uploads
  {
    id: "vid-december-31",
    title: "December 31",
    publicId: "december_31_zyjame",
    poster: poster("december_31_zyjame", 2),
    link: "https://res.cloudinary.com/dkwgl0ek8/video/upload/v1756291077/december_31_zyjame.mp4",
    tags: ["friends","fun"],
  },
  {
    id: "vid-ghost",
    title: "Ghost",
    publicId: "ghost_gsgscv",
    poster: poster("ghost_gsgscv", 2),
    link: "https://res.cloudinary.com/dkwgl0ek8/video/upload/v1756290964/ghost_gsgscv.mp4",
    tags: ["experiment"],
  },
  {
    id: "vid-evening",
    title: "Eve",
    publicId: "evening_pkdjmn",
    poster: poster("evening_pkdjmn", 2),
    link: "https://res.cloudinary.com/dkwgl0ek8/video/upload/v1756290949/evening_pkdjmn.mp4",
    tags: ["nature","sky"],
  },
  {
    id: "vid-let-the-kid-live",
    title: "Let The Kid Live",
    publicId: "let_the_kid_live_pje8xa",
    poster: poster("let_the_kid_live_pje8xa", 2),
    link: "https://res.cloudinary.com/dkwgl0ek8/video/upload/v1756291100/let_the_kid_live_pje8xa.mp4",
    tags: ["fun","friends"],
  },
  {
    id: "vid-thing-of-beauty",
    title: "Thing of Beauty",
    publicId: "thing_of_beauty_vrwufm",
    poster: poster("thing_of_beauty_vrwufm", 2),
    link: "https://res.cloudinary.com/dkwgl0ek8/video/upload/v1756291734/thing_of_beauty_vrwufm.mp4",
    tags: ["film"],
  },
  {
    id: "vid-fasting",
    title: "Fasting",
    publicId: "fasting_uyqysc",
    poster: poster("fasting_uyqysc", 2),
    link: "https://res.cloudinary.com/dkwgl0ek8/video/upload/v1756291818/fasting_uyqysc.mp4",
    tags: ["short"],
  },
];

export default videos;
