/** Highlights Razzaq Luxe / RazzaqLuxe / #RazzaqLuxe in flowing copy */
const SPLIT_RE = /(Razzaq Luxe|RazzaqLuxe|#RazzaqLuxe)/g;

export function GoldBrandText({ text }: { text: string }) {
  const parts = text.split(SPLIT_RE);
  return (
    <>
      {parts.map((part, i) =>
        part === "Razzaq Luxe" ||
        part === "RazzaqLuxe" ||
        part === "#RazzaqLuxe" ? (
          <span key={i} className="text-luxe-gold">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
