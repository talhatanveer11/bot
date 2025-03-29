const mineflayer = require('mineflayer');

const botNames = [
    'talhapro1098', 'talha1099', 'talha2099', 'talha3099', 'talha4099',
    'talha5099', 'talha6099', 'talha7099', 'talha8099', 'talha9099'
];

const messageCounts = {};
const activeBots = {};
let joinDelay = 0;

function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
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
            host: 'play.applemc.fun',
            port: 25565,
            username: username,
            version: '1.20.1',
            auth: 'offline'
        });

        messageCounts[username] = 0;
        activeBots[username] = false;

        bot.on('login', () => {
            console.log(`✅ ${username} logged in!`);
        });

        bot.on('spawn', async () => {
            console.log(`🎮 ${username} spawned! Waiting before opening realm...`);
            await delay(3000);
            openRealm(bot);
        });

        bot.on('message', async (message) => {
            const msg = message.toString();
            if (activeBots[username]) {
                messageCounts[username]++;
                printMessageCounts();
            }

            if (msg.includes('/register')) {
                await delay(1000);
                bot.chat('/register likese11 likese11');
            } else if (msg.includes('/login')) {
                await delay(1000);
                bot.chat('/login likese11');
            }
        });

        bot.on('kicked', (reason) => {
            console.log(`❌ ${username} was kicked: ${reason}`);
            restartBot(username);
        });

        bot.on('error', (err) => {
            console.log(`❌ ${username} error: ${err}`);
        });

        bot.on('end', () => {
            console.log(`🔄 ${username} disconnected.`);
            restartBot(username);
        });
    }, joinDelay);

    joinDelay += 20000; // 20 sec delay between bots
}

async function openRealm(bot) {
    try {
        await delay(3000);
        bot.setQuickBarSlot(4);
        await delay(1000);
        bot.activateItem();
        await delay(4000);

        let attempts = 3;
        while (!bot.currentWindow && attempts > 0) {
            console.log(`❌ ${bot.username} Realm menu not open! Retrying (${attempts} left)...`);
            await delay(2000);
            bot.activateItem();
            await delay(4000);
            attempts--;
        }

        if (!bot.currentWindow) {
            console.log(`❌ ${bot.username} Failed to open realm selector.`);
            return;
        }

        const realmItem = bot.currentWindow.slots.find(item => item && item.name.includes('yellow_dye'));
        if (!realmItem) {
            console.log(`❌ ${bot.username} Yellow dye not found.`);
            return;
        }

        await bot.clickWindow(realmItem.slot, 0, 0);
        await delay(5000);

        bot.chat('/warp afk');
        console.log(`🚀 ${bot.username} executed /warp afk.`);

        activeBots[bot.username] = true;
        printMessageCounts();

        // Stop all actions after warp
        bot.removeAllListeners('message');
        bot.removeAllListeners('spawn');
    } catch (err) {
        console.log(`❌ Error for ${bot.username}: ${err}`);
    }
}

function restartBot(username) {
    console.log(`🔄 Restarting ${username} in 30s...`);
    activeBots[username] = false;
    setTimeout(() => createBot(username), 30000);
}

botNames.forEach(name => createBot(name));
