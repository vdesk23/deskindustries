import google from "@/assets/partners/google.webp.asset.json";
import shopify from "@/assets/partners/shopify.webp.asset.json";
import squarespace from "@/assets/partners/squarespace.webp.asset.json";
import lovable from "@/assets/partners/lovable.webp.asset.json";
import marketersPro from "@/assets/partners/marketers-pro.webp.asset.json";
import marketersWorld from "@/assets/partners/marketers-world.webp.asset.json";
import desution from "@/assets/partners/desution.webp.asset.json";

const LOGOS = [
  { src: google.url, alt: "Google Cloud Partner Network", w: 330 },
  { src: shopify.url, alt: "Shopify Certified Partner", w: 88 },
  { src: squarespace.url, alt: "Squarespace Circle Gold Partner", w: 196 },
  { src: lovable.url, alt: "Lovable", w: 427 },
  { src: marketersPro.url, alt: "wearemarketers PRO", w: 849 },
  { src: marketersWorld.url, alt: "Marketers World 2026", w: 1014 },
];

export function PartnersMarquee() {
  const items = [...LOGOS, ...LOGOS];
  return (
    <section aria-label="Partner e certificazioni" className="relative py-14 lg:py-20">
      <p className="text-center text-xs font-display font-medium uppercase tracking-[0.3em] text-muted-foreground">
        Partner &amp; Certificazioni
      </p>
      <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max items-center gap-14 px-14 lg:gap-20 lg:px-20 animate-[marquee_32s_linear_infinite] hover:[animation-play-state:paused]">
          {items.map((l, i) => (
            <img
              key={i}
              src={l.src}
              alt={l.alt}
              loading="lazy"
              decoding="async"
              width={l.w}
              height={88}
              className="h-9 w-auto shrink-0 opacity-70 transition-opacity duration-300 hover:opacity-100 lg:h-11"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
