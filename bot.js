const mineflayer = require('mineflayer');

// === CONFIGURATION ===
const botNames = [
    'talhapro1098', 'talha1099', 'talha2099', 'talha3099', 'talha4099',
    'talha5099', 'talha6099', 'talha7099', 'talha8099', 'talha9099'
];
const serverHost = 'play.applemc.fun';
const serverPort = 25565;
const serverVersion = '1.20.1';
const botPassword = 'likese11';
const joinDelay = 20000; // 20 sec delay between bots

// === GLOBAL VARIABLES ===
const messageCounts = {};
const activeBots = {};
let botJoinDelay = 0;

// === FUNCTIONS ===
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function printMessageCounts() {
    console.clear();
    console.log('📩 Active Bots & Message Counts:');
    Object.keys(activeBots).forEach(name => {
        if (activeBots[name]) {
            console.log(`✅ ${name}: Messages [${messageCounts[name]}]`);
        } else {
            console.log(`❌ ${name}: Not joined yet.`);
        }
    });
}

function createBot(username) {
    setTimeout(() => {
        const bot = mineflayer.createBot({
            host: serverHost,
            port: serverPort,
            username: username,
            version: serverVersion,
            auth: 'offline'
        });

        messageCounts[username] = 0;
        activeBots[username] = false;

        bot.on('login', () => {
            console.log(`✅ ${username} logged in!`);
        });

        bot.on('spawn', async () => {
            console.log(`🎮 ${username} spawned in!`);
            await delay(3000);
            openRealm(bot, username);
        });

        bot.on('message', async (message) => {
            const msg = message.toString();

            if (activeBots[username]) {
                messageCounts[username]++;
                printMessageCounts();
            }

            if (msg.includes('/register')) {
                await delay(2000);
                bot.chat(`/register ${botPassword} ${botPassword}`);
            } else if (msg.includes('/login')) {
                await delay(2000);
                bot.chat(`/login ${botPassword}`);
            }
        });

        bot.on('kicked', (reason) => {
            console.log(`❌ ${username} was kicked: ${reason}`);
            console.log(`🔁 Reconnecting ${username} in 30s...`);
            setTimeout(() => createBot(username), 30000);
        });

        bot.on('end', () => {
            console.log(`🔄 ${username} disconnected. Reconnecting in 30s...`);
            setTimeout(() => createBot(username), 30000);
        });

        bot.on('error', (err) => {
            console.log(`❌ ${username} error:`, err.message);
        });
    }, botJoinDelay);

    botJoinDelay += joinDelay;
}

async function openRealm(bot, username) {
    await delay(3000);
    bot.setQuickBarSlot(4);
    await delay(2000);
    bot.clearControlStates();
    await delay(1000);
    bot.activateItem();
    await delay(5000);

    let attempts = 3;
    while (!bot.currentWindow && attempts > 0) {
        console.log(`❌ ${username} Realm menu not open! Retrying (${attempts} left)...`);
        await delay(2000);
        bot.activateItem();
        await delay(5000);
        attempts--;
    }

    if (!bot.currentWindow) {
        console.log(`❌ ${username} Failed to open realm selector.`);
        return;
    }

    const realmDye = bot.currentWindow.slots.find(item => item && item.name.includes('yellow_dye'));
    if (!realmDye) {
        console.log(`❌ ${username} Yellow dye not found!`);
        return;
    }

    let clickAttempts = 3;
    while (clickAttempts > 0) {
        console.log(`🖱 ${username} Clicking yellow dye... (${4 - clickAttempts}/3)`);
        await bot.clickWindow(realmDye.slot, 0, 0);
        await delay(2000);
        if (!bot.currentWindow) {
            console.log(`✅ ${username} Entered realm!`);
            break;
        }
        clickAttempts--;
    }

    if (clickAttempts === 0) {
        console.log(`❌ ${username} Failed to click dye.`);
        return;
    }

    await delay(3000);
    bot.chat('/warp afk');
    console.log(`🚀 ${username} executed /warp afk.`);

    // === STOP EVERYTHING AFTER WARP ===
    activeBots[username] = true;
    printMessageCounts();
    bot.removeAllListeners('spawn');   // No more spawn events
}

// === START BOTS ===
botNames.forEach(name => createBot(name));
