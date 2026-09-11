import { MoodDiscoverPage } from "@/features/mood-recommendations/components/mood-discover-page";
import Image from "next/image";
import HeroImg from "@/assets/imgs/hero3.png"


export default function DiscoverPage() {

  return (
    <div className="relative">
      <div className="fixed inset-0 -z-2"> <Image src={HeroImg} alt="MoodFlix" className="block  object-cover aspect-16/8 w-full h-full" /></div>
      <div className="fixed inset-0 bg-gradient-to-r from-black/95 via-black/85 to-black/70 -z-1"> </div>
      <MoodDiscoverPage />
    </div>
  );
}