import HeroImg from "@/assets/imgs/hero3.png"
import { Button } from "@/components/ui/button";
import Image from "next/image";

function HeroSec() {
    return (
        <div className="h-dvh relative">
            <Image src={HeroImg} alt="MoodFlix" className="block object-cover aspect-16/8 w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20">
                <div className="container h-full">
                    <div className="h-full flex flex-col gap-4 justify-center lg:max-w-1/2" >
                        <span className="text-primary texy-xl font-bold ">
                            Moodflix
                        </span>
                        <h1 className="text-white font bold text-4xl">Find your next favorite <span className="text-primary">Movie</span> & <span className="text-primary">Show</span></h1>
                        <p className="text-muted-foreground text-base">Discover, rate, and share your favorite movies with Moodflix</p>
                        <Button size="lg" className="w-fit text-lg py-2 px-5 ">Discover</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HeroSec;