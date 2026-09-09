import Script from "next/script";

type AdSenseSlotProps = {
  slot?: string;
  className?: string;
};

export default function AdSenseSlot({ slot, className = "" }: AdSenseSlotProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  // The slot stays invisible until a real AdSense publisher ID and slot are configured.
  if (!client || !slot) return null;

  return (
    <div className={`lp-adsense-slot ${className}`.trim()} aria-label="Advertisement">
      <Script
        async
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
        crossOrigin="anonymous"
      />
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: 50 }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <Script id={`adsense-init-${slot}`} strategy="afterInteractive">
        {"(window.adsbygoogle = window.adsbygoogle || []).push({});"}
      </Script>
    </div>
  );
}
