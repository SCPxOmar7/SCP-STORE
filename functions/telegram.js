const BOT_TOKEN = "8038860871:AAFXUleGK-jbK93JXFTJDhGYOCZUL0WgOys";
const ADMIN_CHAT_ID = "6061554033";
let isStoreOpen = true; // حالة المتجر

exports.handler = async (event) => {
    try {
        // معالجة طلبات GET (للموقع عشان يعرف حالة المتجر)
        if (event.httpMethod === 'GET') {
            return {
                statusCode: 200,
                body: JSON.stringify({ isStoreOpen })
            };
        }

        // معالجة طلبات POST (من تيليجرام عبر Webhook)
        const update = JSON.parse(event.body);

        // التحقق من الأوامر
        if (update.message && update.message.text === '/toggle_store' && update.message.chat.id == ADMIN_CHAT_ID) {
            isStoreOpen = !isStoreOpen;
            const statusText = isStoreOpen ? 'مفتوح' : 'مغلق';
            await sendTelegramMessage(ADMIN_CHAT_ID, `✅ حالة المتجر: ${statusText}`, {
                inline_keyboard: [
                    [
                        { text: isStoreOpen ? '🔒 قفل المتجر' : '🔓 فتح المتجر', callback_data: 'toggle_store' }
                    ]
                ]
            });
        } else if (update.callback_query && update.callback_query.data === 'toggle_store' && update.callback_query.message.chat.id == ADMIN_CHAT_ID) {
            isStoreOpen = !isStoreOpen;
            const statusText = isStoreOpen ? 'مفتوح' : 'مغلق';
            await sendTelegramMessage(ADMIN_CHAT_ID, `✅ حالة المتجر: ${statusText}`, {
                inline_keyboard: [
                    [
                        { text: isStoreOpen ? '🔒 قفل المتجر' : '🔓 فتح المتجر', callback_data: 'toggle_store' }
                    ]
                ]
            });
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callback_query_id: update.callback_query.id })
            });
        }

        // إرجاع حالة المتجر للموقع
        return {
            statusCode: 200,
            body: JSON.stringify({ isStoreOpen })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};

async function sendTelegramMessage(chatId, text, replyMarkup = {}) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown',
            reply_markup: replyMarkup
        })
    });
    return await response.json();
}
