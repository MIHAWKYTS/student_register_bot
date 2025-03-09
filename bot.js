const { PrismaClient } = require("@prisma/client");
const { Client, GatewayIntentBits } = require("discord.js");
const moment = require("moment-timezone");
moment.locale("pt-br");
require("dotenv").config();

moment.tz.setDefault("America/Sao_Paulo");
const prisma = new PrismaClient();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const usuarios = {};
let limite = 0;
time = 0;

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

    const usuario = message.author.username;
    const usuarioid = message.author.id;

    let usuarioExiste = await prisma.banco_horas.findFirst({
        where: { nome: usuario },
    });

    if (!usuarioExiste) {
        usuarioExiste = await prisma.banco_horas.create({
            data: {
                nome: usuario,
                inicio: moment().toDate(),
                status: false, 
            },
        });
    }

    if (message.content === "!start") {
        if (usuarioExiste.status === true) {
            await message.channel.send(
                `Você já iniciou uma sessão! Finalize antes de começar outra.`
            );
            return;
        }

        const inicio = moment();
        usuarios[usuarioid] = { inicio, confirmacao: false };

        const data = inicio.format("Do MMMM YYYY");
        const horario = inicio.format("HH:mm:ss");

        await message.channel.send(
            `O site Rockseat está sendo usado por ${usuario} começando no horário: ${horario} e na data: ${data}. @everyone`
        );

        console.log(`Sessão iniciada: ${data} às ${horario}`);

        await prisma.banco_horas.update({
            where: { id: usuarioExiste.id },
            data: {
                inicio: moment().toDate(),
                status: true,
            },
        });

        setTimeout(async () => {
            if (!usuarios[usuarioid]?.confirmacao) {
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
                }
            }
        }, 3600000);
    }

    if (message.content === "!end") {
        if (usuarioExiste && usuarioExiste.status === false) {
            await message.channel.send(
                `Por favor, inicie uma sessão primeiro usando o comando !start.`
            );
            return;
        }

        if (usuarioExiste && usuarioExiste.status === true) {
            const inicio = moment(usuarioExiste.inicio);
            const fim = moment();

            const duracao = moment.duration(fim.diff(inicio));
            const horas = Math.floor(duracao.asHours());
            const minutos = duracao.minutes();
            const segundos = duracao.seconds();

            const tempoUtilizadoSegundos = Math.floor(duracao.asSeconds());
            const tempoUtilizado = `${horas} horas, ${minutos} minutos e ${segundos} segundos`;

            const data = fim.format("Do MMMM YYYY");
            const horario = fim.format("HH:mm:ss");

            try {
                await prisma.banco_horas.update({
                    where: { id: usuarioExiste.id },
                    data: {
                        saida: fim.toDate(),
                        tempoUtilizado: tempoUtilizadoSegundos,
                        status: false,
                    },
                });

                time = 0;

                await message.channel.send(
                    `O site Rockseat que estava sendo utilizado por ${usuario} foi liberado no horário: ${horario} e na data: ${data}. O site foi utilizado por: ${tempoUtilizado}. @everyone`
                );

                console.log(`Sessão encerrada: ${data} às ${horario}`);
            } catch (err) {
                console.error("Erro ao atualizar banco de horas:", err);
            }
        }
    }
});

client.login(process.env.TOKEN);
