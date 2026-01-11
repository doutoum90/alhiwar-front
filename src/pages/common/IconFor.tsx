import { type MediaType } from "../../services/articleService";
import { FaFilePdf, FaImage, FaVideo } from "react-icons/fa";

export const iconFor = (t: MediaType) => (t === "image" ? <FaImage /> : t === "video" ? <FaVideo /> : <FaFilePdf />);
