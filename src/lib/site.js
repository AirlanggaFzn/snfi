import id from '../i18n/id.json';
import en from '../i18n/en.json';
import katalog from '../data/products.json';
import site from '../data/site.json';

export { site, katalog };
export const langs = ['id', 'en'];
export const dict = { id, en };

/** segmen URL per bahasa */
export const ROUTE = {
  katalog: { id: 'katalog', en: 'catalog' },
  produk:  { id: 'produk',  en: 'products' },
  tentang: { id: 'tentang', en: 'about' },
  kontak:  { id: 'kontak',  en: 'contact' },
};

export function t(lang, key, vars) {
  let s = dict[lang][key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}

/** path(lang) -> /id/ ; path(lang,'katalog') ; path(lang,'produk','aust-striploin') */
export function path(lang, key, slug) {
  if (!key) return `/${lang}/`;
  const seg = ROUTE[key][lang];
  return slug ? `/${lang}/${seg}/${slug}/` : `/${lang}/${seg}/`;
}

/** { id: '/id/...', en: '/en/...' } untuk hreflang + tombol ganti bahasa */
export function alternates(key, slug) {
  return Object.fromEntries(langs.map((l) => [l, path(l, key, slug)]));
}

export const nama = (p, lang) => (lang === 'en' ? p.nama_en : p.nama_id);
export const kategoriDari = (slug) => katalog.kategori.find((k) => k.slug === slug);

export function waLink(teks) {
  return `https://wa.me/${site.wa}?text=${encodeURIComponent(teks)}`;
}
