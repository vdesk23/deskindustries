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
  total: 10,
  url: "https://www.google.com/maps/search/?api=1&query=Desk+Industries+SRLS",
};

export const DESK_GOOGLE_REVIEWS: StaticGoogleReview[] = [
  {
    author: "Federica Cecere",
    rating: 5,
    relativeTime: "2 giorni fa",
    text: "Ho avuto modo di conoscere l'agenzia di Valerio Cattedra e mi sono trovata molto bene. L'approccio è pratico e concreto.",
  },
  {
    author: "Paola Piccirilli",
    rating: 5,
    relativeTime: "2 giorni fa",
    text: "Agenzia affidabile e competente. Consigliatissima.",
  },
  {
    author: "Alessandra Cascioli",
    rating: 5,
    relativeTime: "2 giorni fa",
    text: "Desk Industries, agenzia di Valerio Cattedra, è stata il mio punto di riferimento fondamentale per il completamento del mio progetto.",
  },
  {
    author: "Caterina Barretta",
    rating: 5,
    relativeTime: "1 giorno fa",
    text: "Ho avuto una consulenza con Valerio Cattedra e sono rimasta impressionata dalla sua preparazione e dalla sua capacità di mettere a fuoco le priorità.",
  },
  {
    author: "Lory Casella",
    rating: 5,
    relativeTime: "1 giorno fa",
    text: "I consigli di Valerio sono molto utili per far crescere il mio progetto sui Social.",
  },
  {
    author: "Elena De Mare",
    rating: 5,
    relativeTime: "1 giorno fa",
    text: "Una sessione molto interessante con Valerio. Chiaro e coinvolgente sui temi trattati.",
  },
  {
    author: "Chiara Lorenzi",
    rating: 5,
    relativeTime: "1 giorno fa",
    text: "Grazie Valerio Cattedra per gli utilissimi consigli che mi hai dato, continuerò senz'altro a seguirti.",
  },
  {
    author: "Monica Irene Oddone",
    rating: 5,
    relativeTime: "2 ore fa",
    text: "Ho appena avuto una consulenza con Valerio. Quello che più mi ha colpita, oltre alla preparazione, è la chiarezza con cui mi ha aiutata a vedere i prossimi passi.",
  },
  {
    author: "Simone Fanelli",
    rating: 5,
    relativeTime: "2 mesi fa",
    text: "Professionista preparato, giusto nei costi. Un aiuto vero per le aziende che cercano maggiore visibilità online. Consiglio vivamente.",
  },
  {
    author: "Antonio Sciacca",
    rating: 5,
    relativeTime: "10 mesi fa",
    text: "È veramente difficile trovare professionisti preparati e competenti come Valerio. Se sei una persona che pensa in grande, devi rivolgerti a professionisti che pensano altrettanto in grande. Valerio è quella persona.",
  },
];
