import HeroSec from "@/components/Home/HeroSection";



export default function Home() {
  return (
    <div className="flex flex-col ">
      <HeroSec />
      <div className="h-screen">
        <div className="test container">
          <h1 className="test text-primary">test</h1>
        </div>
      </div>
    </div>
  );
}
