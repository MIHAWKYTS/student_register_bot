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
let limite = 0;

client.on("ready", () => {
    console.log(
        `O bot foi iniciado, com ${client.users.cache.size} usuários, no total de ${client.channels.cache.size} canais, em ${client.guilds.cache.size} servidores.`
    );
    client.user.setActivity(`Estou em ${client.guilds.cache.size} servidores`);
});

client.on("guildCreate", (guild) => {
    console.log(
        `O bot entrou no servidor ${guild.name} com ${guild.memberCount} membros!`
    );
    client.user.setActivity(`Estou em ${client.guilds.cache.size} servidores`);
});

client.on("guildDelete", (guild) => {
    console.log(`O bot foi removido do servidor ${guild.name}`);
    client.user.setActivity(`Estou em ${client.guilds.cache.size} servidores`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const usuario = message.author;
    const usuarioid = usuario.id;



    (async () => {
        try {
            await db.query('SELECT 1');
            console.log('Conexão com o banco de dados estabelecida com sucesso.');
        } catch (error) {
            console.error('Erro ao conectar ao banco de dados:', error);
        }
    })();
    
    console.log("DB_HOST:", process.env.DB_HOST);
    console.log("DB_NAME:", process.env.DB_NAME);

    if (message.content === "!start") {
        if (limite > 0) {
            await message.channel.send(`O site já está sendo utilizado.`);
            return;
        }

        if (usuarios[usuarioid]) {
            await message.channel.send(
                `Você já iniciou uma sessão! Finalize antes de começar outra.`
            );
            return;
        }

        limite++;
        const inicio = moment();
        usuarios[usuarioid] = { inicio, confirmacao: false };

        const data = inicio.format("Do MMMM YYYY");
        const horario = inicio.format("h:mm:ss a");

        await message.channel.send(
            `O site Rockseat está sendo usado por ${usuario} começando no horário: ${horario} e na data: ${data}. @everyone`
        );

        console.log(`Sessão iniciada: ${data} às ${horario}`);

    
        setTimeout(async () => {
            if (!usuarios[usuarioid].confirmacao) {
                await message.channel.send(
                    `${usuario}, confirme que ainda está utilizando o site digitando "sim".`
                );

                try {
                    const filter = (m) => m.author.id === usuarioid;
                    const collected = await message.channel.awaitMessages({
                        filter,
                        max: 1,
                        time: 120000, 
                        errors: ["time"],
                    });

                    const resposta = collected.first().content.toUpperCase();
                    if (resposta === "SIM") {
                        await message.channel.send(
                            "Pode continuar utilizando o site."
                        );
                        usuarios[usuarioid].confirmacao = true;
                    } else {
                        await message.channel.send(
                            "Sessão encerrada por falta de confirmação."
                        );
                        delete usuarios[usuarioid];
                        limite = 0;
                    }
                } catch (error) {
                    await message.channel.send(
                        "Tempo de resposta esgotado. Sessão encerrada."
                    );
                    delete usuarios[usuarioid];
                    limite = 0;
                }
            }
        }, 3600000); 
    }

    
    if (message.content === "!end") {
        if (!usuarios[usuarioid]) {
            await message.channel.send(
                `Por favor, inicie uma sessão primeiro usando o comando !start.`
            );
            return;
        }

        const inicio = usuarios[usuarioid].inicio;
        const fim = moment();
        const duracao = moment.duration(fim.diff(inicio));
        const horas = Math.floor(duracao.asHours());
        const minutos = duracao.minutes();
        const segundos = duracao.seconds();

        const tempoUtilizado = `${horas} horas, ${minutos} minutos e ${segundos} segundos`;

        delete usuarios[usuarioid];
        limite = 0;

        const data = fim.format("Do MMMM YYYY");
        const horario = fim.format("h:mm:ss a");
    

        (async () => {
            try {
                await db.execute(`
                    CREATE TABLE IF NOT EXISTS Banco_horas (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        id_discord  INT NOT NULL,
                        Nome_Discord VARCHAR(255) NOT NULL,
                        inicio DATETIME NOT NULL,
                        tempoUtilizado VARCHAR(250) NOT NULL
                    )
                `);
                console.log("Tabela Banco_horas verificada/criada com sucesso.");
            } catch (error) {
                console.error("Erro ao criar/verificar tabela Banco_horas:", error);
            }
        })();
        

        try{        
            await db.execute(
                'INSERT INTO Banco_horas (id_discord, Nome_Discord, inicio, fim, tempoUtilizado) VALUES (?, ?, ?, ?, ?)',
              [
                usuarioid,
                usuario.username,
                inicio.format("YYYY-MM-DD HH:mm:ss"),
                fim.format("YYYY-MM-DD HH:mm:ss"),
                tempoUtilizado,
              ]
            );
            console.log('Dados enviado com sucesso');
        }catch(error){
            console.error('Dados não enviados', error);
        }

        await message.channel.send(
            `O site Rockseat que estava sendo utilizado por ${usuario} foi liberado no horário: ${horario} e na data: ${data}. O site foi utilizado por: ${tempoUtilizado}. @everyone`
        );

        console.log(`Sessão encerrada: ${data} às ${horario}`);
    }
});

client.login(process.env.TOKEN);
