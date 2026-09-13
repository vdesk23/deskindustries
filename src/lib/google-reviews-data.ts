export interface StaticGoogleReview {
  author: string;
  rating: number;
  relativeTime: string;
  text: string;
}

export interface StaticGooglePlace {
  name: string;
  rating: number;
  total: number;
  url: string;
}

// URL pubblico del profilo Google Maps di Desk Industries SRLS.
// Punta a una ricerca diretta finché non avremo lo short link ufficiale.
export const DESK_GOOGLE_PLACE: StaticGooglePlace = {
  name: "Desk Industries SRLS",
  rating: 5.0,
  total: 12,
  url: "https://www.google.com/maps/search/?api=1&query=Desk+Industries+SRLS",
};

export const DESK_GOOGLE_REVIEWS: StaticGoogleReview[] = [
  {
    author: "Cristallo Immobiliare",
    rating: 5,
    relativeTime: "1 mese fa",
    text: "Preparatissimi. Un abbraccio in particolare a Valerio, punto di riferimento e persona fidata.",
  },
  {
    author: "Francesca Romana",
    rating: 5,
    relativeTime: "1 mese fa",
    text: "Team affidabile e competente. Si approcciano al lavoro ascoltando le necessità del cliente e realizzandole. Per me, che non ne capisco molto di questo mondo e delle sue dinamiche, sono utilissimi per la mia attività.",
  },
  {
    author: "Simone Fanelli",
    rating: 5,
    relativeTime: "1 mese fa",
    text: "Persone competenti che con impegno serio ti fanno raggiungere obiettivi veri. La mia azienda da quando ha iniziato a collaborare con loro ha avuto una crescita concreta.",
  },
  {
    author: "Sergio Maravigna",
    rating: 5,
    relativeTime: "1 mese fa",
    text: "Professionali, disponibili, brillanti e soprattutto, empatici e pieni di entusiasmo!!!",
  },
  {
    author: "Mauro Curi",
    rating: 5,
    relativeTime: "1 mese fa",
    text: "Ho richiesto un software customizzato per esigenze commerciali di fatturazione/bolle e carico scarico merci, ho avuto una risposta rapida semplice ed un programma che ha soddisfatto tutte le mie richieste.",
  },
  {
    author: "Marisela Portagnuolo",
    rating: 5,
    relativeTime: "5 mesi fa",
    text: "Molto competente e gentili!",
  },
  {
    author: "Anthony Ferrigno",
    rating: 5,
    relativeTime: "6 mesi fa",
    text: "Ho conosciuto Valerio e Francesco che gestiscono da ottobre la mia attività on-Line ed hanno fatto anche il sito. Ringrazio molto per la loro professionalità.",
  },
  {
    author: "jessica gabrielli",
    rating: 5,
    relativeTime: "10 mesi fa",
    text: "Ottime lezioni con Valerio! Spiegazioni molto chiare!! E creazione sito top! Assistenza molto presente, grazie!",
  },
  {
    author: "silvia todesco",
    rating: 5,
    relativeTime: "10 mesi fa",
    text: "Apprezzo molto la chiarezza comunicativa con cui Valerio espone concetti di marketing digitale per renderli fruibili anche ai meno esperti!",
  },
  {
    author: "Antonio Sciacca",
    rating: 5,
    relativeTime: "10 mesi fa",
    text: "È veramente difficile trovare professionisti preparati e competenti come Valerio. Se sei una persona che pensa in grande, devi rivolgerti a professionisti che pensano altrettanto in grande. Valerio è quella persona.",
  },
];
