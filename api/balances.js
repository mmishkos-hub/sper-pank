// Vercel Serverless Function для хранения данных
export const config = {
  runtime: 'edge',
};

// Простое хранилище в памяти (для демонстрации)
// В продакшене нужно использовать Vercel KV или базу данных
let store = {
  pwa_wallet_balance: '1 964,77',
  pwa_sberbonus_balance: '111'
};

export default async function handler(req) {
  // Разрешаем CORS для запросов с фронтенда
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method === 'GET') {
    // Получение данных
    return new Response(
      JSON.stringify({ 
        wallet: store.pwa_wallet_balance || '1 964,77', 
        sberbonus: store.pwa_sberbonus_balance || '111' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  if (req.method === 'POST') {
    // Сохранение данных
    const body = await req.json();
    const { wallet, sberbonus } = body;
    
    if (!wallet || !sberbonus) {
      return new Response(
        JSON.stringify({ error: 'Необходимо указать wallet и sberbonus' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    store.pwa_wallet_balance = wallet;
    store.pwa_sberbonus_balance = sberbonus;
    
    return new Response(
      JSON.stringify({ success: true, wallet, sberbonus }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Метод не разрешен' }),
    { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
