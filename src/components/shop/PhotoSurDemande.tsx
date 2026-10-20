// Remplace la photo d'une piece d'occasion qui n'en a pas encore.
//
// Les ailes de l'ecole sont publiees avant d'etre photographiees : une case
// grise muette laissait croire a une image cassee. Le client sait ainsi qu'il
// peut demander les photos.

type Props = {
  /** Lien WhatsApp affiche sous la mention. Absent dans une carte, deja un lien. */
  avecLien?: boolean;
  className?: string;
};

export const WHATSAPP = "https://wa.me/596696416727";

export default function PhotoSurDemande({ avecLien = false, className = "" }: Props) {
  return (
    <div
      className={`w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-3 text-center px-2 ${className}`}
    >
      <span
        className="text-[10px] md:text-xs uppercase tracking-widest leading-tight text-gray-400"
        style={{ fontFamily: "Mirloanne, serif" }}
      >
        Photo sur demande
      </span>
      {avecLien && (
        <a
          href={WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-900 underline underline-offset-2 hover:text-[#FF0080] transition-colors duration-200"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Demander les photos sur WhatsApp
        </a>
      )}
    </div>
  );
}
