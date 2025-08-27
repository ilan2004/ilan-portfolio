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
    tags: ["music video", "nature", "travel"],
  },
  {
    id: "vid-green-peace",
    title: "Green Peace",
    publicId: "green_peace",
    poster: poster("green_peace", 2),
    link: "https://res.cloudinary.com/dkwgl0ek8/video/upload/v1756284507/green_peace.mov",
    tags: ["music video"],
  },
  {
    id: "vid-2023",
    title: "2023",
    publicId: "2023",
    poster: poster("2023", 2),
    link: "https://res.cloudinary.com/dkwgl0ek8/video/upload/v1756284626/2023.mov",
    tags: ["music video"],
  },
  {
    id: "vid-acadamia-hsrvia",
    title: "Acadamia HSRVIA",
    publicId: "acadamia_hsrvia",
    poster: poster("acadamia_hsrvia", 2),
    link: "https://res.cloudinary.com/dkwgl0ek8/video/upload/v1756284782/acadamia_hsrvia.mp4",
    tags: ["music video"],
  },
];

export default videos;
