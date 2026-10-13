const API_BASE_URL = 'https://api.coingecko.com/api/v3';
const REQUEST_TIMEOUT_MS = 10_000;
const CACHE_TTL_MS = 60_000;
const cache = new Map();

/**
 * Error de dominio que conserva el estado HTTP y permite distinguir los
 * límites de cuota, los fallos de red y las respuestas inválidas.
 */
export class CryptoApiError extends Error {
  constructor(message, { status = 0, code = 'API_ERROR' } = {}) {
    super(message);
    this.name = 'CryptoApiError';
    this.status = status;
    this.code = code;
  }
}

// Datos de último recurso para que el panel siga siendo navegable sin red.
const MOCK_MARKETS = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: '', current_price: 67432.18, market_cap: 1328000000000, market_cap_rank: 1, total_volume: 28400000000, price_change_percentage_24h: 2.41, circulating_supply: 19700000 },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: '', current_price: 3521.74, market_cap: 423000000000, market_cap_rank: 2, total_volume: 14200000000, price_change_percentage_24h: 1.18, circulating_supply: 120100000 },
  { id: 'tether', symbol: 'usdt', name: 'Tether', image: '', current_price: 1.00, market_cap: 112000000000, market_cap_rank: 3, total_volume: 42100000000, price_change_percentage_24h: 0.02, circulating_supply: 112000000000 },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB', image: '', current_price: 598.42, market_cap: 88000000000, market_cap_rank: 4, total_volume: 1620000000, price_change_percentage_24h: -0.84, circulating_supply: 147580000 },
  { id: 'solana', symbol: 'sol', name: 'Solana', image: '', current_price: 178.63, market_cap: 79600000000, market_cap_rank: 5, total_volume: 3180000000, price_change_percentage_24h: 4.76, circulating_supply: 445500000 },
  { id: 'usd-coin', symbol: 'usdc', name: 'USDC', image: '', current_price: 1.00, market_cap: 32500000000, market_cap_rank: 6, total_volume: 5840000000, price_change_percentage_24h: -0.01, circulating_supply: 32500000000 },
  { id: 'ripple', symbol: 'xrp', name: 'XRP', image: '', current_price: 0.623, market_cap: 34100000000, market_cap_rank: 7, total_volume: 1120000000, price_change_percentage_24h: 0.56, circulating_supply: 54700000000 },
  { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', image: '', current_price: 0.164, market_cap: 23600000000, market_cap_rank: 8, total_volume: 738000000, price_change_percentage_24h: -1.32, circulating_supply: 144000000000 },
  { id: 'toncoin', symbol: 'ton', name: 'Toncoin', image: '', current_price: 7.24, market_cap: 17800000000, market_cap_rank: 9, total_volume: 298000000, price_change_percentage_24h: 3.08, circulating_supply: 2450000000 },
  { id: 'cardano', symbol: 'ada', name: 'Cardano', image: '', current_price: 0.482, market_cap: 17100000000, market_cap_rank: 10, total_volume: 316000000, price_change_percentage_24h: -0.47, circulating_supply: 35400000000 },
];

const MOCK_GLOBAL = {
  data: {
    total_market_cap: { usd: 2_480_000_000_000 },
    total_volume: { usd: 78_400_000_000 },
    market_cap_change_percentage_24h_usd: 2.16,
  },
};

async function requestJson(path, { signal } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const forwardAbort = () => controller.abort();

  if (signal) {
    if (signal.aborted) forwardAbort();
    else signal.addEventListener('abort', forwardAbort, { once: true });
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });

    if (!response.ok) {
      const limited = response.status === 429;
      throw new CryptoApiError(
        limited
          ? 'CoinGecko ha limitado temporalmente las peticiones. Mostrando datos de respaldo.'
          : `CoinGecko respondió con HTTP ${response.status}.`,
        { status: response.status, code: limited ? 'RATE_LIMIT' : 'HTTP_ERROR' },
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof CryptoApiError) throw error;
    if (error.name === 'AbortError') {
      throw new CryptoApiError('La petición a CoinGecko superó el tiempo máximo de espera.', {
        code: 'TIMEOUT',
      });
    }
    throw new CryptoApiError('No se pudo conectar con CoinGecko. Comprueba tu conexión.', {
      code: 'NETWORK_ERROR',
    });
  } finally {
    clearTimeout(timeout);
    if (signal) signal.removeEventListener('abort', forwardAbort);
  }
}

async function loadWithCache(key, path, fallback, options) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
    return { data: cached.data, source: 'cache', warning: '' };
  }

  try {
    const data = await requestJson(path, options);
    cache.set(key, { data, savedAt: Date.now() });
    return { data, source: 'api', warning: '' };
  } catch (error) {
    // Se devuelve respaldo con causa explícita; la interfaz no lo presenta
    // como si fueran datos actuales recibidos correctamente de la API.
    return { data: fallback, source: 'mock', warning: error.message, error };
  }
}

/** Obtiene los principales mercados; CoinGecko devuelve hasta 100 activos. */
export function getMarkets({ signal } = {}) {
  const query = new URLSearchParams({
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: '100',
    page: '1',
    sparkline: 'false',
    price_change_percentage: '24h',
  });

  return loadWithCache('markets', `/coins/markets?${query}`, MOCK_MARKETS, { signal });
}

/** Obtiene métricas globales, con un respaldo coherente para modo sin conexión. */
export function getGlobalMetrics({ signal } = {}) {
  return loadWithCache('global', '/global', MOCK_GLOBAL, { signal });
}
