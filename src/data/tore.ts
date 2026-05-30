// Ölçey'in barındırdığı 10 kural — the moral framework every story must respect.
// Aygucı references this when scoring; players see it on the table at all times.

export type ToreArticle = {
  number: number;
  shortTr: string;
  shortEn: string;
  fullTr: string;
  fullEn: string;
};

export const TORE: ToreArticle[] = [
  {
    number: 1,
    shortTr: 'Buyan',
    shortEn: 'Gratitude',
    fullTr:
      "Ulu Yaratan'ın, gökteki Atalar'ın ve iyelerin desteğinden bol bol Buyan'da (şükür) bulun.",
    fullEn:
      'Offer abundant Buyan (gratitude) for the support of the Great Creator, the Ancestors in the sky, and the iyes.',
  },
  {
    number: 2,
    shortTr: 'Kut',
    shortEn: 'Worth of Kut',
    fullTr: "Göğün verdiği Kut'un kıymetini bil.",
    fullEn: 'Know the worth of the Kut bestowed by the heavens.',
  },
  {
    number: 3,
    shortTr: 'Kolaydan Sakın',
    shortEn: 'Refuse the Easy',
    fullTr: 'Hazır olandan uzak dur.',
    fullEn: 'Keep away from what is merely at hand.',
  },
  {
    number: 4,
    shortTr: 'Zehirleme',
    shortEn: 'No Poison',
    fullTr: 'Ürününü, eylemlerini ve düşüncelerini zehirleme.',
    fullEn: 'Do not poison your work, your deeds, or your thoughts.',
  },
  {
    number: 5,
    shortTr: 'Söz',
    shortEn: 'No Slander',
    fullTr: 'Diline kara çalma.',
    fullEn: 'Do not slander with your tongue.',
  },
  {
    number: 6,
    shortTr: 'Topluluk',
    shortEn: 'Community',
    fullTr: 'İçinde yaşadığın topluma saygı duy.',
    fullEn: 'Respect the community you live within.',
  },
  {
    number: 7,
    shortTr: 'Soy',
    shortEn: 'Lineage',
    fullTr: 'Soyunu ve aileni onurlandır.',
    fullEn: 'Honor your lineage and your family.',
  },
  {
    number: 8,
    shortTr: 'Ana-Oğul',
    shortEn: 'Mother & Son',
    fullTr: 'Ana-oğulu ayırma.',
    fullEn: 'Do not separate mother and son.',
  },
  {
    number: 9,
    shortTr: 'Ata-Ana',
    shortEn: 'Elders',
    fullTr: 'Ata-anayı onurlandır.',
    fullEn: 'Honor father and mother.',
  },
  {
    number: 10,
    shortTr: 'Çevre',
    shortEn: 'Environment',
    fullTr: 'Çevreye zarar verme.',
    fullEn: 'Do not harm the environment.',
  },
];
