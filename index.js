const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, TextInputStyle, ModalBuilder, InteractionType } = require('discord.js');
const { token, clientId, guildId, applicationChannelId, notificationChannelId } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages] });

const staffQuestions = [
    "Why do you want to be staff?",
    "Have you been staff in a dev server before?",
    "Do you agree to follow our rules? (yes/no)", // Updated label here
    "Do you agree to follow Discord TOS? (yes/no)" // Updated label here
];

const devQuestions = [
    "What coding languages do you know?",
    "Why do you want to be a trusted dev?",
    "Years of experience in development?",
    "Agree to help others and receive profit?"
];

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const rest = new REST({ version: '10' }).setToken(token);

    (async () => {
        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: [
                    {
                        name: 'apply',
                        description: 'Create an application button',
                    }
                ] },
            );

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();
});

client.on('interactionCreate', async interaction => {
    if (interaction.type === InteractionType.ApplicationCommand && interaction.commandName === 'apply') {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('applyButton')
                    .setLabel('Apply Now')
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.reply({ content: 'Click the button below to apply!', components: [row] });
    }

    if (interaction.type === InteractionType.MessageComponent && interaction.customId === 'applyButton') {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('staffApplication')
                    .setLabel('Staff Application')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('devApplication')
                    .setLabel('Developer Application')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({ content: 'Select the type of application you want to apply for:', components: [row], ephemeral: true });
    }

    if (interaction.type === InteractionType.MessageComponent && (interaction.customId === 'staffApplication' || interaction.customId === 'devApplication')) {
        const questions = interaction.customId === 'staffApplication' ? staffQuestions : devQuestions;
        const applicationType = interaction.customId === 'staffApplication' ? 'Staff' : 'Developer';

        const modal = new ModalBuilder()
            .setCustomId(`applicationModal-${applicationType}`)
            .setTitle(`${applicationType} Application`)
            .addComponents(
                questions.map((question, index) => (
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId(`question-${index}`)
                            .setLabel(question)
                            .setStyle(TextInputStyle.Paragraph)
                    )
                ))
            );

        await interaction.showModal(modal);
    }

    if (interaction.type === InteractionType.ModalSubmit && interaction.customId.startsWith('applicationModal')) {
        const answers = [];
        const applicationType = interaction.customId.includes('Staff') ? 'Staff' : 'Developer';

        for (let i = 0; i < 4; i++) {
            const answer = interaction.fields.getTextInputValue(`question-${i}`);
            answers.push(answer);
        }

        const embed = new EmbedBuilder()
            .setTitle(`${applicationType} Application`)
            .setColor(0x00FF00)
            .addFields(
                { name: 'Applicant', value: interaction.user.id, inline: false },
                ...answers.map((answer, i) => ({ name: `Question ${i + 1}`, value: answer, inline: false }))
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('acceptApplication')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('declineApplication')
                    .setLabel('Decline')
                    .setStyle(ButtonStyle.Danger)
            );

        const notificationChannel = client.channels.cache.get(notificationChannelId);

        if (notificationChannel) {
            const sentMessage = await notificationChannel.send({ embeds: [embed], components: [row] });
            sentMessage.applicantId = interaction.user.id; // Store the applicant's ID with the message
        } else {
            console.error('Notification channel not found.');
        }

        await interaction.reply({ content: 'Your application has been submitted!', ephemeral: true });
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.type === InteractionType.MessageComponent && (interaction.customId === 'acceptApplication' || interaction.customId === 'declineApplication')) {
        const embed = interaction.message.embeds[0];
        const userId = embed.fields.find(field => field.name === 'Applicant').value;
        const user = await client.users.fetch(userId);

        try {
            if (interaction.customId === 'acceptApplication') {
                await user.send(`Your application has been accepted by ${interaction.user.tag}.`);
                const notificationChannel = client.channels.cache.get(notificationChannelId);
                if (notificationChannel) {
                    await notificationChannel.send(`Application accepted for ${user.tag} (${user.id})`);
                } else {
                    console.error('Notification channel not found.');
                }
            } else {
                await user.send(`Your application has been declined by ${interaction.user.tag}. If you think this is an error, please make a support ticket.`);
                const notificationChannel = client.channels.cache.get(notificationChannelId);
                if (notificationChannel) {
                    await notificationChannel.send(`Application declined for ${user.tag} (${user.id})`);
                } else {
                    console.error('Notification channel not found.');
                }
            }
        } catch (error) {
            console.error('Error sending notification:', error);
        }

        await interaction.update({ content: `Application ${interaction.customId === 'acceptApplication' ? 'accepted' : 'declined'} by ${interaction.user.tag}.`, components: [] });
    }
});

client.login(token);