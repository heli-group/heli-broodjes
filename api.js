// Praat met de database (Supabase), de flow (Power Automate) of de testmodus.
// Eén functie, de "action" bepaalt wat er gebeurt.
window.Api = {
  async call(body) {
    const cfg = window.BROODJES || {};
    if (cfg.demo || (!cfg.supabaseUrl && !cfg.apiUrl)) return window.DemoApi.handle(body);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 45000);
    try {
      let res;
      if (cfg.supabaseUrl) {
        // Supabase: de database-functie "api" (enkel deze functie is bereikbaar, alle tabellen zijn afgesloten)
        res = await fetch(cfg.supabaseUrl.replace(/\/$/, '') + '/rest/v1/rpc/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': cfg.supabaseKey },
          body: JSON.stringify({ body: body }),
          signal: ctrl.signal
        });
      } else {
        // Power Automate: text/plain voorkomt een "preflight"-controle die de flow niet beantwoordt
        res = await fetch(cfg.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: JSON.stringify(body),
          signal: ctrl.signal
        });
      }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }
};
