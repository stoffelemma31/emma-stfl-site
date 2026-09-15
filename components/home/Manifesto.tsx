import { Photo } from "@/components/ui/Photo";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { MixedTitle } from "@/components/ui/MixedTitle";
import { Reveal } from "@/components/ui/Reveal";
import { getPhoto } from "@/lib/images";
import { site } from "@/data/site";
import { manifesto } from "@/data/home-content";

export function Manifesto() {
  const left = getPhoto("manifesto-left");
  const right = getPhoto("manifesto-right");

  return (
    <section className="bg-beige px-5 py-16 md:py-24">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <MicroLabel>{manifesto.eyebrowLeft}</MicroLabel>
        <span className="font-sans text-[11px] font-black uppercase tracking-[0.25em] text-deep sm:text-sm">
          {site.brandName} {site.brandScript}
        </span>
        <MicroLabel>{manifesto.eyebrowRight}</MicroLabel>
      </div>

      {/* Mobile: left overflow photo becomes a plain block above the text */}
      <div className="mx-auto mt-10 w-2/3 md:hidden">
        <Photo photo={left} sizes="66vw" className="w-full" />
      </div>

      <div className="relative mx-auto mt-10 max-w-3xl md:mt-16">
        <div className="hidden md:block absolute left-0 top-0 w-[22%] max-w-[260px] -translate-x-[55%] translate-y-4">
          <Photo photo={left} sizes="22vw" className="w-full shadow-md" />
        </div>
        <div className="hidden md:block absolute right-0 bottom-0 w-[22%] max-w-[260px] translate-x-[55%] -translate-y-4">
          <Photo photo={right} sizes="22vw" className="w-full shadow-md" />
        </div>

        <Reveal className="flex flex-col items-center gap-8 px-0 md:px-16">
          <MixedTitle lines={manifesto.titleLines} size="lg" />
          <p className="max-w-[26ch] text-center font-sans text-sm font-semibold uppercase leading-relaxed tracking-wide text-mid md:max-w-[30ch]">
            {manifesto.paragraph}
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-10 w-2/3 md:hidden">
        <Photo photo={right} sizes="66vw" className="w-full" />
      </div>

      <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-1 text-center md:mt-20">
        <MicroLabel>{manifesto.footerLine1}</MicroLabel>
        <MicroLabel>{manifesto.footerLine2}</MicroLabel>
      </div>
    </section>
  );
}
