// Serverless Function для хранения данных (для обычного хостинга)
// Этот файл можно использовать как шаблон для реализации на вашем сервере
// В продакшене используйте базу данных или файловое хранилище

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'balances-data.json');
const DEFAULT_DATA = {
  pwa_wallet_balance: '1 964,77',
  pwa_sberbonus_balance: '111'
};

// Чтение данных из файла
function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Ошибка чтения файла данных:', e);
  }
  return DEFAULT_DATA;
}

// Запись данных в файл
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Ошибка записи файла данных:', e);
    return false;
  }
}

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
    const store = readData();
    return new Response(
      JSON.stringify({ 
        wallet: store.pwa_wallet_balance || DEFAULT_DATA.pwa_wallet_balance, 
        sberbonus: store.pwa_sberbonus_balance || DEFAULT_DATA.pwa_sberbonus_balance 
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
    
    const currentData = readData();
    currentData.pwa_wallet_balance = wallet;
    currentData.pwa_sberbonus_balance = sberbonus;
    
    const success = writeData(currentData);
    
    if (success) {
      return new Response(
        JSON.stringify({ success: true, wallet, sberbonus }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Ошибка сохранения данных' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: 'Метод не разрешен' }),
    { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
