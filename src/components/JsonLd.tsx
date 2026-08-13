/**
 * Injecte un bloc JSON-LD.
 * Le "<" est echappe : une description WooCommerce contenant "</script>"
 * fermerait sinon la balise et injecterait du HTML arbitraire dans la page.
 */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
