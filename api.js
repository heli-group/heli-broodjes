// Praat met de flow (of met de testmodus). Eén adres, de "action" bepaalt wat er gebeurt.
window.Api = {
  async call(body) {
    const cfg = window.BROODJES || {};
    if (cfg.demo || !cfg.apiUrl) return window.DemoApi.handle(body);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 45000);
    try {
      // text/plain voorkomt een "preflight"-controle van de browser die Power Automate niet beantwoordt
      const res = await fetch(cfg.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify(body),
        signal: ctrl.signal
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }
};
