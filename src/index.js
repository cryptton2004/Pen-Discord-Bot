models = require('./database')
// Your Discord Bot token here
const token =  process.env.TOKEN;
if(!token){
    throw new Error("Your bot can't start without a token. Have you created the .env file?");
    return;
}


let mongoose = models.mongoose
let Characters = mongoose.model('Characters')
let GroupedCharacters = mongoose.model('GroupedCharacters')

function retrieveCharacterItems(username, callback) {
    Characters
    .find({
        name: username   // search query
    }).skip(0).limit(10)
    .then(doc => {
        callback(null, doc);
    })
    .catch(err => {
        callback(err, null);
    })
  };

function saveCharacterItems(inventoryItem, callback){
    const charItem = new Characters({
        name: inventoryItem.name,
        category: inventoryItem.category,
        itemName: inventoryItem.itemName,
        itemDescription: inventoryItem.itemDescription,
        quantity: inventoryItem.quantity
    })
    charItem.save()
    .then(doc => {
        callback(null, doc);
    })
    .catch(err => {
        console.log("Error: "+ err)
        callback(err, null);
    })
}
function retrieveGroupedCharacterItems(username, callback) {
    GroupedCharacters
    .aggregate([
        { $match: { "name": username }},
        {
            $group: {
                _id: "$itemName",
                name: { $first: "$name"},
                itemName : { $first: "$itemName"},
                itemDescription : { $first: "$itemDescription"},
                category:  { $first: "$category"},
                quantity: {$sum : {
                          $cond:{
                             if: { $lt: [ "$quantity", 0 ] },
                             then: 1,
                             else: "$quantity"
                          }
                       }}
              }
        },
        
        { $project: { _id: 0, name: 1, itemName : 1,  itemDescription: 1, category: 1, quantity: 1}},
    ])
    .then(doc => {
        callback(null, doc);
    })
    .catch(err => {
        console.log("Error: "+ err)
        callback(err, null);
    })
  };



/**
 * An example of how you can send embeds
 */

// Extract the required classes from the discord.js module
const { Client, MessageEmbed } = require('discord.js');

// Create an instance of a Discord client
const client = new Client();


/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
console.log("Getting ready ... ")

client.on('ready', () =>{
    console.log('I am ready!');
});

client.on('message', message => {
    // If the message is "how to embed"
    let messageContent = message.content.split(" ")
    let command = messageContent[0]
    let args = messageContent.slice(1).join(" ").toString();

    switch (command) {
        case "!addItem":
        case "!itemAdd":
            var wordsInContent = args.split(";")
            var name = wordsInContent[0] || "undefined"
            var category = wordsInContent[1] || "undefined"
            var itemName = wordsInContent[2] || "undefined"
            var itemDescription = wordsInContent[3] || "undefined"
            var quantity = wordsInContent[4] || 1

            if([name, category, itemName, itemDescription].indexOf("undefined") >= 0){
                const itemToBeAddedDiscord = "One of the arguments is missing. Accepted format:\n!itemAdd User;category;itemName;itemDescription;quantity(optional)"
                message.channel.send(itemToBeAddedDiscord);
                break;
            }
            var itemToBeAdded = {
                name: name,
                category: category,
                itemName: itemName,
                itemDescription: itemDescription,
                quantity: quantity
            }
            const itemToBeAddedDiscord = new MessageEmbed()
                .setTitle('Item Added')
                .addField('Player Name: ', itemToBeAdded.name)
                .addField('Item Category: ', itemToBeAdded.category)
                .addField('Item Name: ', itemToBeAdded.itemName)
                .addField('Item Description: ', itemToBeAdded.itemDescription)
                .addField('Quantity: ', itemToBeAdded.quantity)
                .setColor('FF4500')
            message.channel.send(itemToBeAddedDiscord);

            saveCharacterItems(itemToBeAdded, function(err, savedItem) {
                if (err) { console.log(err);}
                else{
                    console.log("Item Added");
                    console.log(savedItem);
                }
            });
            //var saveResult = saveCharacterItems(itemToBeAdded)
            break;          
        case "!inv":
        case '!inventory':
            var username = message.author.username;
            //var username = 'Joker';
            retrieveGroupedCharacterItems(username, function(err, items) {
                if (err) { console.log(err);}
                else {
                    var inventoryItems = '';
                    //items.each
                    const itemToBeAddedDiscord = new MessageEmbed()
                    .setTitle('Player Inventory')
                    .addField('Player Name: ', username)
                    //.addField('\u200b', ' ')
                    .setColor('FF4500')

                    var gearItems=[];
                    var weaponItems=[];
                    var buffItems=[];
                    items.forEach (function (item) {
                        var itemCategory = item.category;
                        if(['gear', 'Gear'].indexOf(itemCategory) >= 0){
                            gearItems.push(item)
                        } else if(['weapon', 'Weapon'].indexOf(itemCategory) >= 0) {
                            weaponItems.push(item)
                        }else if(['buff', 'Buff'].indexOf(itemCategory) >= 0) {
                            buffItems.push(item)
                        }
                    });

                   var gearValue = ""
                    gearItems.forEach (function (gear) {
                        gearValue += "▬ "+gear.itemName + " ██ " + gear.itemDescription + " ██ " + gear.quantity + "\n"
                    });
                    if(gearValue){
                        itemToBeAddedDiscord.addField('Gear:', "```"+gearValue+"```")
                    }

                    var weaponValue = ""
                    weaponItems.forEach (function (weapon) {
                        weaponValue += "▬ "+weapon.itemName + " ██ " + weapon.itemDescription + " ██ " + weapon.quantity + "\n"
                    });
                    if(weaponValue){
                        itemToBeAddedDiscord.addField('Weapons:', "```"+weaponValue+"```")
                    }

                    var buffValue = ""
                    buffItems.forEach (function (buff) {
                        buffValue += "▬ "+buff.itemName + " ██ " + buff.itemDescription + " ██ " + buff.quantity + "\n"
                    });
                    if(buffValue){
                        itemToBeAddedDiscord.addField('Buffs:', "```"+buffValue+"```")
                    }

                    message.channel.send(itemToBeAddedDiscord);
                }
            });
            break;



        default:
            break;
    }
});

client.login(token);


