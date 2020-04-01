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

function getharacter(query, callback) {
    Characters
    .findOne(query)
    .then(doc => {
        return callback(null, doc);
    })
    .catch(err => {
        return callback(err, null);
    })
};

function saveCharacterItems(inventoryItem, callback){
    let query = {
        name: inventoryItem.name,
        itemName: inventoryItem.itemName,
        category: inventoryItem.category,
    }

    let updatedObject = {
        name: inventoryItem.name,
        itemName: inventoryItem.itemName,
        itemDescription: inventoryItem.itemDescription,
        category: inventoryItem.category,                    
    }

    getharacter(query, function(err, character) {
        if (err) { console.log(err);}
          if(character != undefined && character != null ){
            console.log(character);
            let sum = parseFloat(character.quantity) + parseFloat(inventoryItem.quantity)
            if(sum < 0){ updatedObject.quantity = 0;} 
            else { updatedObject.quantity = sum }
            }
        else {updatedObject.quantity = inventoryItem.quantity}
    
        Characters.findOneAndUpdate(query, updatedObject,  { upsert : true, new: true }, function(err, doc){
            if(err) {
                console.log(err)
                callback(err, null)
            }
            console.log(doc)
            callback(null, doc)
        })
    });
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
                quantity: {$sum : "$quantity" /*{
                          $cond:{
                             if: { $lt: [ "$quantity", 0 ] },
                             then: 1,
                             else: "$quantity"
                          }
                       }*/
                    }
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

const characterLinks= [
{username: "MrCryptton", url: "https://docs.google.com/spreadsheets/d/1kq1WxPpW9z6tspxWiZJqnJ6ni6P9HgILjWcWSoB__bQ/edit#gid=1646260770"},
{username: "J0k3r", url: "https://docs.google.com/spreadsheets/d/1kq1WxPpW9z6tspxWiZJqnJ6ni6P9HgILjWcWSoB__bQ/edit#gid=2126638782"},
{username: "Calin", url: "https://docs.google.com/spreadsheets/d/1kq1WxPpW9z6tspxWiZJqnJ6ni6P9HgILjWcWSoB__bQ/edit#gid=1107798428"}
];

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
console.log("Getting ready ... ")

client.on('ready', () =>{
    console.log('I am ready!');
});


var rollDiceFunction = function (faces, reroll){
    let rollResults = [];
    if(faces < 1){ faces = 1 }
    let rollResult =  Math.round(Math.random() * (faces) )

    if(rollResult > faces || rollResult < 1){
        rollResults = rollDiceFunction (faces, reroll)
    } else if (rollResult == faces && reroll === true){   
        rollResults.push(rollResult)
        var array3  = rollDiceFunction (faces, reroll)
        rollResults.push(array3.slice())
    } else {
        rollResults.push(rollResult)
    }
    return rollResults
}

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
                    console.log("Item Added by : " + message.author.username);
                }
            });
            //var saveResult = saveCharacterItems(itemToBeAdded)
            break;          
        case "!inv":
        case '!inventory':
            var wordsInContent = args.split(";")
            var username = wordsInContent[0] || message.author.username || "undefined" 

            var getUsernameUrl = characterLinks.find(o => o.username === username);
            let userUrl = ''
            if(getUsernameUrl){
                userUrl = getUsernameUrl.url
            }
            //var username = 'Joker';
            retrieveGroupedCharacterItems(username, function(err, items) {
                if (err) { console.log(err);}
                else {
                    var inventoryItems = '';
                    //items.each
                    const itemToBeAddedDiscord = new MessageEmbed()
                    .setTitle('Player Inventory')
                    .setDescription(' Hello adventurer - Here is the inventory sheet for: [' + username + ' ](' + userUrl + ')')
                    .addField('Player Name: ', username)
                    //.addField('\u200b', ' ')
                    .setColor('FF4500')

                    var gearItems=[];
                    var weaponItems=[];
                    var buffItems=[]
                    
                    items.forEach (function (item) {
                        if(item.quantity <= 0) { return};

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
                        gearValue += " "+gear.itemName + " [" + gear.itemDescription + "] #" + gear.quantity + "\n"
                    });
                    if(gearValue){
                        itemToBeAddedDiscord.addField('Gear:', "```css\n"+gearValue+"```")
                    }

                    var weaponValue = ""
                    weaponItems.forEach (function (weapon) {
                        weaponValue += "["+weapon.itemName + " | " + weapon.itemDescription + " | " + weapon.quantity + "] \n"
                    });
                    if(weaponValue){
                        itemToBeAddedDiscord.addField('Weapons:', "```ini\n"+weaponValue+"```")
                    }

                    var buffValue = ""
                    buffItems.forEach (function (buff) {
                        buffValue += "▬ "+buff.itemName + " █ " + buff.itemDescription + " █ " + buff.quantity + "\n"
                    });
                    if(buffValue){
                        itemToBeAddedDiscord.addField('Buffs:', "```fix\n"+buffValue+" \n```")
                    }

                    message.channel.send(itemToBeAddedDiscord);
                }
            });
        break;
        case '!roll':
            var wordsInContent = args.split(" ")
            var diceRoll = wordsInContent[0] || "1d6"
            var reRoll = wordsInContent[1] || true
            var diceStrategy = wordsInContent[2] || "none"
            if(reRoll == "noroll" || reRoll == "noreroll"|| reRoll == false || reRoll == "false" || reRoll == "nr" || diceStrategy == "all"){
                reRoll = false;
            }

            let diceOptions = diceRoll.split("d")
            let numberOfDices = diceOptions[0] || 1
            let numberOfFaces = diceOptions[1] || 6

            const finalRollResult = new MessageEmbed()
            .setColor('FF4500')
            .setTitle("Rolled "+numberOfDices+" dices with "+numberOfFaces+" faces")
            //.setImage("https://picsum.photos/600/300")
            //.setThumbnail("https://picsum.photos/200")


            let results = []
            for(i = 0; i < numberOfDices; i++){
                let  rolledDice = rollDiceFunction(numberOfFaces, reRoll)
                results[i] = rolledDice.flat(Infinity);
                let diceIndex = parseFloat(i)+1
                finalRollResult.addField('Dice: '+ diceIndex, results[i] , true)
                results
            }
            //finalRollResult.addField('\u200b', '\u200b')
            // results.forEach(function (value, idx) {
            //     let rollIndex = idx+1
            //     finalRollResult.addField('Dice: '+rollIndex, value, true)
            // });
            results = results.flat()
            let arrMin = Math.min(...results);
            let arrMax = Math.max(...results);
            let sum = results.reduce((a, b) => a + b, 0)
            let avg = results.reduce((a, b) => a + b, 0) / results.length

            finalRollResult.addField('Dice Min: ', "```fix\n "+arrMin+"```")
            finalRollResult.addField('Dice Max: ', "```fix\n "+arrMax+"```", true)
            finalRollResult.addField('Dice Avg: ', "```fix\n "+avg+"```")
            finalRollResult.addField('Dice Total: ', "```fix\n "+sum+"```", true)
            message.channel.send(finalRollResult);
            break;


        default:
            break;
    }
});

client.login(token);


