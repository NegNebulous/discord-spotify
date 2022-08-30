require('dotenv').config();

const axios = require('axios');
const path = require('path');
const fs = require('fs');

const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton, Permissions } = require('discord.js');
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES]});
client.login(process.env.DISCORD_BOT_TOKEN);

// const check_dir = path.join(__dirname, '../../site/scripts/main.js');

// var hostname = '127.0.0.42';
// var port = 3000;
// var userID = null;
var hostname = null;
var port = null;
var userID = null;

// read settings
fs.readFile(path.join(__dirname, '../../settings.txt'), 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  
  lines = data.split('\n');
  for (var i = 0;i < lines.length;i++) {
    args = lines[i].replace('\n','').replace('\r','').split('=');
    switch (args[0]) {
      case 'address':
        hostname = args[1]
        break;
      case 'port':
        port = args[1]
        break;
      case 'discord_id':
        userID = args[1]
        break;
    
      default:
        break;
    }
  }
});

const PREFIX = '!t';
// should be initialized to null
//551052424064794626
var followID = null;
// var presence = '';

var data = new Object();

//converts <@DISCORD_ID> to DISCORD_ID
function getIdFromMsg(message) {
  var tempIntI1 = 0;
  var tempIntI2 = message.length;
  for (i = 0; i < message.length; i++) {
      if ((message[i] >= 0) && (message[i] <= 9)) {
          break;
      }
      else {
          tempIntI1 += 1;
      }
  }

  for (i = message.length - 1; i >= 0; i--) {
      if ((message[i] >= 0) && (message[i] <= 9)) {
          break;
      }
      else {
          tempIntI2 -= 1;
      }
  }
  return message.substring(tempIntI1, tempIntI2);
}

client.on('presenceUpdate', (oldP, newP) => {
  // console.log(newP)
  for (var i = 0; i < newP.activities.length;i++) {
    if (newP.activities[i].type == 'LISTENING') {
      data[newP.userId] = newP.activities[i]
      if (newP.userId == followID) {
        let obj = new Object();

        // console.log(newP.activities[i])

        obj.id = newP.userId
        // obj.name = data[newP.userId].details.replace('"','').replace("'",'')
        obj.name = data[newP.userId].details.replace(/[^a-z0-9]/gi, '');
        // obj.state = data[newP.userId].state.replace('"','').replace("'",'')
        obj.state = data[newP.userId].state.replace(/[^a-z0-9]/gi, '');
        obj.time = data[newP.userId].createdTimestamp*0.001

        console.log(obj)

        send(obj)
      }
    }
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) {
    return;
  }

  if (!message.content.startsWith(PREFIX)) {
    return;
  }

  if (message.author.id != userID) {
    return;
  }

  var args = message.content.split(' ');
  args.splice(0,1);
  console.log(args);

  if (args[0] == 'play') {
    // console.log(message.author.presence)
    // console.log(client.users.cache.get(followID))
    if (args[1]) {
      followID = getIdFromMsg(args[1]);
    }
  }

});

function send(data) {

  axios.post(`http://${hostname}:${port}/`, JSON.stringify(data)).then(res => {
    // console.log(res)
  }).catch(e => {
    // console.error(e)
  })

  // http.open('POST', hostname, true);
  // http.setRequestHeader('Content-type', 'text/plain');
  // http.send(JSON.stringify(data));

  // http.onload = function () {
  //   r = http.responseText;
  // };
}

// Presence {
//   userId: '490979867010138128',
//   guild: <ref *1> Guild {
//     id: '723382547509411841',
//     name: 'the boysss',
//     icon: '265d98f18ff0482ff7d710208c73be6b',
//     features: [],
//     commands: GuildApplicationCommandManager {
//       permissions: [ApplicationCommandPermissionsManager],
//       guild: [Circular *1]
//     },
//     members: GuildMemberManager { guild: [Circular *1] },
//     channels: GuildChannelManager { guild: [Circular *1] },
//     bans: GuildBanManager { guild: [Circular *1] },
//     roles: RoleManager { guild: [Circular *1] },
//     presences: PresenceManager {},
//     voiceStates: VoiceStateManager { guild: [Circular *1] },
//     stageInstances: StageInstanceManager { guild: [Circular *1] },
//     invites: GuildInviteManager { guild: [Circular *1] },
//     deleted: false,
//     available: true,
//     shardId: 0,
//     splash: null,
//     banner: null,
//     description: null,
//     verificationLevel: 'NONE',
//     vanityURLCode: null,
//     nsfwLevel: 'DEFAULT',
//     discoverySplash: null,
//     memberCount: 186,
//     large: true,
//     applicationId: null,
//     afkTimeout: 3600,
//     afkChannelId: null,
//     systemChannelId: '853265459682738196',
//     premiumTier: 'NONE',
//     premiumSubscriptionCount: 0,
//     explicitContentFilter: 'DISABLED',
//     mfaLevel: 'NONE',
//     joinedTimestamp: 1647803199389,
//     defaultMessageNotifications: 'ONLY_MENTIONS',
//     systemChannelFlags: SystemChannelFlags { bitfield: 0 },
//     maximumMembers: 500000,
//     maximumPresences: null,
//     approximateMemberCount: null,
//     approximatePresenceCount: null,
//     vanityURLUses: null,
//     rulesChannelId: null,
//     publicUpdatesChannelId: null,
//     preferredLocale: 'en-US',
//     ownerId: '178287225245663232',
//     emojis: GuildEmojiManager { guild: [Circular *1] },
//     stickers: GuildStickerManager { guild: [Circular *1] }
//   },
//   status: 'dnd',
//   activities: [
//     Activity {
//       id: 'spotify:1',
//       name: 'Spotify',
//       type: 'LISTENING',
//       url: null,
//       details: 'Seven Nation Army',
//       state: 'Nito-Onna',
//       applicationId: null,
//       timestamps: [Object],
//       syncId: '1SFRAPrELMUqbEQyCLVBMT',
//       platform: null,
//       party: [Object],
//       assets: [RichPresenceAssets],
//       flags: [ActivityFlags],
//       emoji: null,
//       sessionId: '5e5a9a463c4952b5a6282c3d0fc6377d',
//       buttons: [],
//       createdTimestamp: 1653781128374
//     }
//   ],
//   clientStatus: { desktop: 'dnd' }
// }