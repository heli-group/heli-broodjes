// ============================================================
//  INSTELLINGEN VAN DE BESTELPAGINA
//  Dit bestand mag je aanpassen. Alles wat hier staat is
//  OPENBAAR leesbaar op GitHub: zet hier nooit een wachtwoord in.
//  (De "publishable key" van Supabase is wel bedoeld om openbaar te zijn:
//   de database laat via die sleutel enkel de functie "api" toe.)
// ============================================================
window.BROODJES = {
  // Testmodus: true = er worden geen echte bestellingen gemaakt.
  // De gegevens blijven in de browser. Zet op false zodra de database werkt.
  demo: false,

  // Supabase (de database). Beide invullen = echte bestellingen.
  supabaseUrl: "https://cfiwcjxznzxirnvrpkku.supabase.co",
  supabaseKey: "sb_publishable_lBxq-tPKSW7CGAytqeU5RA_AOujkXun",   // openbare sleutel (publishable key), mag zichtbaar zijn

  // Alternatief: het webadres van de flow "IT-Broodjes-API" (Power Automate). Leeg laten bij Supabase.
  apiUrl: "",

  // Mail naar de broodjeszaak: "manual" = de beheerder kopieert de mail en verstuurt ze zelf uit Outlook.
  // "auto" = de flow/database verstuurt ze zelf (komt later).
  mailMode: "manual"
};
