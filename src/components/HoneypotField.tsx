import { HONEYPOT_FIELD } from "@/lib/honeypot";

type Props = {
  /** Formulaire controle uniquement : sans ces props, le champ reste non controle. */
  value?: string;
  onChange?: (value: string) => void;
};

/**
 * Champ leurre anti-spam.
 *
 * Sorti de l'ecran plutot que masque en display:none — que certains bots
 * savent detecter — et retire du parcours clavier comme des lecteurs d'ecran.
 * Un robot qui remplit tous les champs du formulaire se trahit en le renseignant.
 */
export default function HoneypotField({ value, onChange }: Props) {
  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", left: "-9999px", top: 0, width: 1, height: 1, overflow: "hidden" }}
    >
      <label htmlFor={HONEYPOT_FIELD}>Ne remplissez pas ce champ</label>
      <input
        id={HONEYPOT_FIELD}
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      />
    </div>
  );
}
