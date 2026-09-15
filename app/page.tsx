import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { OffersPreview } from "@/components/home/OffersPreview";
import { GalleryStrip } from "@/components/home/GalleryStrip";
import { CtaBanner } from "@/components/home/CtaBanner";

export default function HomePage() {
  return (
    <>
      <Hero />

      <div className="grain-overlay bg-deep p-3 sm:p-5 md:p-8 lg:p-12">
        <Manifesto />
      </div>

      <OffersPreview />
      <GalleryStrip />
      <CtaBanner />
    </>
  );
}
