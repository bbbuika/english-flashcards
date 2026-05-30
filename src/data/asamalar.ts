// Aşama metadata — the Hero's Journey stages each card belongs to.
//
// A card's printed `number` (in cards.json) equals its Aşama number.
//   number 0  = Aşama 0/14 — runes, ruhlar (ÖZÜT/SÜNNE/SÜLDE), erk (KUT/MAYTERE),
//               dikotomik (YARUK/KARARIG)
//   number 1  = Aşama 1   — Maceraya Çağrı (ATEŞ, EJDERHA, AK ENE)
//   number 2  = Aşama 2   — Çağrının Reddi (YILAN, ERLİK, KUNDUZ)
//   number 3  = Aşama 3   — Doğaüstü Yardım (OD/SU/ORMAN İYESİ)
//   number 4  = Aşama 4   — İlk Eşik (MADEN, GESAR, MADEN İYESİ)
//   number 5  = Aşama 5   — Balinanın Karnı (TOPRAK, BOĞA, KAM)
//   number 6  = Aşama 6   — Sınavlar Yolu (YOL İYESİ, HOROZ, YARLIK)
//   number 7  = Aşama 7   — Tanrıça ile Tanışma (UMAY, KÜN ANA, KURT)
//   number 8  = Aşama 8   — Baştan Çıkarıcı: Kadın (MERGEN, KIZAGAN, ÖD TENGRİ)
//   number 9  = Aşama 9   — Baba ile Telafi (ÜLGEN, AT, KAPLAN)
//   number 10 = Aşama 10  — Kutsanma (TAVŞAN, KOYUN, KÖPEK)
//   number 11 = Aşama 11  — Nihai Ödül (SU, HAMAM/EV İYESİ)
//   number 12 = Aşama 12  — Dönüşün Reddi (FARE, AY DEDE, DOMUZ)
//   number 13 = Aşama 13  — Büyülü Kaçış (HAVA, KIR İYESİ, YAYIK)
//   number 14 = Aşama 14  — Dışarıdan Kurtuluş (MAYMUN, GEYİK, AYI)
//   number 15 = Aşama 15  — Dönüş Eşiğinin Aşılması (KELOĞLAN, BALAMİR, TONYUKUK)
//   number 16 = Aşama 16  — İki Dünyanın Ustası (DELİ DUMRUL, DEDE KORKUT, AYAZ ATA)
//   number 17 = Aşama 17  — Yaşama Özgürlüğü (KÜRŞAD, KÖROĞLU, TOMRİS)

export type GamePhase = 'oyun-basi' | 'oyun-ortasi' | 'oyun-sonu';

export type Asama = {
  number: number;
  name: { tr: string; en: string };
  meaning: { tr: string; en: string };
  /** Which game phase(s) this Aşama is appropriate for. */
  phases: GamePhase[];
  /** Scoring rule label as it appears in the spreadsheet (e.g. "0/14", "1/3", "4/3"). */
  puan: string;
  /** Notes for the Aygucı when scoring this Aşama. */
  notlar: { tr: string; en: string };
  /** Jung tags from the spreadsheet (free-form tags). */
  jung: string[];
};

