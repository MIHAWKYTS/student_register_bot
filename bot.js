const {Client,GatewayIntentBits} = require("discord.js");
const config = require("./config.json");
const button = require("./button");
const moment = require("moment");
moment.locale('pt-br');


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent 
    ]
});

const usuarios = {};
limite = 0; 



client.on("ready",() => {  
    console.log(`O bot foi iniciado, com ${client.users.cache.size} usuarios, no total de ${client.channels.cache.size} canais, em ${client.guilds.cache.size} servidores`);
    client.user.setActivity(`Estou em ${client.guilds.cache.size} servidores`);
});

client.on("guildCreate", guild => {
    console.log(`O bot entrou no servidor ${guild.name} de id ${guild.id}. 
        Com a população: ${guild.memberCount} membros!`)
        client.user.setActivity(`Estou em ${client.guilds.cache.size} servidores`);
    });
    
    
    client.on("guildDelete", guild => {
        console.log(`O bot foi removido ${guild.name}, ${guild.id}`)
        client.user.setActivity(`Estou em ${client.guilds.cache.size} servidores`);
    });
    
    
    client.on("messageCreate", async (message) => {
        if (message.author.bot) return;
        const usuario = message.author;
        const usuarioid = usuario.id;
        
        if (message.content === "/start") {
            limite++

            if (limite > 1 ){
                await message.channel.send(`O site já está sendo ultilizado`);
                return;
            }
            if (usuarios[usuarioid]) {
                await message.channel.send(`Você já iniciou uma sessão! Finalize antes de começar outra.`);
                return;
            }
    
            const inicio = moment();
            usuarios[usuarioid] = inicio;
    
            const Data = inicio.format("Do MMMM YYYY");
            const horario = inicio.format("h:mm:ss a");
    
            await message.channel.send(`O site Rockseat está sendo usado por ${usuario} começando no horário: ${horario} e na data: ${Data}. @everyone`);
            console.log(horario);
            console.log(Data);
        }
    
        if (message.content === "/end") {
            if (!usuarios[usuarioid]) {
                await message.channel.send(`Por favor, inicie uma sessão primeiro usando o comando /start.`);
                return;
            }
    limite = 0;
            const inicio = usuarios[usuarioid];
            const fim = moment();
    
            const duracao = moment.duration(fim.diff(inicio));
            const horas = Math.floor(duracao.asHours());
            const minutos = duracao.minutes();
            const segundos = duracao.seconds();
    
            const calculoTempo = `${horas} horas, ${minutos} minutos e ${segundos} segundos`;
    
            delete usuarios[usuarioid];
    
            const Data1 = fim.format("Do MMMM YYYY");
            const horario = fim.format("h:mm:ss a");
        await message.channel.send(`O site rockseat que estava sendo ultilizado por ${usuario} foi liberado no horario: ${horario} e na data: ${Data1} . O site foi ultilizado: ${calculoTempo} @everyone `);
   
        console.log(horario);
   
        console.log(Data1);
        
    }
});


/*
client.on("messageCreate", async (message) => {
    if (message.author.bot) {
     if (message.content === "Pong") {
         if (message.deletable) {
            await message.delete(); 
            console.log("Mensagem deletada com sucesso!");
        } else {
            console.log("Não foi possível excluir a mensagem.");
            }
        }
    }
});
*/

client.login(config.token);
