// Скрипт для обновления балансов с сервера Vercel
(function() {
    const API_URL = '/api/balances';
    const WALLET_KEY = 'pwa_wallet_balance';
    const SBERBONUS_KEY = 'pwa_sberbonus_balance';
    const DEFAULT_WALLET = '1 964,77';
    const DEFAULT_SBERBONUS = '111';

    async function updateBalances() {
        let walletValue = DEFAULT_WALLET;
        let sberbonusValue = DEFAULT_SBERBONUS;

        // Пытаемся загрузить данные с сервера
        try {
            const response = await fetch(API_URL, { method: 'GET' });
            if (response.ok) {
                const data = await response.json();
                walletValue = data.wallet || localStorage.getItem(WALLET_KEY) || DEFAULT_WALLET;
                sberbonusValue = data.sberbonus || localStorage.getItem(SBERBONUS_KEY) || DEFAULT_SBERBONUS;
            } else {
                // Fallback на localStorage если сервер недоступен
                walletValue = localStorage.getItem(WALLET_KEY) || DEFAULT_WALLET;
                sberbonusValue = localStorage.getItem(SBERBONUS_KEY) || DEFAULT_SBERBONUS;
            }
        } catch (e) {
            console.log('Ошибка загрузки с сервера, используем localStorage', e);
            // Fallback на localStorage если сервер недоступен
            walletValue = localStorage.getItem(WALLET_KEY) || DEFAULT_WALLET;
            sberbonusValue = localStorage.getItem(SBERBONUS_KEY) || DEFAULT_SBERBONUS;
        }

        // Обновляем баланс кошелька
        const walletElement = document.getElementById('wallet-balance-amount');
        if (walletElement) {
            walletElement.textContent = walletValue;
        }

        // Обновляем бонусы СберСпасибо
        const sberbonusElement = document.getElementById('sberbonus-balance');
        if (sberbonusElement) {
            sberbonusElement.textContent = sberbonusValue;
        }
    }

    // Запускаем после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateBalances);
    } else {
        updateBalances();
    }

    // Слушаем изменения localStorage (для обновления при возврате с админки)
    window.addEventListener('storage', updateBalances);
})();