export const ASAMALAR: Asama[] = [
  {
    number: 0,
    name: {
      tr: 'Üst Sınır (Rünler, Ruhlar, Erk)',
      en: 'Outer Boundary (Runes, Souls, Erk)',
    },
    meaning: {
      tr: 'Evrenin dokusuna dair ifadeler için ihtiyaç duyulan karttır. Olağan hayatta düz insan başlangıç noktasıdırlar.',
      en: 'Cards for expressions about the fabric of the universe. Starting points for ordinary humans.',
    },
    phases: ['oyun-basi', 'oyun-ortasi', 'oyun-sonu'],
    puan: '0/14',
    notlar: {
      tr: "Anlatıcı doğru kullanım tam puanı 17'dir. Töre karar verir. Takas değeri en yüksek kart grubudur. 3 kart alır.",
      en: "Narrator's full-correct-use score is 17. The Töre decides. Highest trade value of any card group; takes 3 cards.",
    },
    jung: ['Kaos', 'Gölge', 'Persona', 'Anima', 'Psişe', '#Bireyselleşme', '#dışadönük duyumsal; içe dönük sezgisel'],
  },
  {
    number: 1,
    name: { tr: 'Maceraya Çağrı', en: 'Call to Adventure' },
    meaning: {
      tr: 'Sıradan dünyanın ritim bozucusunu kasteder. Başlangıçtır. Yüksek yaratım gücü, bir maceraya çağrı.',
      en: 'The rhythm-breaker of the ordinary world. A beginning. High creative force, a call to adventure.',
    },
    phases: ['oyun-basi', 'oyun-ortasi'],
    puan: '1/3',
    notlar: {
      tr: "Anlatıcı olağanüstü anlatım puanı 3'tür. Töre bilir; bazen başlangıç sonundaki ılıklığı da taşır, 3 alınır.",
      en: "Narrator's extraordinary-narration score is 3. The Töre knows; sometimes it carries the warmth at the end of a beginning, 3 is awarded.",
    },
    jung: ['Self', 'Psişe'],
  },
  {
    number: 2,
    name: { tr: 'Çağrının Reddi', en: 'Refusal of the Call' },
    meaning: {
      tr: 'Yılın dik ortasını, gizlenen şifayı ve olayın görünmeyen gizemini eklemek için biçilmiş kaftan olan bu kart ile virgül koymak çok kolay. Yarım kalan işleri bitirmek için gösterilen gayreti de barındırır, ancak dikkat: bu bir reddediştir, olması gerekenin önünde olanla durmayı gerektirir. Yetinmektir, doymak, yeniyi yemek, yer açmamak.',
      en: "Perfect for adding the year's high noon, the hidden cure, and the unseen mystery of an event. Carries the effort to finish half-done work, but watch out — it is a refusal, stopping at what is in front of what should be. To make do, to be sated, to eat the new without making space.",
    },
    phases: ['oyun-ortasi', 'oyun-sonu'],
    puan: '2/3',
    notlar: {
      tr: "Hasatın başlangıcıdır. Büyük bir sabrın sonunu kasteder. Büyük adaklar için ideal zamandır. Gayret için iyi bir nefes anı.",
      en: 'The start of the harvest. The end of a great patience. Ideal time for big vows. A good breath-moment for striving.',
    },
    jung: [],
  },
  {
    number: 3,
    name: { tr: 'Doğaüstü Yardım', en: 'Supernatural Aid' },
    meaning: {
      tr: "İlhamın içe dönük yapısı devreye girer; kişinin akıl hocası yankılanan kendi sesidir. Öte yandan kalsifer etkisi de devam eder — tanık olarak pişen zeminde Od İyesi, tüten ve dikkat edilmesi gereken bir ateşe... 'Düşman etrafımızda ocak gibiydi, biz içindeki ateş.' Reddedişin ardında yatan cevval bir savaş yardımıdır. Macera sonuna kadar açılan bir yardım. Genelde kendilerinden gelir; ancak isterlerse deste-elinizle uygun karta doğaüstü yardım için destek rolü oynar.",
      en: "Inspiration's introverted nature takes over; the mentor is one's own echoing voice. Meanwhile the Calcifer effect continues — Od İyesi as witness on the smouldering ground, a smoking fire to be watched. 'The enemy was a hearth around us; we were the fire inside.' A bold combat-aid behind the refusal. An aid that stays open until the end of the adventure. Usually comes unbidden, but can also act as a supernatural-aid support for a suitable card in deck or hand.",
    },
    phases: ['oyun-basi', 'oyun-ortasi', 'oyun-sonu'],
    puan: '1 3/3',
    notlar: {
      tr: "Desteklediği karta 10 puan ekler. Kendi puanı 1 ya da 3/3'tür.",
      en: 'Adds 10 points to the card it supports. Its own score is 1 or 3/3.',
    },
    jung: ['#dışa dönük sezgisel; içedönük mantıklı', '#animus', '#kendilik'],
  },
  {
    number: 4,
    name: { tr: 'İlk Eşiği Geçmek', en: 'Crossing the First Threshold' },
    meaning: {
      tr: 'Açığa çıkan cevheri ve edilen çetin savaşa mağlup olan sıradanlığı sıradışı ile müşerref ettiğiniz andır. Bir aydınlanma, bir düşüş, bir uçuş gibi — gerçeği değiştirmektir, bükebilmektir. Eşiğin aşılmasıdır. Çetindir; boyut değiştirmek yorar.',
      en: 'The moment you grace the unearthed ore and the ordinariness defeated by the hard fight with the extraordinary. Like an awakening, a fall, or a flight — bending and changing reality. The threshold is crossed. It is hard; shifting dimensions tires you.',
    },
    phases: ['oyun-sonu'],
    puan: '4/3',
    notlar: {
      tr: "Bir tam bir bölü 3'tür; her üçleme bir edebilir. Töre bilir.",
      en: 'One whole over three; each triplet may amount to one. The Töre knows.',
    },
    jung: ['#erginlenme', '#dışa dönük mantıklı; içe dönük hissel'],
  },
  {
    number: 5,
    name: { tr: 'Balinanın Karnı', en: "Belly of the Whale" },
    meaning: {
      tr: 'Balinanın karnı aşamasıdır. Yolculuğun en büyük sancısı olan insiasyon sancısıdır. Pek çok zıtlığa gebedir. Çember bitimidir. Kurak ve yorgundur. Ölümü ve dönüşümü de barındırır.',
      en: 'The belly-of-the-whale stage. The greatest pang of the journey, the pang of initiation. Pregnant with many opposites. The closing of the circle. Dry and tired. Holds death and transformation within it.',
    },
    phases: ['oyun-basi', 'oyun-ortasi', 'oyun-sonu'],
    puan: '5/3',
    notlar: {
      tr: 'Hikayelerin en sevilmeyen sahneleri için atmosferdirler. Takas değerleri yoktur. Dirilişe bağlanışa göre Töre ne yapması gerektiğini bilir.',
      en: 'The atmosphere of stories\' least-loved scenes. They have no trade value. Depending on how it ties into rebirth, the Töre knows what to do.',
    },
    jung: ['#içe dönük dürtüsel', '#erginleşme', '#gölge', 'Persona', 'Bireyselleşme'],
  },
  {
    number: 6,
    name: { tr: 'Sınavlar Yolu', en: 'Road of Trials' },
    meaning: {
      tr: 'Yol hep bilinmezlikle nasıl baş ettiğine dair bir başka bilinmezliktir. Adil olmayan, altı boş olan, politik necis bir şeydir. Nihayeti her dem senden çıkar, sana varır. Yol İyesi toleranslıdır; ancak bilinsin ki saygısızlığı kabul etmez.',
      en: "The road is always another unknown about how you cope with the unknown. Unjust, hollow, politically defiled. Its end always leaves from you and arrives at you. Yol İyesi is tolerant — but be aware, will not accept disrespect.",
    },
    phases: ['oyun-ortasi'],
    puan: '2 (6/3)',
    notlar: {
      tr: 'Kart değerini Töre bilir. Yolu ve yolcuyu anlamayan Aygucı olamaz.',
      en: "The Töre knows the card's value. One who does not understand the road and the traveler cannot be an Aygucı.",
    },
    jung: [],
  },
  {
    number: 7,
    name: { tr: 'Tanrıça ile Tanışma', en: 'Meeting with the Goddess' },
    meaning: {
      tr: 'Tanrıçayla tanışma her an gerçekleşebilir bir eylem olmakla birlikte, bir takım sınavların ardından belirişleri her zaman hayra alamet değildir. Ancak daha büyük sınavların önünde bir durak olurlar. Olağan zamanda orantısız sayılacak bir güç hareketlenmesi tetiklenir.',
      en: 'Meeting the Goddess can happen at any moment, yet appearances after a series of trials are not always a good omen. Still, they are a stop before greater trials. A disproportionate movement of power is triggered.',
    },
    phases: ['oyun-basi', 'oyun-ortasi', 'oyun-sonu'],
    puan: '7/3',
    notlar: {
      tr: 'Özel yardımlardan bahsetmek için biçilmiş kaftandır. Ya da büyük farkedişler.',
      en: 'Perfect for speaking of special aids. Or great realizations.',
    },
    jung: ['#anima', 'kolektif bilinçdışı unsurlarını bilinen bölgesine dahil etme'],
  },
  {
    number: 8,
    name: { tr: 'Baştan Çıkarıcı: Kadın', en: 'Woman as Temptress' },
    meaning: {
      tr: 'Kadının silahları olan güzellik, zerafet, letafet, mizah, edep, bilgi, ilim gibi unsurlara dalıp zaman, hafıza ve savaş gibi unsurlardan uzaklaşma evresidir.',
      en: 'The phase of immersing in beauty, grace, charm, humour, virtue, knowledge and learning — and drifting away from time, memory and war.',
    },
    phases: ['oyun-basi', 'oyun-ortasi'],
    puan: '8/3',
    notlar: {
      tr: 'Akıllıca kullanıldığında doğru silahlanma evresidir.',
      en: 'When used wisely, this is the right arming phase.',
    },
    jung: ['#gölge', '#persona'],
  },

  // TODO — Aşama 9 (Baba ile Telafi, KAPLAN/ÜLGEN üstte) — Excel'de başlanmış,
  // anlamı/puanı henüz yazılmamış. Aynı şablonu kullanarak doldur:
  // {
  //   number: 9,
  //   name: { tr: 'Baba ile Telafi', en: 'Atonement with the Father' },
  //   meaning: { tr: '...', en: '...' },
  //   phases: ['oyun-ortasi', 'oyun-sonu'],
  //   puan: '9/3',
  //   notlar: { tr: '...', en: '...' },
  //   jung: [],
  // },
  //
  // Aynı şekilde Aşama 10..17 için doldurulacak:
  //   10  — Kutsanma                        (TAVŞAN, KOYUN, KÖPEK)
  //   11  — Nihai Ödül                      (SU, HAMAM İYESİ, EV İYESİ)
  //   12  — Dönüşün Reddi                   (FARE, AY DEDE, DOMUZ)
  //   13  — Büyülü Kaçış                    (HAVA, KIR İYESİ, YAYIK)
  //   14  — Dışarıdan Gelen Kurtuluş        (MAYMUN, GEYİK, AYI)
  //   15  — Dönüş Eşiğinin Aşılması         (KELOĞLAN, BALAMİR, TONYUKUK)
  //   16  — İki Dünyanın Ustası             (DELİ DUMRUL, DEDE KORKUT, AYAZ ATA)
  //   17  — Yaşama Özgürlüğü                (KÜRŞAD, KÖROĞLU, TOMRİS)
];

const ASAMA_BY_NUMBER = new Map<number, Asama>(ASAMALAR.map((a) => [a.number, a]));

export function getAsama(num: number | null | undefined): Asama | undefined {
  if (num == null) return undefined;
  return ASAMA_BY_NUMBER.get(num);
}

/** Heuristic mapping from a card's `number` field to its Aşama (same value). */
export function asamaForCardNumber(cardNumber: number | null): Asama | undefined {
  return getAsama(cardNumber);
}
