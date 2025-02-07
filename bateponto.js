const { Client, GatewayIntentBits } = require("discord.js");
const moment = require("moment-timezone");
moment.locale("pt-br");
require("dotenv").config();
moment.tz.setDefault("America/Sao_Paulo");
const mysql = require('mysql2/promise');




const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, 
    port: process.env.DB_PORT,
});

const usuarios = {};
const usuario = message.author;
const usuarioid = usuario.id;
let limite = 0;


Comeco = moment;


if(MessageContent === "!test"){
    
    if (usuarios[usuarioid] || limite ) {
        await message.channel.send(
            `Você já bateu ponto.`
        );
        return;
    }
    
    Data = Comeco.format("Do MMMM YYYY");
    Entrada = Comeco.format("h:mm:s");
 
    if (usuario[usuarioid] && usuarioid )  


}