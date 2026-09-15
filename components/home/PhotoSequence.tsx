import { Photo } from "@/components/ui/Photo";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { Reveal } from "@/components/ui/Reveal";
import { getPhoto } from "@/lib/images";
import { sequence, manifesto } from "@/data/home-content";

export function PhotoSequence() {
  return (
    <section className="relative bg-beige-soft px-6 py-16 md:py-24">
      <div className="pointer-events-none absolute inset-y-0 left-2 hidden items-center sm:flex md:left-6">
        <MicroLabel className="[writing-mode:vertical-lr] rotate-180">
          {manifesto.eyebrowLeft}
        </MicroLabel>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-2 hidden items-center sm:flex md:right-6">
        <MicroLabel className="[writing-mode:vertical-lr]">{manifesto.eyebrowRight}</MicroLabel>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-center gap-14 md:gap-20">
        {sequence.map((item, i) => (
          <Reveal key={item.photoId} delay={i * 0.05} className="w-full sm:w-4/5 md:w-[45%]">
            <figure className="text-center">
              <Photo
                photo={getPhoto(item.photoId)}
                sizes="(min-width: 768px) 40vw, 80vw"
                className="w-full shadow-sm"
              />
              <figcaption className="mt-5 font-script text-2xl text-mid">
                {item.caption}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
