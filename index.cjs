const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder, ChannelType, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, ActivityType, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, MessageFlags, InteractionType, TextDisplayBuilder, ContainerBuilder, SectionBuilder, ThumbnailBuilder, SeparatorBuilder, SeparatorSpacingSize, MediaGalleryItemBuilder, MediaGalleryBuilder, Events, Partials, AttachmentBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
require('dotenv').config()
const fs=require('fs')
const path=require('path')
const marked=require('marked')
const token=process.env.TOKEN
const app=require('express')()

app.get('/', (req, res) => res.send('Bot actif'));
app.listen(443, () => console.log(`Serveur écoutant sur le port 443`));

const client=new Client({
	intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildEmojisAndStickers,
	GatewayIntentBits.GuildMessageReactions,
	GatewayIntentBits.GuildInvites,
	GatewayIntentBits.GuildPresences
	],
	presence: {
		status: 'online', // statut online (icone verte)
		activities: [{
			name: 'K3rrigan Syndicate',
			type: ActivityType.Watching // regarde (...)
		}]
	},
	partials: [
		Partials.GuildMember
	]
});

const dataTickets=fs.readFileSync('tickets.json', 'utf8');
var tickets=JSON.parse(dataTickets);
const dataCategories=fs.readFileSync('categories.json', 'utf8');
var categories=JSON.parse(dataCategories);
const dataRoles=fs.readFileSync('roles.json', 'utf8');
var roles=JSON.parse(dataRoles);
const dataQueue=fs.readFileSync('queue.json', 'utf8');
var queue=JSON.parse(dataQueue);

const btna='[K S]'

const commands = [
	new SlashCommandBuilder()
		.setName('setupembed')
		.setDescription('Affiche l\'embed de tickets')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // pareil
	new SlashCommandBuilder()
		.setName('setupcategorie')
		.setDescription('Définit une catégorie par défaut où ranger les tickets')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // idem
		.addChannelOption(option=>
			option.setName('categorie')
			      .setDescription('La catégorie où il faut ranger les tickets')
			      .addChannelTypes(ChannelType.GuildCategory) // seulement les catégories (oui une catégorie est un salon mdr)
			      .setRequired(true)),
	new SlashCommandBuilder()
		.setName('setupstaffrole')
		.setDescription('Indique au bot le rôle à ping sur le staff dans les nouvelles demandes d\'intégration au staff')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // pareil
		.addRoleOption(option=>
			option.setName('role')
			      .setDescription('le rôle à ping sur le staff dans les nouvelles demandes d\'intégration au staff')
			      .setRequired(true)),
	new SlashCommandBuilder()
		.setName('setuplogschannel')
		.setDescription('Indique au bot le salon dans lequel il doit y mettre les logs')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // pareil
		.addChannelOption(option=>
			option.setName('salon')
			      .setDescription('Le salon dans lequel le bot doit y mettre les logs')
			      .setRequired(true)),
	new SlashCommandBuilder()
		.setName('setuplogschannel')
		.setDescription('Indique au bot le salon dans lequel il doit y mettre les logs')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // pareil
		.addUserOption(option=>
			option.setName('utilisateur')
			      .setDescription('Le salon dans lequel le bot doit y mettre les logs')
			      .setRequired(true))
].map(command => command.toJSON());


const rest = new REST({ version: '10' }).setToken(token);
(async aid=>{
	try {
		await rest.put(	
			Routes.applicationCommands(aid),
			{
				body: commands
			}
		);
		console.log(btna, 'Commandes enregistrées avec succès !');
		console.log(REST)
	} catch (error) {
		console.error(error);
	}
})('1398220041211875361');

client.once('ready', async()=>{
	console.log(`${btna} connecté en tant que ${client.user.tag}`);
});

client.on('interactionCreate', async interaction=>{
	if(!interaction.isChatInputCommand())return;
	console.log(`${btna} interaction de type commande détectée`);
	const user=await interaction.guild.members.cache.get(interaction.user.id);
	/*if(interaction.commandName==='help'){
		await interaction.deferReply({ ephemeral: true });
		console.log(`${btna} cmd help exécutée par ${interaction.user.tag} id ${interaction.user.id}`);
		const embed=new EmbedBuilder()
			.setColor(0xff7523)
			.setTitle(' ')
			.setDescription(`## Bienvenue dans le menu d'aide de <@1386277393743872060> !\n### Commandes disponibles :\n- \`/help\` : Ce que tu vois en ce moment !\n- \`/setupcategorie\` : Définit la catégorie à utiliser pour ranger les tickets\n- \`/setupembed\` : Affiche l'embed en message non-éphémère (c'est-à-dire à la vue de tout le monde)\n- \`/setupstaffrole\` : Indique au bot le rôle du staff sur ce serveur`)
			.setFooter({
				text: 'Powered by ikikrepus community'
			});
		interaction.editReply({
			embeds: [embed]
		})
	}else */if(interaction.commandName==='setupcategorie'){
		await interaction.deferReply();
		console.log(`${btna} cmd setupcatégorie envoyée par ${interaction.user.tag} id ${interaction.user.id}`);
		const categoriePrevious=await interaction.options.get('categorie');
		const categorie=categoriePrevious.channel;
		console.log(JSON.stringify(interaction.guild))
		categories[interaction.guild.id]=categorie.id;
		const jsonStr=JSON.stringify(categories, null, 4);
		fs.writeFileSync('categories.json', jsonStr, 'utf8');
		interaction.editReply({
			content: `La catégorie \`#${categorie.name}\` (identifiant : ${categorie.id}) a bien été définie pour le serveur \`${interaction.guild.name}\` (identifiant : ${interaction.guild.id}) !`,
			ephemeral: true
		});
	}else if(interaction.commandName==='setupembed'){
		await interaction.deferReply();
		console.log(`${btna} cmd setupembed envoyée par ${interaction.user.tag} id ${interaction.user.id}`);
		const embed=new EmbedBuilder()
			.setTitle(' ')
			.setDescription('## Vous voulez contacter le staff ? C\'est ici !\n### Vous avez 4 types de tickets à votre disposition :\n1. **Postuler** : Type de ticket pour faire partie de l\'équipe\n2. **Aide** : Type de ticket pour poser une question et avoir une réponse de l\'équipe\n3. **Partenariat** : Type de ticket pour demander à créer un lien de partenariat entre le serveur d\'ikikrepus et le vôtre\n4. **Autre** : Si vous voulez récupérer une récompense, accéder à la boutique ou autre chose encore\n### Cliquez sur les boutons ci-dessous pour ouvrir un ticket :')
			.setColor(0xff7523)
			.setFooter({
				text: 'Powered by ikikrepus community'
			});
		const listeDeroulante=new ActionRowBuilder()
			.setComponents(
				new StringSelectMenuBuilder().setCustomId('ouvrir_ticket').setOptions([
					{ label: 'Postuler', value: 'ouvrirTicketPrePostuler', emoji: '<:t1:1398228382738681876>' },
					{ label: 'Aide', value: 'ouvrirTicketAide', emoji: '<:t2:1398228376111812701>' },
					{ label: 'Partenariat', value: 'ouvrirTicketPrePrePartenariat' , emoji: '<:t3:1398228367849029692>' },
					{ label: 'Autre', value: 'ouvrirTicketAutre', emoji: '<a:t4:1398228355135836230>' }
				])
			);
		interaction.channel.send({
			embeds: [embed],
			components: [listeDeroulante]
		});
		interaction.editReply({
			content: `L'embed a bien été envoyé dans le salon <#${interaction.channel.id}> :tada: !`,
			ephemeral: true
		});
		console.log(`${btna} embed envoyé !`);
	}else if(interaction.commandName==='setupstaffrole'){
		await interaction.deferReply();
		const role=interaction.options.getRole('role');
		roles[interaction.guild.id]=role.id;
		const jsonStr=JSON.stringify(roles, null, 4);
		fs.writeFileSync('roles.json', jsonStr, 'utf8');
		interaction.editReply({
			content: `Le rôle staff <@&${roles[interaction.guild.id]}> (identifiant : ${roles[interaction.guild.id]}) a bien été définie pour le serveur \`${interaction.guild.name}\` (identifiant : ${interaction.guild.id}) !`,
			ephemeral: true
		});
	}else if(interaction.commandName='setuplogschannel'){
		const targetChannel=await interaction.options.get('salon')
		console.log(targetChannel)
		await interaction.deferReply()
		categories.logs=categories.logs||{}
		categories.logs[interaction.guild.id]=targetChannel.value
		const jsonStr=JSON.stringify(categories, null, 4)
		fs.writeFileSync('categories.json', jsonStr, 'utf8');
		await interaction.editReply({
			content: `flemme mais voilà c'est fait xD (tu connais mon age jm pas ecrire)`
		})
	}
});

client.on('interactionCreate', async interaction=>{
	if(!interaction.isStringSelectMenu())return;
	if(interaction.customId==='ouvrir_ticket'){
		if(interaction.values[0]==='ouvrirTicketPrePrePartenariat'){
			await interaction.deferReply({ ephemeral: true });
			const btn=new ButtonBuilder()
				.setLabel("J'accepte les conditions")
				.setCustomId('ouvrirTicketPrePartenariat')
				.setEmoji('✅')
				.setStyle(ButtonStyle.Success);
			await interaction.editReply({
				content: '### Acceptez les conditions ci-dessous :\nVous déclarez avoir lu nos conditions de partenariat, y compris système de ping.\nVous nous donnerez une invitation au serveur, le salon (ou post) de partenariat (sans qu\'il y ait le 🔒) avec une capture d\'écran dans lequel le salon est visible.\nVous nous donnerez votre publicité.',
				components: [new ActionRowBuilder().addComponents(btn)]
			});
		}
	}
});

client.on('interactionCreate', async interaction=>{
	if(!interaction.isButton())return;
	if(interaction.customId==='ouvrirTicketPrePartenariat'){
		const champthemeduprojet=new TextInputBuilder()
			.setCustomId('themeduprojet')
			.setLabel('Sur quel projet consiste le partenariat ?')
			.setStyle(TextInputStyle.Short)
			.setRequired(true)
			.setPlaceholder('Jeux-vidéos');
		const champDsclink=new TextInputBuilder()
			.setCustomId('dsclink')
			.setLabel('Si besoin, indiquer un lien d\'invitation')
			.setStyle(TextInputStyle.Short)
			.setRequired(true)
			.setPlaceholder('discord.gg/XXXXXX');
		const firstRow=new ActionRowBuilder().setComponents(champthemeduprojet);
		const secondRow=new ActionRowBuilder().setComponents(champDsclink);
		const modal=new ModalBuilder()
			.setCustomId('ouvrirTicketPartenariat')
			.setTitle('Créer un partenariat avec ce serveur')
			.addComponents(firstRow, secondRow);
		await interaction.showModal(modal);
	}
});

client.on('interactionCreate', async interaction=>{
	if(!interaction.isStringSelectMenu())return;
	console.log(`${btna} interaction de type menu déroulant détectée`);
	if(interaction.customId==='ouvrir_ticket'){
		if(interaction.values[0].substr(12)==='PrePrePartenariat')return;
		if(interaction.values[0].substr(12)==='PrePostuler'){
			const champPoste=new TextInputBuilder()
				.setCustomId('poste')
				.setLabel('Quel poste veux-tu occuper ?')
				.setStyle(TextInputStyle.Short)
				.setRequired(true)
				.setPlaceholder('Développeur');
			const champAge=new TextInputBuilder()
				.setCustomId('age')
				.setLabel('Quel âge as-tu ?')
				.setStyle(TextInputStyle.Short)
				.setRequired(true)
				.setPlaceholder('16 ans');
			const firstActionRow=new ActionRowBuilder()
				.setComponents(champPoste);
			const secondActionRow=new ModalBuilder()
				.setComponents(champAge);
			const modal=new ModalBuilder()
				.setCustomId('ouvrirTicketPostuler')
				.setTitle('Postuler sur le serveur d\'ikikrepus')
				.addComponents(firstActionRow, secondActionRow);
			interaction.showModal(modal);
			return;
		}
		const type=interaction.values[0].substr(12).toLowerCase();
		const types=['postuler', 'aide', 'partenariat', 'autre'];
		const emojisTypes=['💼', '❓', '🤝', '𝛺'];
		await interaction.deferReply({ ephemeral: true });
		const ticket=await interaction.guild.channels.create({
			name: `${emojisTypes[types.indexOf(type)]}-${interaction.user.tag}`,
			type: ChannelType.GuildText,
			parent: categories[interaction.guild.id],
			permissionOverwrites: [
				{
					id: interaction.guild.id,
					deny: [PermissionFlagsBits.ViewChannel],
				},
				{
					id: interaction.user.id,
					allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
				},
			]
		});
		tickets[interaction.guild.id]=tickets[interaction.guild.id]||new Object();
		tickets[interaction.guild.id][ticket.id]={
			type: type,
			owner: interaction.user.id
		}
		const embed=new EmbedBuilder()
			.setTitle(' ')
			.setDescription(`## Bienvenue sur votre ticket !\nType du ticket : **${tickets[interaction.guild.id][ticket.id].type}**\nOuvert : **Le <t:${String(Math.round((new Date()*1)/1000))}:F>**\n### Veuillez patienter quelques instants, une personne du Staff vous répondra sous peu 🤗.`)
			.setColor(0xff7523)
			.setFooter({
				text: 'Powered by ikikrepus community'
			});
		const msgBienvenue=await ticket.send({
			content: `<@${interaction.user.id}>`,
			embeds: [embed]
		});
		tickets[interaction.guild.id][ticket.id].first=msgBienvenue.id;
		const boutonFermer=new ButtonBuilder()
			.setStyle(ButtonStyle.Danger)
			.setCustomId('fermerTicket')
			.setLabel('🔒 Fermer');
		const boutonTraiter=new ButtonBuilder()
			.setStyle(ButtonStyle.Success)
			.setCustomId('traiteTicket')
			.setLabel('🙋‍♂️ Traiter');
		msgBienvenue.edit({
			content: `<@${interaction.user.id}>`,
			embeds: [embed],
			components: [new ActionRowBuilder().addComponents(boutonFermer).addComponents(boutonTraiter)]
		});
		interaction.editReply({
			content: `Ticket bien créé dans <#${ticket.id}> :tada: !`,
			ephemeral: true
		});
		console.log(`${btna} ticket créé dans ${interaction.channel.id}`);
		const jsonStr=JSON.stringify(tickets, null, 4);
		fs.writeFileSync('tickets.json', jsonStr, 'utf8');
	}
});

client.on('interactionCreate',async interaction=>{
  if(!interaction.isButton())return;
  if(interaction.customId==='traiteTicket'){
    await interaction.deferReply({ephemeral:true});
    const guildId=interaction.guild.id;
    const channelId=interaction.channel.id;
    const targetGuild=interaction.guild;
    const targetChannel=targetGuild.channels.cache.get(channelId);
    const targetUser=interaction.guild.members.cache.get(interaction.user.id);
    if(targetUser.permissions.has(PermissionFlagsBits.Administrator)){
      if(targetUser.id===tickets[guildId][channelId].owner){
        interaction.editReply({content:'<:warning:1398229010617471129> Vous ne pouvez pas traiter ce ticket car c\'est vous qui l\'avez ouvert !',ephemeral:true});
        return;
      }
      const embed=new EmbedBuilder()
        .setTitle(' ')
        .setDescription(`Le ticket sera traité par <@${interaction.user.id}>`)
        .setColor(0xff7523)
        .setFooter({text:'Powered by ikikrepus community'});
      targetChannel.send({content:`<@${tickets[guildId][channelId].owner}>`,embeds:[embed]});
      tickets[guildId][channelId].traiteur=interaction.user.id;
      const messageId=tickets[guildId][channelId].first;
      const targetMessage=targetChannel.messages.cache.get(messageId);
      const oldEmbed=targetMessage.embeds[0];
      const oldEmbedDescription=oldEmbed.description;
      const embedTS=oldEmbedDescription.substr(oldEmbedDescription.indexOf('<t:'),16);
      const newEmbedDescription=`## Bienvenue sur votre ticket !\nType du ticket : **${tickets[guildId][channelId].type}**\nOuvert : **Le ${embedTS}**\n${tickets[guildId][channelId].poste?`Poste demandé : **${tickets[guildId][channelId].poste}**\nÂge : **${tickets[guildId][channelId].age}**\n`:''}Pris en charge par : **<@${interaction.user.id}>**`;
      const embed2=new EmbedBuilder()
        .setTitle(' ')
        .setDescription(newEmbedDescription)
        .setColor(0xff7523)
        .setFooter({text:'Powered by ikikrepus community'});
      const boutonTraiter=new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setCustomId('traiteTicket')
        .setLabel('🙋‍♂️ Traiter')
        .setDisabled(true);
      const boutonFermer=new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setCustomId('fermerTicket')
        .setLabel('🔒 Fermer');
      targetMessage.edit({content:`<@${tickets[guildId][channelId].owner}>`,embeds:[embed2],components:[new ActionRowBuilder().addComponents(boutonFermer).addComponents(boutonTraiter)]});
      interaction.editReply({ephemeral:true,content:'Vous traitez à présent ce ticket !'});
      const jsonStr=JSON.stringify(tickets,null,4);
      fs.writeFileSync('tickets.json',jsonStr,'utf8');
    }else{
      interaction.editReply({ephemeral:true,content:'<:warning:1398229010617471129> Vous ne pouvez pas effectuer cette action administrateur !'});
    }
  }else if(interaction.customId==='fermerTicket'){
    await interaction.deferReply();
    const embed=new EmbedBuilder()
      .setTitle(' ')
      .setDescription('Êtes vous sûr de vouloir fermer ce ticket ?')
      .setColor(0xff7523)
      .setFooter({text:'Powered by ikikrepus community'});
    const messageEnvoye=await interaction.editReply({embeds:[embed]});
    const boutonOui=new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setCustomId(`fermerTicketOui${interaction.user.id}`)
      .setLabel('Oui');
    const boutonNon=new ButtonBuilder()
      .setStyle(ButtonStyle.Success)
      .setCustomId(`fermerTicketNon${interaction.user.id}:${messageEnvoye.id}`)
      .setLabel('Non');
    messageEnvoye.edit({embeds:[embed],components:[new ActionRowBuilder().addComponents(boutonNon).addComponents(boutonOui)]});
  }else if(interaction.customId.startsWith('fermerTicketOui')){
    await interaction.deferReply();
    const targetTicket=interaction.channel;
    const previousAuthorId=interaction.customId.substr(15);
    if(previousAuthorId===interaction.user.id){
      await interaction.editReply('Ce ticket sera supprimé dans quelques instants.');
      let htmlRender=`<!doctype html>\n<html>\n<head>\n<meta http-equiv="content-type" content="text/html; charset=UTF-8">\n<style>\n@keyframes stretch{from{width:20px;height:20px;left:6px}33%{width:15px;height:20px;left:6px}67%{width:15px;height:20px;left:11px}to{width:20px;height:20px;left:6px}}@keyframes rotation{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}div.app-icon:hover svg{animation-name:stretch!important;animation-duration:.75s!important;animation-timing-function:ease!important;animation-iteration-count:1!important}div.app-icon:hover svg path{fill:#fff}div.image:hover div.app-icon svg{animation-name:rotation;animation-duration:1s;animation-iteration-count:infinite;animation-timing-function:ease}div.image div.app-icon{display:none}div.image:hover div.app-icon{display:block}div.app-icon svg path{fill:#c7c8ce}div.app-icon{position:absolute;left:642px;top:3px;width:30px;background:#202024;height:30px;border-radius:5px;cursor:not-allowed}\nemoji{cursor:not-allowed}\nbr.not{position:absolute}\ndiv.member img{width: 100%;height: 100%;}\n*{color:#efeff0;}\n@font-face{font-family:'gg sans';src:local('gg sans'),url('https://cdn.freefontsvault.com/2023/05/ggsans-Normal.ttf') format('TrueType');}\n@font-face{font-family:'ggbold sans';src:local('ggbold sans'),url('https://cdn.freefontsvault.com/2023/05/ggsans-Bold.ttf') format('TrueType');}\nbody{margin:0;padding:0;font-family:'gg sans';background:#1a1a1e;}\ndiv.bandeau{display:flex;gap:5px;font-weight:bold;padding-left:30px;padding-right:5px;padding-top:12.5px;padding-bottom:12.5px;border-top:1px #28282d solid;border-bottom:1px #28282d solid;position:fixed;z-index:10000;top:0;left:0;right:0;background:#1a1a1e;}\np{margin:0;font-family: 'gg sans';font-size:14px}\nspan.channel-name{color:#efeff0;cursor:default;}\n.cpointer{cursor:not-allowed;}\nsvg.cpointer:hover path{fill:#aaaab1;}\ndiv.apps{display:flex;align-items:center;position:absolute;right:0;}\ndiv.apps > *{margin-right:20px;}\ndiv.search{cursor:not-allowed;background:#17171b;font-family:'gg sans';resize:none;border:1px #28282d solid;border-radius:8.5px;width:244px;height:32px;display:flex;align-items:center;position:relative;top:-2.5px;color:#8c8d93;margin-right:12.5px;}\ndiv.search span.placeholder{padding-left:8.5px;font-size:13.5px;}\ndiv.search svg{position:absolute;right:3px;transform:scale(0.75);}\ndiv.img-private-channel{padding:10px;background:#393a41;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;}\ndiv.root{margin:15px;}\nspan.msg-bvn{color:#efeff0;font-family:'ggbold sans';font-size:34px;cursor:default;}\nspan.bold{font-family:'ggbold sans';}\nspan.msg-info-db{cursor:default;}\ndiv.btns > *{display:inline-flex;align-items:center;gap:5px;padding:7.5px;border-radius:3px;width:261px;transition:.3s ease;cursor:not-allowed;}\ndiv.btns > * svg{transform:scale(0.75);}\ndiv.btns > * span.text{color:#5197ed;}\ndiv.btns > *:hover{background:#242428;}\ndiv.btns{margin-top:10px;display:inline-block;cursor:default;}\ndiv.btn-modif-channel{width:134px;position:relative;top:-5px;}\ndiv.members{font-size:0rem;}\ndiv.member{display:inline-block;}\ndiv.avatar{display:inline-block;margin-right:15px;width:45px;height:45px;cursor:not-allowed;}\ndiv.body{margin-left:60px;position:relative;top:-30px;}\ndiv.user-info{display:inline-block;position:relative;top:-30px;left:-4px;}\nspan.mention{background:#31314f;color:#a9baff;font-weight:bold;padding-left:2px;padding-right:2px;border-radius:4px;cursor:not-allowed;transition:.1s ease;transition-property:background,color;}\nspan.mention:hover{background:#5865f2;color:#ffffff;text-decoration:underline;}\nspan.mention-channel{background:#31314f;fill:#a9baff;color:#a9baff;font-weight:bold;padding-left:2px;padding-right:2px;border-radius:4px;cursor:not-allowed;transition:.1s ease;}\nspan.mention-channel:hover{background:#5865f2;color:#ffffff;fill:#ffffff;}\nspan.edit-tag{cursor:default;color:#6b6a70;font-size:10px;}\nspan.date-tag{margin-left:4px;cursor:default;color:#6b6a70;font-size:13px;}\nspan.bot-tag{font-family:'ggbold sans';font-size:12.5px;background:#5865f2;border-radius:4px;padding-right:4px;padding-left:4px;}\ndiv.embeds{margin-top:4px;}\ndiv.embed{background:#242429;outline:1px #313137 solid;border-left:4px #ff7423 solid;width:521px;border-radius:4px;padding-top:6.5px;padding-bottom:6.5px;padding-left:12px;padding-right:12px;}\ndiv.message h1,div.message h2,div.message h3{font-family:'ggbold sans';margin-top:10px;margin-bottom:10px}\ndiv.message h1{font-size:21px;}\ndiv.message h2{font-size:18.5px;}\ndiv.message h3{font-size:16px;}\ndiv.embed span.footer span.text{font-size:12px;font-weight:bold;}\ndiv.button{display:inline-block;font-size:16px;margin-top:4px;display:flex;align-items:center;justify-content:center;border-radius:9.5px;overflow:hidden;cursor:not-allowed;transition:.2s ease}\na.button{display:inline-block;font-size:16px;margin-top:4px;display:flex;align-items:center;justify-content:center;border-radius:9.5px;overflow:hidden;cursor:pointer;transition:.2s ease}\ndiv.buttons{font-size:0rem;display:flex;align-items:center;gap:8px;}\n.button div.label{font-size:14px;font-weight:bold;transition:.2s ease;}\ndiv.danger{padding:6.5px;padding-left:15px;padding-right:15px;background:#d22d39;}\ndiv.danger:hover{background:#b42831;}\ndiv.success{padding:6.5px;padding-left:15px;padding-right:15px;background:#00863a;}\ndiv.success:hover{background:#047e37;}\ndiv.primary{padding:6.5px;padding-left:15px;padding-right:15px;background:#5865f2}\ndiv.primary:hover{background:#4654c0}\ndiv.secondary{padding:6.5px;padding-left:15px;padding-right:15px;background:#29292e}\ndiv.secondary:hover, a.link:hover{background:#3b3b40}\na.link{padding:6.5px;padding-left:15px;padding-right:15px;background:#29292e}\nsvg.channel-icon{transform:scale(0.7);position:relative;top:6px;}\nspan.emoji img{width:20px;height:20px;position:relative;top:3px;cursor:not-allowed}\ndiv.link-icon{position:relative;top:2px;margin-left:6px}\ndiv.reaction{display:flex;align-items:center;gap:6px;background:#232327;margin-top:6px;width:min-content;border-radius:10px;padding:3.5px;padding-left:6.5px;padding-right:6.5px;cursor:not-allowed;transition:.075s ease;border:1px #232327 solid}\ndiv.reaction img, div.reaction emoji{width:20px;height:20px}\ndiv.reaction p{margin:0;font-family:'ggbold sans';color:#aaaab1;transition:.075s ease}\ndiv.reaction:hover p{color:#fafafa}\ndiv.reaction:hover{background:#323238;border:1px #3a3a40 solid}\n</style>\n</head>\n<body>\n<div class="bandeau">\n<svg x="0" y="0" class="icon__9293f" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M16 4h.5v-.5a2.5 2.5 0 0 1 5 0V4h.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm4-.5V4h-2v-.5a1 1 0 1 1 2 0Z" clip-rule="evenodd" class="" fill="#82838b"></path><path d="M12.5 8c.28 0 .5.22.5.5V9c0 .1 0 .2.02.31.03.34-.21.69-.56.69H9.85l-.67 4h4.97l.28-1.68c.06-.34.44-.52.77-.43a3 3 0 0 0 .8.11c.27 0 .47.24.43.5l-.25 1.5H20a1 1 0 1 1 0 2h-4.15l-.86 5.16a1 1 0 0 1-1.98-.32l.8-4.84H8.86l-.86 5.16A1 1 0 0 1 6 20.84L6.82 16H3a1 1 0 1 1 0-2h4.15l.67-4H4a1 1 0 1 1 0-2h4.15l.86-5.16a1 1 0 1 1 1.98.32L10.19 8h2.31Z" class="" fill="#82838b"></path></svg>\n<span class="channel-name">${targetTicket.name}</span>\n<div class="apps">\n<svg x="0" y="0" class="icon__9293f cpointer" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 2.81a1 1 0 0 1 0-1.41l.36-.36a1 1 0 0 1 1.41 0l9.2 9.2a1 1 0 0 1 0 1.4l-.7.7a1 1 0 0 1-1.3.13l-9.54-6.72a1 1 0 0 1-.08-1.58l1-1L12 2.8ZM12 21.2a1 1 0 0 1 0 1.41l-.35.35a1 1 0 0 1-1.41 0l-9.2-9.19a1 1 0 0 1 0-1.41l.7-.7a1 1 0 0 1 1.3-.12l9.54 6.72a1 1 0 0 1 .07 1.58l-1 1 .35.36ZM15.66 16.8a1 1 0 0 1-1.38.28l-8.49-5.66A1 1 0 1 1 6.9 9.76l8.49 5.65a1 1 0 0 1 .27 1.39ZM17.1 14.25a1 1 0 1 0 1.11-1.66L9.73 6.93a1 1 0 0 0-1.11 1.66l8.49 5.66Z" fill="#94959c" class=""></path></svg>\n<svg x="0" y="0" class="icon__9293f cpointer" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="#94959c" d="M1.3 21.3a1 1 0 1 0 1.4 1.4l20-20a1 1 0 0 0-1.4-1.4l-20 20ZM3.13 16.13c.11.27.46.28.66.08L15.73 4.27a.47.47 0 0 0-.07-.74 6.97 6.97 0 0 0-1.35-.64.62.62 0 0 1-.38-.43a2 2 0 0 0-3.86 0 .62.62 0 0 1-.38.43A7 7 0 0 0 5 9.5v2.09a.5.5 0 0 1-.13.33l-1.1 1.22A3 3 0 0 0 3 15.15v.28c0 .24.04.48.13.7ZM18.64 9.36c.13-.13.36-.05.36.14v2.09c0 .12.05.24.13.33l1.1 1.22a3 3 0 0 1 .77 2.01v.28c0 .67-.34 1.29-.95 1.56-1.31.6-4 1.51-8.05 1.51-.46 0-.9-.01-1.33-.03a.48.48 0 0 1-.3-.83l8.27-8.28ZM9.18 19.84A.16.16 0 0 0 9 20a3 3 0 1 0 6 0c0-.1-.09-.17-.18-.16a24.84 24.84 0 0 1-5.64 0Z" class=""></path></svg>\n<svg x="0" y="0" class="icon__9293f cpointer" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#94959c" d="M19.38 11.38a3 3 0 0 0 4.24 0l.03-.03a.5.5 0 0 0 0-.7L13.35.35a.5.5 0 0 0-.7 0l-.03.03a3 3 0 0 0 0 4.24L13 5l-2.92 2.92-3.65-.34a2 2 0 0 0-1.6.58l-.62.63a1 1 0 0 0 0 1.42l9.58 9.58a1 1 0 0 0 1.42 0l.63-.63a2 2 0 0 0 .58-1.6l-.34-3.64L19 11l.38.38ZM9.07 17.07a.5.5 0 0 1-.08.77l-5.15 3.43a.5.5 0 0 1-.63-.06l-.42-.42a.5.5 0 0 1-.06-.63L6.16 15a.5.5 0 0 1 .77-.08l2.14 2.14Z" class=""></path></svg>\n<svg x="0" y="0" class="icon__9293f cpointer" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="#94959c" d="M14.5 8a3 3 0 1 0-2.7-4.3c-.2.4.06.86.44 1.12a5 5 0 0 1 2.14 3.08c.01.06.06.1.12.1ZM18.44 17.27c.15.43.54.73 1 .73h1.06c.83 0 1.5-.67 1.5-1.5a7.5 7.5 0 0 0-6.5-7.43c-.55-.08-.99.38-1.1.92-.06.3-.15.6-.26.87-.23.58-.05 1.3.47 1.63a9.53 9.53 0 0 1 3.83 4.78ZM12.5 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM2 20.5a7.5 7.5 0 0 1 15 0c0 .83-.67 1.5-1.5 1.5a.2.2 0 0 1-.2-.16c-.2-.96-.56-1.87-.88-2.54-.1-.23-.42-.15-.42.1v2.1a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2.1c0-.25-.31-.33-.42-.1-.32.67-.67 1.58-.88 2.54a.2.2 0 0 1-.2.16A1.5 1.5 0 0 1 2 20.5Z" class=""></path></svg>\n<div class="search">\n<span class="placeholder" style="color:#94959c;">Rechercher</span>\n<svg class="icon_fea832 visible_fea832" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="#94959c" fill-rule="evenodd" d="M15.62 17.03a9 9 0 1 1 1.41-1.41l4.68 4.67a1 1 0 0 1-1.42 1.42l-4.67-4.68ZM17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" clip-rule="evenodd" class=""></path></svg>\n</div>\n</div>\n</div>\n<div class="root">\n<div class="msg-first">\n<br><br><br>\n<div class="img-private-channel">\n<svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="42" height="42" fill="none" viewBox="0 0 24 24"><path fill="#ffffff" fill-rule="evenodd" d="M16 4h.5v-.5a2.5 2.5 0 0 1 5 0V4h.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm4-.5V4h-2v-.5a1 1 0 1 1 2 0Z" clip-rule="evenodd" class=""></path><path fill="#ffffff" d="M12.5 8c.28 0 .5.22.5.5V9c0 .1 0 .2.02.31.03.34-.21.69-.56.69H9.85l-.67 4h4.97l.28-1.68c.06-.34.44-.52.77-.43a3 3 0 0 0 .8.11c.27 0 .47.24.43.5l-.25 1.5H20a1 1 0 1 1 0 2h-4.15l-.86 5.16a1 1 0 0 1-1.98-.32l.8-4.84H8.86l-.86 5.16A1 1 0 0 1 6 20.84L6.82 16H3a1 1 0 1 1 0-2h4.15l.67-4H4a1 1 0 1 1 0-2h4.15l.86-5.16a1 1 0 1 1 1.98.32L10.19 8h2.31Z" class=""></path></svg>\n</div>\n<span class="msg-bvn">\nBienvenue dans #${targetTicket.name} !\n</span>\n<br>\n<span class="msg-info-db">\nC'est le début du salon <span class="bold">privé</span> #${targetTicket.name}.\n</span>\n<br>\n<div class="btns">\n<div class="btn-add-members">\n<svg x="0" y="0" class="icon__9293f" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="#5197ed" d="M14.5 8a3 3 0 1 0-2.7-4.3c-.2.4.06.86.44 1.12a5 5 0 0 1 2.14 3.08c.01.06.06.1.12.1ZM18.44 17.27c.15.43.54.73 1 .73h1.06c.83 0 1.5-.67 1.5-1.5a7.5 7.5 0 0 0-6.5-7.43c-.55-.08-.99.38-1.1.92-.06.3-.15.6-.26.87-.23.58-.05 1.3.47 1.63a9.53 9.53 0 0 1 3.83 4.78ZM12.5 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM2 20.5a7.5 7.5 0 0 1 15 0c0 .83-.67 1.5-1.5 1.5a.2.2 0 0 1-.2-.16c-.2-.96-.56-1.87-.88-2.54-.1-.23-.42-.15-.42.1v2.1a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2.1c0-.25-.31-.33-.42-.1-.32.67-.67 1.58-.88 2.54a.2.2 0 0 1-.2.16A1.5 1.5 0 0 1 2 20.5Z" class=""></path></svg>\n<span class="text">Ajouter des membres ou des rôles</span>\n</div>\n<div class="btn-modif-channel">\n<svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="#5197ed" d="m13.96 5.46 4.58 4.58a1 1 0 0 0 1.42 0l1.38-1.38a2 2 0 0 0 0-2.82l-3.18-3.18a2 2 0 0 0-2.82 0l-1.38 1.38a1 1 0 0 0 0 1.42ZM2.11 20.16l.73-4.22a3 3 0 0 1 .83-1.61l7.87-7.87a1 1 0 0 1 1.42 0l4.58 4.58a1 1 0 0 1 0 1.42l-7.87 7.87a3 3 0 0 1-1.6.83l-4.23.73a1.5 1.5 0 0 1-1.73-1.73Z" class=""></path></svg>\n<span class="text">Modifier le salon</span>\n</div>\n</div>\n<div class="access-channel">\n<div class="members">`;
      const jsonRender=Object.values(tickets[interaction.guild.id][targetTicket.id].jsonRender||{});
      const uniqueMembers=[...new Set(jsonRender.map(msg=>msg.author.globalName))];
      uniqueMembers.forEach((member,index)=>{
        const avatarUrl=jsonRender.find(msg=>msg.author.globalName===member)?.author.avatar||'';
        htmlRender+=`\n<div class="member">\n<img src="${avatarUrl}" style="border:1px black solid;border-radius:50%;">\n</div>`;
      });
      htmlRender+=`\n</div>\n</div>\n</div>\n<br>\n<div class="messages">`;
      if(Object.values(jsonRender)===0){
        htmlRender+=`\n<div class="message">\n<div class="avatar">\n<img src="https://cdn.discordapp.com/avatars/1386277393743872060/ef283ee9f202927491a5fd4f43b80a72.png?size=80" style="border-radius:50%;width:45px;height:45px;">\n</div>\n<div class="user-info">\n<span class="global-name">ikikrepus' bot</span>\n<span class="img-role"></span>\n<span class="date-tag">${String(new Date().getDate())}/${String(new Date().getMonth()+1)}/${String(new Date().getYear()+1900)} ${String(new Date().getHours())}:${String(new Date().getMinutes())}</span>\n<span class="bot-tag">APP</span>\n&nbsp;\n<span class="bot-tag">OUT OF DISCORD</span>\n</div>\n<div class="body">\n<div class="content">\nAucun message n'a été enregistré dans ce ticket.\n</div>\n</div>\n</div>`;
      }else{
        Object.values(jsonRender).forEach(msg=>{
          const color=msg.author.color;
          const botTag=msg.author.bot?'<span class="bot-tag">APP</span>':'';
          const editTag=msg.modified?'<span class="edit-tag">(modifié)</span>':'';
          htmlRender+=`\n<div class="message">\n<div class="avatar">\n<img src="${msg.author.avatar}" style="border-radius:50%;width:45px;height:45px;">\n</div>\n<div class="user-info">\n<span class="global-name" style="color:${color};">${msg.author.globalName||msg.author.username}</span>\n<span class="img-role"></span>\n${botTag}\n<span class="date-tag">${msg.date}</span>\n</div>\n<div class="body">\n<div class="content">\n${marked.parse(msg.content).replace(/<strong>(.*?)<\/strong>/g, "<span class=\"bold\">$1</span>").replace(/<br><h/g, '<h')||''}${editTag}\n</div>\n${(msg.images||[]).join('\n')}\n<div class="embeds">`;
          if(msg.embeds.length>0){
            msg.embeds.forEach(embed=>{
              htmlRender+=`\n<div class="embed">\n<span class="author">\n<div class="img">${embed?.author?.img||''}</div>\n<span class="text">${embed?.author?.text||''}</span>\n</span>\n<span class="title">${embed.title||''}</span>\n<span class="description">\n${embed.description?embed.description.replace(/\n/g,'<br>'):''}\n</span>\n<span class="footer">\n<div class="img"></div>\n<span class="text">${embed.footer.text||''}</span>\n</span>\n</div>`;
            });
          }
          htmlRender+=`\n</div>\n<div class="buttons">`;
          if(msg.buttons?.length>0){
            msg.buttons.forEach(btn=>{
              htmlRender+=`\n<${btn.style==='link'?'a':'div'} class="button ${btn.style}"${btn.style==='link'?` data-href="${btn.url}" target="_blank"`:''}>\n<div class="emoji">${btn.emoji?`<span class="emoji"><img src="https://cdn.discordapp.com/emojis/${btn.emoji}.webp&animated=true"></span>`:''}</div>\n<div class="label">${btn.label}</div>${btn.style==='link'?`\n<div class="link-icon"><svg class="launchIcon__57f77" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M15 2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0V4.41l-4.3 4.3a1 1 0 1 1-1.4-1.42L19.58 3H16a1 1 0 0 1-1-1Z" class=""></path><path fill="currentColor" d="M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 1 0-2 0v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 1 0 0-2H5Z" class=""></path></svg></div>`:''}\n</${btn.style==='link'?'a':'div'}>`;
            });
          }
          htmlRender+=`\n</div>\n<div class="reactions">`;
          if(Object.values(msg.reactions||[]).length>0){
          	Object.values(msg.reactions||[]).forEach(reaction=>{
          		htmlRender+=`\n<div class="reaction" data-name=":${reaction.name}:">\n${reaction.display}\n<p>${reaction.count}</p>\n</div>`;
          	});
          }
          htmlRender+=`\n</div>\n</div>`;
        });
      }
      htmlRender+=`\n</div>\n</div>\n<script>\nconst memberList=document.querySelectorAll('.member');\nconst edList=document.querySelectorAll('div.embed span.description');\nfor(var i=0;i<edList.length;i++){\nedList[i].innerHTML=edList[i].innerHTML.replace(/<\\/h([123]{1})><br>/g, "</h$1><br class=\\"not\\">").replace(/<br><h([123]{1})>/g, "<br class=\\"not\\"><h$1>")\n}\nfor(var i=0;i<memberList.length;i++){\nmemberList[i].setAttribute('style',\`width: 24px;height: 24px;position:relative;left:-\${String(7.5*i)}px;\`);memberList[i].querySelector('img').setAttribute('draggable', 'false');\n}\n</script>\n</body>\n</html>`;
      const channel=await interaction.guild.channels.cache.get((categories.logs||{})[interaction.guild.id]||interaction.channel.id)
      await channel.send({content:'Export HTML généré :',files:[{attachment:Buffer.from(htmlRender),name:`export-ticket-${interaction.channel.id}.html`}]});
      setTimeout(async()=>{delete tickets[interaction.guild.id][targetTicket.id];await targetTicket.delete();fs.writeFileSync('tickets.json',JSON.stringify(tickets,null,4),'utf8');tickets=JSON.parse(JSON.stringify(tickets,null,4))},5000);
    }else{
      interaction.editReply(`<@${interaction.user.id}>, vous n'êtes pas l'auteur de cette action <:warning:1398229010617471129> !`);
    }
  }else if(interaction.customId.substr(0,15)==='fermerTicketNon'){
    await interaction.deferReply();
    const previousAuthorId=interaction.customId.substr(15,19);
    const nowAuthorId=interaction.user.id;
    const previousMessageId=interaction.customId.substr(35);
    const previousMessage=await interaction.channel.messages.fetch(previousMessageId);
    try{
      if(previousAuthorId===nowAuthorId){
        const message=await interaction.editReply('Le ticket ne sera pas supprimé.');
        await previousMessage.delete();
        setTimeout(()=>{message.delete()},4000);
      }else{
        interaction.editReply(`<@${interaction.user.id}>, vous n'êtes pas l'auteur de cette action <:warning:1398229010617471129> !`);
      }
    }catch{}
  }
});

client.on('interactionCreate', async interaction=>{
	if(!interaction.type===InteractionType.ModalSubmit)return;
	if(interaction.customId==='ouvrirTicketPostuler'){
		const poste=interaction.fields.getTextInputValue('poste');
		const age=interaction.fields.getTextInputValue('age');
		const type='postuler';
		const types=['postuler', 'aide', 'partenariat', 'autre']; // FLEMME DE CHANGER MDR
		const emojisTypes=['💼', '❓', '🤝', '𝛺'];
		await interaction.deferReply({ ephemeral: true });
		const ticket=await interaction.guild.channels.create({
			name: `${emojisTypes[types.indexOf(type)]}-${interaction.user.tag}`,
			type: ChannelType.GuildText,
			parent: categories[interaction.guild.id],
			permissionOverwrites: [
				{
					id: interaction.guild.id,
					deny: [PermissionFlagsBits.ViewChannel],
				},
				{
					id: interaction.user.id,
					allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
				},
			]
		});
		tickets[interaction.guild.id]=tickets[interaction.guild.id]||new Object();
		tickets[interaction.guild.id][ticket.id]={
			type: type,
			owner: interaction.user.id,
			ownerName: interaction.user.username,
			poste: poste,
			age: age,
			grdOui: [],
			grdNon: [],
		}
		const embed=new EmbedBuilder()
			.setTitle(' ')
			.setDescription(`## Bienvenue sur votre ticket !\nType du ticket : **${tickets[interaction.guild.id][ticket.id].type}**\nOuvert : **Le <t:${String(Math.round((new Date()*1)/1000))}:F>**\nPoste demandé : **${poste}**\nÂge : **${age}**\n### Veuillez patienter quelques instants, une personne du Staff vous répondra sous peu 🤗.`)
			.setColor(0xff7523)
			.setFooter({
				text: 'Powered by ikikrepus community'
			});
		const msgBienvenue=await ticket.send({
			content: `<@${interaction.user.id}>`,
			embeds: [embed]
		});
		tickets[interaction.guild.id][ticket.id].first=msgBienvenue.id;
		const boutonFermer=new ButtonBuilder()
			.setStyle(ButtonStyle.Danger)
			.setCustomId('fermerTicket')
			.setLabel('🔒 Fermer');
		const boutonTraiter=new ButtonBuilder()
			.setStyle(ButtonStyle.Success)
			.setCustomId('traiteTicket')
			.setLabel('🙋‍♂️ Traiter');
		msgBienvenue.edit({
			content: `<@${interaction.user.id}>`,
			embeds: [embed],
			components: [new ActionRowBuilder().addComponents(boutonFermer).addComponents(boutonTraiter)]
		});
		interaction.editReply({
			content: `Ticket bien créé dans <#${ticket.id}> :tada: !`,
			ephemeral: true
		});
		console.log(`${btna} ticket créé dans ${interaction.channel.id}`);
		const jsonStr=JSON.stringify(tickets, null, 4);
		fs.writeFileSync('tickets.json', jsonStr, 'utf8');
		const thread=await ticket.threads.create({
			name: `📝 Avis sur la candidature de ${interaction.user.tag}`,
			reason: `Ouvert le <t:${Math.round((new Date()*1)/1000)}:F>`,
			type: ChannelType.PrivateThread,
			autoArchiveDuration: 10080
		});
		const ghostPing=await thread.send(`${roles[interaction.guild.id]?`<@&${roles[interaction.guild.id]}>`:'s'}`);
		await ghostPing.delete();
		const text=new TextDisplayBuilder().setContent('<a:loading:1398228800936087674> Création du poll en cours...');
		const poll=await thread.send({
			components: [text],
			flags: MessageFlags.IsComponentsV2
		});
		const btnOui=new ButtonBuilder()
			.setLabel('Oui 0%')
			.setCustomId(`pollOui${poll.id}${ticket.id}`)
			.setEmoji('✅')
			.setStyle(ButtonStyle.Success);
		const btnNon=new ButtonBuilder()
			.setLabel('Non 0%')
			.setCustomId(`pollNon${poll.id}${ticket.id}`)
			.setEmoji('❎')
			.setStyle(ButtonStyle.Danger);
		const container=new ContainerBuilder();
		container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## Voulez-vous avoir ${interaction.user.username} (id: \`${interaction.user.id}\`) dans l'équipe ?\nVotez avec Oui ou avec Non pour faire votre choix !`));
		container.addActionRowComponents(new ActionRowBuilder().addComponents(btnOui).addComponents(btnNon));
		poll.edit({
			flags: MessageFlags.IsComponentsV2,
			components: [container]
		});
		poll.pin();

	}
});

client.on('interactionCreate', async interaction=>{ // copier-coller d'en haut avec pti chamgements
	if(!interaction.type===InteractionType.ModalSubmit)return;
	if(interaction.customId==='ouvrirTicketPartenariat'){
		await interaction.deferReply({ ephemeral: true });
		const themeduprojet=interaction.fields.getTextInputValue('themeduprojet');
		const dsclink=interaction.fields.getTextInputValue('dsclink');
		const regexdsclink=/^(https?:\/\/)?discord\.((com\/invite)|(gg))\/\S+$/;
		if(!regexdsclink.test(dsclink)){
			const text=new TextDisplayBuilder().setContent('## ⛓️‍💥 Lien invalide !\nModifiez le lien grâce au bouton ci-dessous 😉 !');
			const btnreplacelink=new ButtonBuilder()
				.setCustomId('ouvrirTicketPrePartenariat')
				.setLabel('Modifier mon lien')
				.setStyle(ButtonStyle.Success);
			const btnRow=new ActionRowBuilder().addComponents(btnreplacelink);
			const container=new ContainerBuilder();
			container.addTextDisplayComponents(text);
			container.addActionRowComponents(btnRow);
			await interaction.editReply({
				flags: MessageFlags.IsComponentsV2,
				components: [container]
			});
			return;
		}
		const type='partenariat';
		const types=['postuler', 'aide', 'partenariat', 'autre']; // FLEMME DE CHANGER MDR
		const emojisTypes=['💼', '❓', '🤝', '𝛺']; // idem
		const ticket=await interaction.guild.channels.create({
			name: `${emojisTypes[types.indexOf(type)]}-${interaction.user.tag}`,
			type: ChannelType.GuildText,
			parent: categories[interaction.guild.id],
			permissionOverwrites: [
				{
					id: interaction.guild.id,
					deny: [PermissionFlagsBits.ViewChannel],
				},
				{
					id: interaction.user.id,
					allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
				},
			]
		});
		const isBeginingWithHttpS=(dsclink.indexOf('https')>-1)<(dsclink.indexOf('://'));
		const isBeginingWithHttp=((dsclink.indexOf('http')>-1)<(dsclink.indexOf('://')))&&!isBeginingWithHttpS;
		const newlnk=`${isBeginingWithHttpS?dsclink:`${isBeginingWithHttp?('https'+dsclink.substr(4)):'https://'+dsclink}`}`.replace('com/invite', 'gg');
		tickets[interaction.guild.id]=tickets[interaction.guild.id]||new Object();
		tickets[interaction.guild.id][ticket.id]={
			type: type,
			owner: interaction.user.id,
			ownerName: interaction.user.username,
			themeduprojet: themeduprojet,
			dsclink: newlnk
		}
		const jsonStr=JSON.stringify(tickets, null, 4);
		fs.writeFileSync('tickets.json', jsonStr, 'utf8');
		const embed=new EmbedBuilder()
			.setTitle(' ')
			.setDescription(`## Bienvenue sur votre ticket !\nType du ticket : **${tickets[interaction.guild.id][ticket.id].type}**\nOuvert : **Le <t:${String(Math.round((new Date()*1)/1000))}:F>**\nThème du projet : **${themeduprojet}**\nLien du serveur Discord : **${newlnk}**\n### Veuillez patienter quelques instants, une personne du Staff vous répondra sous peu 🤗.`)
			.setColor(0xff7523)
			.setFooter({
				text: 'Powered by ikikrepus community'
			});
		const msgBienvenue=await ticket.send({
			content: `<@${interaction.user.id}>`,
			embeds: [embed]
		});
		tickets[interaction.guild.id][ticket.id].first=msgBienvenue.id;
		const boutonFermer=new ButtonBuilder()
			.setStyle(ButtonStyle.Danger)
			.setCustomId('fermerTicket')
			.setLabel('🔒 Fermer');
		const boutonTraiter=new ButtonBuilder()
			.setStyle(ButtonStyle.Success)
			.setCustomId('traiteTicket')
			.setLabel('🙋‍♂️ Traiter');
		msgBienvenue.edit({
			content: `<@${interaction.user.id}>`,
			embeds: [embed],
			components: [new ActionRowBuilder().addComponents(boutonFermer).addComponents(boutonTraiter)]
		});
		interaction.editReply({
			content: `Ticket bien créé dans <#${ticket.id}> :tada: !`,
			ephemeral: true
		});
		console.log(`${btna} ticket créé dans ${interaction.channel.id}`);
	}
});

client.on('interactionCreate', async interaction=>{
	if(!interaction.isButton())return;
	if(interaction.customId.substr(0,7)==='pollOui'){
		await interaction.deferReply({ ephemeral: true });
		const pollId=interaction.customId.substr(7,19);
		const ticketId=interaction.customId.substr(26);
		const ticket=await interaction.guild.channels.cache.get(ticketId);
		await ticket.threads.fetchActive();
		const threads = ticket.threads.cache;
		const thread=await threads.first();
		const poll=await thread.messages.fetch(pollId);
		if(tickets[interaction.guild.id][ticketId].grdOui.indexOf(interaction.user.id)>-1){
			const btnRmvVt=new ButtonBuilder()
				.setLabel('Retirer le vote')
				.setCustomId(`rmvVt${ticketId}${pollId}`)
				.setEmoji('➖')
				.setStyle(ButtonStyle.Danger);
			await interaction.editReply({
				content: 'Vous avez déjà voté pour OUI !',
				components: [new ActionRowBuilder().addComponents(btnRmvVt)],
				ephemeral: true
			});
			return;
		}

		if(tickets[interaction.guild.id][ticketId].grdNon.indexOf(interaction.user.id)>-1){
			delete tickets[interaction.guild.id][ticketId].grdNon[tickets[interaction.guild.id][ticketId].grdNon.indexOf(interaction.user.id)];
			tickets[interaction.guild.id][ticketId].grdNon=tickets[interaction.guild.id][ticketId].grdNon.flat();
		}
		// On évite les doubles votes :)

		tickets[interaction.guild.id][ticketId].grdOui.push(interaction.user.id);
		const jsonStr=JSON.stringify(tickets, null, 4);
		fs.writeFileSync('tickets.json', jsonStr, 'utf8');
		interaction.editReply({
			content: 'Votre vote pour OUI a bien été pris en compte !',
			ephemeral: true
		});
		const rslttsOui=tickets[interaction.guild.id][ticketId].grdOui.length;
		const rslttsNon=tickets[interaction.guild.id][ticketId].grdNon.length;
		const rslttsTotaux=rslttsOui+rslttsNon;
		const pourcentageOui=(rslttsOui/rslttsTotaux).toFixed(2)*100;
		const pourcentageNon=(rslttsNon/rslttsTotaux).toFixed(2)*100;
		const btnOui=new ButtonBuilder()
			.setLabel(`Oui ${pourcentageOui}%`)
			.setCustomId(`pollOui${pollId}${ticketId}`)
			.setEmoji('✅')
			.setStyle(ButtonStyle.Success);
		const btnNon=new ButtonBuilder()
			.setLabel(`Non ${pourcentageNon}%`)
			.setCustomId(`pollNon${pollId}${ticketId}`)
			.setEmoji('❎')
			.setStyle(ButtonStyle.Danger);
		const ticketOwner=await interaction.guild.members.cache.get(tickets[interaction.guild.id][ticketId].owner);
		const container=new ContainerBuilder();
		container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## Voulez-vous avoir ${tickets[interaction.guild.id][ticketId].ownerName} (id: \`${ticketOwner.id}\`) dans l'équipe ?\nVotez avec Oui ou avec Non pour faire votre choix !`));
		container.addActionRowComponents(new ActionRowBuilder().addComponents(btnOui).addComponents(btnNon));
		poll.edit({
			flags: MessageFlags.IsComponentsV2,
			components: [container]
		});
	}else if(interaction.customId.substr(0,7)==='pollNon'){
		await interaction.deferReply({ ephemeral: true });
		const pollId=interaction.customId.substr(7,19);
		const ticketId=interaction.customId.substr(26);
		const ticket=await interaction.guild.channels.cache.get(ticketId);
		await ticket.threads.fetchActive();
		const threads = ticket.threads.cache;
		const thread=await threads.first();
		const poll=await thread.messages.fetch(pollId);
		if(tickets[interaction.guild.id][ticketId].grdNon.indexOf(interaction.user.id)>-1){
			const btnRmvVt=new ButtonBuilder()
				.setLabel('Retirer le vote')
				.setCustomId(`rmvVt${ticketId}${pollId}`)
				.setEmoji('➖')
				.setStyle(ButtonStyle.Danger);
			await interaction.editReply({
				content: 'Vous avez déjà voté pour NON !',
				components: [new ActionRowBuilder().addComponents(btnRmvVt)],
				ephemeral: true
			});
			return;
		}else if(tickets[interaction.guild.id][ticketId].grdOui.indexOf(interaction.user.id)>-1){
			delete tickets[interaction.guild.id][ticketId].grdOui[tickets[interaction.guild.id][ticketId].grdOui.indexOf(interaction.user.id)];
			tickets[interaction.guild.id][ticketId].grdOui=tickets[interaction.guild.id][ticketId].grdOui.flat();
		}
		tickets[interaction.guild.id][ticketId].grdNon.push(interaction.user.id);
		const jsonStr=JSON.stringify(tickets, null, 4);
		fs.writeFileSync('tickets.json', jsonStr, 'utf8');
		interaction.editReply({
			content: 'Votre vote pour NON a bien été pris en compte !',
			ephemeral: true
		});
		const rslttsOui=tickets[interaction.guild.id][ticketId].grdOui.length;
		const rslttsNon=tickets[interaction.guild.id][ticketId].grdNon.length;
		const rslttsTotaux=rslttsOui+rslttsNon;
		const pourcentageOui=(rslttsOui/rslttsTotaux).toFixed(2)*100;
		const pourcentageNon=(rslttsNon/rslttsTotaux).toFixed(2)*100;
		const btnOui=new ButtonBuilder()
			.setLabel(`Oui ${pourcentageOui}%`)
			.setCustomId(`pollOui${pollId}${ticketId}`)
			.setEmoji('✅')
			.setStyle(ButtonStyle.Success);
		const btnNon=new ButtonBuilder()
			.setLabel(`Non ${pourcentageNon}%`)
			.setCustomId(`pollNon${pollId}${ticketId}`)
			.setEmoji('❎')
			.setStyle(ButtonStyle.Danger);
		const ticketOwner=await interaction.guild.members.cache.get(tickets[interaction.guild.id][ticketId].owner);
		const container=new ContainerBuilder()
		container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## Voulez-vous avoir ${tickets[interaction.guild.id][ticketId].ownerName} (id: \`${ticketOwner.id}\`) dans l'équipe ?\nVotez avec Oui ou avec Non pour faire votre choix !`));
		container.addActionRowComponents(new ActionRowBuilder().addComponents(btnOui).addComponents(btnNon));
		poll.edit({
			flags: MessageFlags.IsComponentsV2,
			components: [container]
		});
	}else if(interaction.customId.substr(0,5)==='rmvVt'){
		await interaction.deferReply({ ephemeral: true });
		const ticketId=interaction.customId.substr(5, 19);
		const pollId=interaction.customId.substr(24);
		const isOnOui=tickets[interaction.guild.id][ticketId].grdOui.indexOf(interaction.user.id)>-1;
		const isOnNon=tickets[interaction.guild.id][ticketId].grdNon.indexOf(interaction.user.id)>-1;
		if(!isOnOui&&!isOnNon){
			await interaction.editReply({
				content: 'Vous n\'avez pas voté !\nL\'action ne peut pas être effectuée.',
				ephemeral: true
			});
			return;
		}
		const ticket=await interaction.guild.channels.cache.get(ticketId);
		await ticket.threads.fetchActive();
		const threads = ticket.threads.cache;
		const thread=await threads.first();
		const poll=await thread.messages.fetch(pollId);
		if(isOnOui){
			delete tickets[interaction.guild.id][ticketId].grdOui[tickets[interaction.guild.id][ticketId].grdOui.indexOf(interaction.user.id)];
			tickets[interaction.guild.id][ticketId].grdOui=tickets[interaction.guild.id][ticketId].grdOui.flat();
			const jsonStr=JSON.stringify(tickets, null, 4);
			fs.writeFileSync('tickets.json', jsonStr, 'utf8');
			const rslttsOui=tickets[interaction.guild.id][ticketId].grdOui.length;
			const rslttsNon=tickets[interaction.guild.id][ticketId].grdNon.length;
			const rslttsTotaux=rslttsOui+rslttsNon;
			const pourcentageOui=((rslttsOui/rslttsTotaux).toFixed(2)*100)||0;
			const pourcentageNon=((rslttsNon/rslttsTotaux).toFixed(2)*100)||0;
			const btnOui=new ButtonBuilder()
				.setLabel(`Oui ${pourcentageOui}%`)
				.setCustomId(`pollOui${pollId}${ticketId}`)
				.setEmoji('✅')
				.setStyle(ButtonStyle.Success);
			const btnNon=new ButtonBuilder()
				.setLabel(`Non ${pourcentageNon}%`)
				.setCustomId(`pollNon${pollId}${ticketId}`)
				.setEmoji('❎')
				.setStyle(ButtonStyle.Danger);
			const ticketOwner=await interaction.guild.members.cache.get(tickets[interaction.guild.id][ticketId].owner);
			const container=new ContainerBuilder();
			container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## Voulez-vous avoir ${tickets[interaction.guild.id][ticketId].ownerName} (id: \`${ticketOwner.id}\`) dans l'équipe ?\nVotez avec Oui ou avec Non pour faire votre choix !`));
			container.addActionRowComponents(new ActionRowBuilder().addComponents(btnOui).addComponents(btnNon));
			poll.edit({
				flags: MessageFlags.IsComponentsV2,
				components: [container]
			});
			await interaction.editReply({
				content: 'Votre vote pour OUI a bien été retiré !'
			});
			return;
		}
		delete tickets[interaction.guild.id][ticketId].grdNon[tickets[interaction.guild.id][ticketId].grdNon.indexOf(interaction.user.id)];
		tickets[interaction.guild.id][ticketId].grdNon=tickets[interaction.guild.id][ticketId].grdNon.flat();
		const jsonStr=JSON.stringify(tickets, null, 4);
		fs.writeFileSync('tickets.json', jsonStr, 'utf8');
		const rslttsOui=tickets[interaction.guild.id][ticketId].grdOui.length;
		const rslttsNon=tickets[interaction.guild.id][ticketId].grdNon.length;
		const rslttsTotaux=rslttsOui+rslttsNon;
		const pourcentageOui=((rslttsOui/rslttsTotaux).toFixed(2)*100)||0;
		const pourcentageNon=((rslttsNon/rslttsTotaux).toFixed(2)*100)||0;
		const btnOui=new ButtonBuilder()
			.setLabel(`Oui ${pourcentageOui}%`)
			.setCustomId(`pollOui${pollId}${ticketId}`)
			.setEmoji('✅')
			.setStyle(ButtonStyle.Success);
		const btnNon=new ButtonBuilder()
			.setLabel(`Non ${pourcentageNon}%`)
			.setCustomId(`pollNon${pollId}${ticketId}`)
			.setEmoji('❎')
			.setStyle(ButtonStyle.Danger);
		const ticketOwner=await interaction.guild.members.cache.get(tickets[interaction.guild.id][ticketId].owner);
		const container=new ContainerBuilder();
		container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## Voulez-vous avoir ${tickets[interaction.guild.id][ticketId].ownerName} (id: \`${ticketOwner.id}\`) dans l'équipe ?\nVotez avec Oui ou avec Non pour faire votre choix !`));
		container.addActionRowComponents(new ActionRowBuilder().addComponents(btnOui).addComponents(btnNon));
		poll.edit({
			flags: MessageFlags.IsComponentsV2,
			components: [container]
		});
		await interaction.editReply({
			content: 'Votre vote pour NON a bien été retiré !'
		});
	}
});

client.on('messageCreate', async message=>{
	var imgsLnk=[];
	if(message.attachments.size > 0) {
    message.attachments.forEach(attachment=>{
      if(/\.(jpg|jpeg|png|gif|webp)/i.test(attachment.url)){
        imgsLnk.push({
        	url: attachment.url,
        	width: attachment.width,
        	height: attachment.height
        });
      }
    });
  }
  var imgsRender=[];
  imgsLnk.forEach(img=>{
  	imgsRender.push(`<div class="image" style="width:${img.width}px;height:${img.height}px;"><div class="app-icon" style="left:${Number(img.width)-32}px;"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 96 96" width="96" height="96" style="width: 20px; height: auto; transform:translate3d(0px, 0px, 0px);content-visibility:visible;position:relative;left:6px;top:4px;" preserveAspectRatio="xMidYMid meet"><defs><clipPath id="__lottie_element_58458"><rect width="96" height="96" x="0" y="0"></rect></clipPath><clipPath id="__lottie_element_58460"><path d="M0,0 L96,0 L96,96 L0,96z"></path></clipPath></defs><g clip-path="url(#__lottie_element_58458)"><g clip-path="url(#__lottie_element_58460)" style="display: block;" transform="matrix(2.700000047683716,0,0,2.700000047683716,-79.60000610351562,-81.35110473632812)" opacity="1"><g style="display: block;" transform="matrix(1,0,0,1,32.02199935913086,32.64699935913086)" opacity="1"><g opacity="1" transform="matrix(1,0,0,1,7.179999828338623,7.181000232696533)"><path fill="currentColor" fill-opacity="1" d=" M-6.554999828338623,1.6410000324249268 C-6.929999828338623,3.0420000553131104 -6.099999904632568,4.480999946594238 -4.698999881744385,4.85699987411499 C-4.698999881744385,4.85699987411499 1.6410000324249268,6.554999828338623 1.6410000324249268,6.554999828338623 C3.0409998893737793,6.931000232696533 4.48199987411499,6.098999977111816 4.85699987411499,4.698999881744385 C4.85699987411499,4.698999881744385 6.554999828338623,-1.6410000324249268 6.554999828338623,-1.6410000324249268 C6.929999828338623,-3.0420000553131104 6.098999977111816,-4.480999946594238 4.698999881744385,-4.85699987411499 C4.698999881744385,-4.85699987411499 -1.6410000324249268,-6.556000232696533 -1.6410000324249268,-6.556000232696533 C-3.0409998893737793,-6.931000232696533 -4.48199987411499,-6.099999904632568 -4.85699987411499,-4.698999881744385 C-4.85699987411499,-4.698999881744385 -6.554999828338623,1.6410000324249268 -6.554999828338623,1.6410000324249268z"></path></g></g><g style="display: block;" transform="matrix(1,0,0,1,47.44300079345703,32.419002532958984)" opacity="1"><g opacity="1" transform="matrix(1,0,0,1,7.802000045776367,7.021999835968018)"><path fill="rgb(199,200,206)" fill-opacity="1" d=" M-6.478000164031982,2.4040000438690186 C-7.552000045776367,4.372000217437744 -6.126999855041504,6.771999835968018 -3.884999990463257,6.771999835968018 C-3.884999990463257,6.771999835968018 3.885999917984009,6.771999835968018 3.885999917984009,6.771999835968018 C6.127999782562256,6.771999835968018 7.552000045776367,4.372000217437744 6.479000091552734,2.4040000438690186 C6.479000091552734,2.4040000438690186 2.5929999351501465,-4.718999862670898 2.5929999351501465,-4.718999862670898 C1.4739999771118164,-6.771999835968018 -1.4730000495910645,-6.771999835968018 -2.5929999351501465,-4.718999862670898 C-2.5929999351501465,-4.718999862670898 -6.478000164031982,2.4040000438690186 -6.478000164031982,2.4040000438690186z"></path></g></g><g style="display: block;" transform="matrix(1,0,0,1,32.119998931884766,49.04499816894531)" opacity="1"><g opacity="1" transform="matrix(1,0,0,1,7.081999778747559,7.046999931335449)"><path fill="currentColor" fill-opacity="1" d=" M-0.9409999847412109,-6.26800012588501 C-0.42100000381469727,-6.796999931335449 0.41999998688697815,-6.796999931335449 0.9409999847412109,-6.26800012588501 C0.9409999847412109,-6.26800012588501 2.056999921798706,-5.132999897003174 2.056999921798706,-5.132999897003174 C2.2699999809265137,-4.916999816894531 2.5480000972747803,-4.78000020980835 2.8459999561309814,-4.744999885559082 C2.8459999561309814,-4.744999885559082 4.4120001792907715,-4.561999797821045 4.4120001792907715,-4.561999797821045 C5.140999794006348,-4.4770002365112305 5.665999889373779,-3.805999994277954 5.585000038146973,-3.061000108718872 C5.585000038146973,-3.061000108718872 5.410999774932861,-1.4630000591278076 5.410999774932861,-1.4630000591278076 C5.377999782562256,-1.1579999923706055 5.447000026702881,-0.8510000109672546 5.605999946594238,-0.5910000205039978 C5.605999946594238,-0.5910000205039978 6.441999912261963,0.7720000147819519 6.441999912261963,0.7720000147819519 C6.831999778747559,1.406999945640564 6.644999980926514,2.24399995803833 6.0229997634887695,2.6440000534057617 C6.0229997634887695,2.6440000534057617 4.690999984741211,3.502000093460083 4.690999984741211,3.502000093460083 C4.436999797821045,3.6649999618530273 4.24399995803833,3.9119999408721924 4.144000053405762,4.201000213623047 C4.144000053405762,4.201000213623047 3.621000051498413,5.7179999351501465 3.621000051498413,5.7179999351501465 C3.378000020980835,6.423999786376953 2.619999885559082,6.796999931335449 1.9259999990463257,6.551000118255615 C1.9259999990463257,6.551000118255615 0.43799999356269836,6.021999835968018 0.43799999356269836,6.021999835968018 C0.15399999916553497,5.921999931335449 -0.1550000011920929,5.921999931335449 -0.43799999356269836,6.021999835968018 C-0.43799999356269836,6.021999835968018 -1.9270000457763672,6.551000118255615 -1.9270000457763672,6.551000118255615 C-2.619999885559082,6.796999931335449 -3.378000020980835,6.423999786376953 -3.621999979019165,5.7179999351501465 C-3.621999979019165,5.7179999351501465 -4.144999980926514,4.201000213623047 -4.144999980926514,4.201000213623047 C-4.24399995803833,3.9119999408721924 -4.436999797821045,3.6649999618530273 -4.690999984741211,3.502000093460083 C-4.690999984741211,3.502000093460083 -6.02400016784668,2.6440000534057617 -6.02400016784668,2.6440000534057617 C-6.644999980926514,2.24399995803833 -6.831999778747559,1.406999945640564 -6.442999839782715,0.7720000147819519 C-6.442999839782715,0.7720000147819519 -5.605999946594238,-0.5910000205039978 -5.605999946594238,-0.5910000205039978 C-5.447000026702881,-0.8510000109672546 -5.377999782562256,-1.1579999923706055 -5.4120001792907715,-1.4630000591278076 C-5.4120001792907715,-1.4630000591278076 -5.585000038146973,-3.061000108718872 -5.585000038146973,-3.061000108718872 C-5.665999889373779,-3.805999994277954 -5.142000198364258,-4.4770002365112305 -4.4120001792907715,-4.561999797821045 C-4.4120001792907715,-4.561999797821045 -2.8469998836517334,-4.744999885559082 -2.8469998836517334,-4.744999885559082 C-2.5480000972747803,-4.78000020980835 -2.2699999809265137,-4.916999816894531 -2.056999921798706,-5.132999897003174 C-2.056999921798706,-5.132999897003174 -0.9409999847412109,-6.26800012588501 -0.9409999847412109,-6.26800012588501z"></path></g></g><g style="display: block;" transform="matrix(-1,0,0,-1,62.694000244140625,63.320003509521484)" opacity="1"><g opacity="1" transform="matrix(1,0,0,1,7.247000217437744,7.247000217437744)"><path fill="currentColor" fill-opacity="1" d=" M1.5130000114440918,-5.5920000076293945 C0.9929999709129333,-6.997000217437744 -0.9940000176429749,-6.997000217437744 -1.5140000581741333,-5.5920000076293945 C-1.5140000581741333,-5.5920000076293945 -2.190999984741211,-3.760999917984009 -2.190999984741211,-3.760999917984009 C-2.4600000381469727,-3.0339999198913574 -3.0339999198913574,-2.4600000381469727 -3.76200008392334,-2.190999984741211 C-3.76200008392334,-2.190999984741211 -5.5920000076293945,-1.5130000114440918 -5.5920000076293945,-1.5130000114440918 C-6.997000217437744,-0.9940000176429749 -6.997000217437744,0.9929999709129333 -5.5920000076293945,1.5130000114440918 C-5.5920000076293945,1.5130000114440918 -3.76200008392334,2.190999984741211 -3.76200008392334,2.190999984741211 C-3.0339999198913574,2.4600000381469727 -2.4600000381469727,3.0339999198913574 -2.190999984741211,3.760999917984009 C-2.190999984741211,3.760999917984009 -1.5140000581741333,5.5920000076293945 -1.5140000581741333,5.5920000076293945 C-0.9940000176429749,6.997000217437744 0.9929999709129333,6.997000217437744 1.5130000114440918,5.5920000076293945 C1.5130000114440918,5.5920000076293945 2.190000057220459,3.760999917984009 2.190000057220459,3.760999917984009 C2.4600000381469727,3.0339999198913574 3.0329999923706055,2.4600000381469727 3.760999917984009,2.190999984741211 C3.760999917984009,2.190999984741211 5.5920000076293945,1.5130000114440918 5.5920000076293945,1.5130000114440918 C6.997000217437744,0.9929999709129333 6.997000217437744,-0.9940000176429749 5.5920000076293945,-1.5130000114440918 C5.5920000076293945,-1.5130000114440918 3.760999917984009,-2.190999984741211 3.760999917984009,-2.190999984741211 C3.0329999923706055,-2.4600000381469727 2.4600000381469727,-3.0339999198913574 2.190000057220459,-3.760999917984009 C2.190000057220459,-3.760999917984009 1.5130000114440918,-5.5920000076293945 1.5130000114440918,-5.5920000076293945z"></path></g></g></g></g></svg></div><img src="${img.url}" style="width:${img.width}px;height:${img.height}px;"></div>`)
  });
	if(Object.keys(tickets[message.guild.id]||[]).indexOf(message.channel.id)<0)return;
	var h=[];
	for(var i=0;i<message.embeds.length;i++){
		var cleanedDescription=message.embeds[i].description;
		cleanedDescription=(()=>{var a='';try{a=marked.parse(cleanedDescription)}catch{a="<p>Erreur lors de l'archivage du message...</p>";e=true}return a})().replace(/<strong>(.*?)<\/strong>/g, "<span class=\"bold\">$1</span>").replace(/<p>(.*?)<\/p>/g, "$1").replace(/<\/h([123]{1})><br>/g, "</h$1><br class=\"not\">").replace(/<br><h([123]{1})>/g, "<br class=\"not\"><h$1>");
		cleanedDescription=cleanedDescription.replace(/<\/h([123]{1})><br>/g, "</h$1><br class=\"not\">").replace(/<br><h([123]{1})>/g, "<br class=\"not\"><h$1>");
		h[i]={
			author: {
				img: message.embeds[i]?.author?.icon_url,
				text: message.embeds[i]?.author?.name
			},
			title: message.embeds[i].title,
			description: cleanedDescription,
			footer: {
				img: message.embeds[i]?.footer?.icon_url,
				text: message.embeds[i]?.footer?.text
			},
			reactions: [],
			images: imgsRender
		}
	}
	var e=false;
	for(var i=0;i<message.embeds.length;i++){
		var cleanedDescription=message.embeds[i].description;
		cleanedDescription=(()=>{var a='';try{a=marked.parse(cleanedDescription)}catch{a="<p>Erreur lors de l'archivage du message...</p>";e=true}return a})().replace(/<strong>(.*?)<\/strong>/g, "<span class=\"bold\">$1</span>").replace(/<p>(.*?)<\/p>/g, "$1").replace(/<\/h([123]{1})><br>/g, "</h$1><br class=\"not\">").replace(/<br><h([123]{1})>/g, "<br class=\"not\"><h$1>");
		cleanedDescription=cleanedDescription.replace(/<\/h([123]{1})><br>/g, "</h$1><br class=\"not\">").replace(/<br><h([123]{1})>/g, "<br class=\"not\"><h$1>");
		cleanedDescription=(msgcontent=>{
  let returnDescription = msgcontent || ''; // Utiliser msgcontent comme base

  // Trouver tous les timestamps dans le message
  const timestampMatches = msgcontent.match(/&lt;t:(\d+):([TDFRtdfr])&gt;/g) || [];

  // Parcourir chaque timestamp trouvé
  for (let i = 0; i < timestampMatches.length; i++) {
    const match = timestampMatches[i].match(/&lt;t:(\d+):([TDFRtdfr])&gt;/);
    if (!match) continue;

    const unixTimestamp = parseInt(match[1]); // Extraire l'horodatage
    const date = new Date(unixTimestamp * 1000); // Convertir en objet Date
    const format = match[2]; // Extraire le modificateur (t, T, d, D, f, F, R)

    let formattedDate;
    switch (format) {
      case 'F': // Format complet
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        break;
      case 'f': // Format court avec jour
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        break;
      case 't': // Heure et minute
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          hour: '2-digit',
          minute: '2-digit',
        });
        break;
      case 'T': // Heure, minute, seconde
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        break;
      case 'd': // Date courte
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        break;
      case 'D': // Date longue
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        break;
      case 'R': // Temps relatif
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
        }) + ` (environ ${Math.floor((Date.now() - date) / (1000 * 60 * 60 * 24))} jours à partir de maintenant)`;
        break;
      default:
        formattedDate = date.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
    }

    // Remplacer le timestamp par la date formatée
    returnDescription = returnDescription.replace(timestampMatches[i], formattedDate);
  }

  return returnDescription;
})(cleanedDescription)
		h[i]={
			author: {
				img: message.embeds[i]?.author?.icon_url,
				text: message.embeds[i]?.author?.name
			},
			title: message.embeds[i].title,
			description: cleanedDescription,
			footer: {
				img: message.embeds[i]?.footer?.icon_url,
				text: message.embeds[i]?.footer?.text
			},
			reactions: []
		}
	}
	const boutons = [];
	message.components.forEach(row => {
		row.components.forEach(component => {
			if (component.type === 2) { // Type 2 = Button
				boutons.push({
					customId: component.customId || '',
					label: component.label || ' ',
					style: component.style?(Object.keys(ButtonStyle).find(key=>ButtonStyle[key] === component.style)).toLowerCase():'primary',
					emoji: component.emoji ? component.emoji.name || component.emoji.id : '',
					url: component.url || '',
					disabled: component.disabled||false,
					type: 'Button'
				});
			}
		});
	});
	var g=[];
	for(var i=0;i<boutons.length;i++){
		g[i]={
			emoji: boutons[i].emoji,
			label: boutons[i].label,
			style: boutons[i].style,
			link: boutons[i].url||null
		}
	}
	const author=await message.guild.members.fetch(message.author.id);
	const phr=author.roles.highest;
	const hex=(phr?.color||0).toString(16);
	const objectRender={
		content: (await(async()=>{var a='';try{a=marked.parse(message.content)}catch{a="Erreur lors de l'archivage du message...";e=true}console.log(a.match(/&lt;@[0123456789]{19}&gt;/))
			for(var i=0;i<(a.match(/&lt;@\d{19}&gt;/)||[]).length;i++){
    const userId=a.match(/&lt;@[0123456789]{19}&gt;/)[i].substr(5,19)
    console.log(`userid=${userId}`)
    /*// Simulation de fetch par le bot
  const user={
    username: 'mydkong_toctoc',
        globalName: 'Poulpe Glacé',
        bot: false
  }*/ // on simule plus !
    const user=await message.guild.members.cache.get(userId)
    a=a.replace(new RegExp(`&lt;@${userId}&gt;`, ''), `<span class="mention">@${user.user.globalName||user.user.username}</span>`)
}
			for(var i=0;i<(a.match(/&lt;#\d{19}&gt;/)||[]).length;i++){
    const channelId=a.match(/&lt;#[0123456789]{19}&gt;/)[i].substr(5,19)
    console.log(`channelid=${channelId}`)
    const channel=await message.guild.channels.cache.get(channelId)
    console.log('channel: ')
    console.log(channel)
    a=a.replace(new RegExp(`&lt;#${channelId}&gt;`, ''), `<span class="mention-channel"><svg class="icon_b75563 channel-icon" aria-label="Salon" aria-hidden="false" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M10.99 3.16A1 1 0 1 0 9 2.84L8.15 8H4a1 1 0 0 0 0 2h3.82l-.67 4H3a1 1 0 1 0 0 2h3.82l-.8 4.84a1 1 0 0 0 1.97.32L8.85 16h4.97l-.8 4.84a1 1 0 0 0 1.97.32l.86-5.16H20a1 1 0 1 0 0-2h-3.82l.67-4H21a1 1 0 1 0 0-2h-3.82l.8-4.84a1 1 0 1 0-1.97-.32L15.15 8h-4.97l.8-4.84ZM14.15 14l.67-4H9.85l-.67 4h4.97Z" clip-rule="evenodd" class=""></path></svg>${channel.name}</span>`)
}
			for(var i=0;i<(a.match(/&lt;a?:[A-Za-z_]+:\d{1,19}&gt;/)||[]).length;i++){
			console.log('match')
			console.log(a.match(/&lt;a?:[A-Za-z_]+:\d{1,19}&gt;/)[i].match(/&lt;a?:[A-Za-z_]+:/)[0].length, a.match(/&lt;a?:[A-Za-z_]+:\d{1,19}&gt;/)[i].match(/\d{1,19}/)[i].length)
    const emojiId=a.match(/&lt;a?:[A-Za-z_]+:\d{1,19}&gt;/)[i].substr(a.match(/&lt;a?:[A-Za-z_]+:\d{1,19}&gt;/)[i].match(/&lt;a?:[A-Za-z_]+:/)[0].length,a.match(/&lt;a?:[A-Za-z_]+:\d{1,19}&gt;/)[i].match(/\d{1,19}/)[i].length);
    console.log(`emojiid=${emojiId}`)
    a=a.replace(new RegExp(`&lt;a?:[A-Za-z_]+:${emojiId}&gt;`, ''), `<span class="emoji"><img src="https://cdn.discordapp.com/emojis/${emojiId}.webp?size=44&animated=true" draggable="false"></span>`)
}
a=(msgcontent=>{
  let returnDescription = msgcontent || ''; // Utiliser msgcontent comme base

  // Trouver tous les timestamps dans le message
  const timestampMatches = msgcontent.match(/&lt;t:(\d+):([TDFRtdfr])&gt;/g) || [];

  // Parcourir chaque timestamp trouvé
  for (let i = 0; i < timestampMatches.length; i++) {
    const match = timestampMatches[i].match(/&lt;t:(\d+):([TDFRtdfr])&gt;/);
    if (!match) continue;

    const unixTimestamp = parseInt(match[1]); // Extraire l'horodatage
    const date = new Date(unixTimestamp * 1000); // Convertir en objet Date
    const format = match[2]; // Extraire le modificateur (t, T, d, D, f, F, R)

    let formattedDate;
    switch (format) {
      case 'F': // Format complet
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        break;
      case 'f': // Format court avec jour
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        break;
      case 't': // Heure et minute
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          hour: '2-digit',
          minute: '2-digit',
        });
        break;
      case 'T': // Heure, minute, seconde
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        break;
      case 'd': // Date courte
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        break;
      case 'D': // Date longue
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        break;
      case 'R': // Temps relatif
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
        }) + ` (environ ${Math.floor((Date.now() - date) / (1000 * 60 * 60 * 24))} jours à partir de maintenant)`;
        break;
      default:
        formattedDate = date.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
    }

    // Remplacer le timestamp par la date formatée
    returnDescription = returnDescription.replace(timestampMatches[i], formattedDate);
  }

  return returnDescription;
})(a)
		;return a})()).replace(/<strong>(.*?)<\/strong>/g, "<span class=\"bold\">$1</span>"),
		embeds: h,
		buttons: g,
		modified: message.editedTimestamp,
		author: {
			id: message.author.id,
			tag: message.author.tag,
			username: message.author.username,
			nickName: message.author.nickName,
			globalName: message.author.globalName,
			bot: message.author.bot||e,
			avatar: message.author.avatarURL({ dynamic: true, size: 128 }),
			color: hex
		},
		images: imgsRender,
		date: `${String(new Date().getDate()).length===1?"0"+String(new Date().getDate()):String(new Date().getDate())}/${String(new Date().getMonth()+1).length===1?"0"+String(new Date().getMonth()+1):String(new Date().getMonth()+1)}/${String(new Date().getYear()+1900)} ${String(new Date().getHours()).length===1?"0"+String(new Date().getHours()):String(new Date().getHours())}:${String(new Date().getMinutes()).length===1?"0"+String(new Date().getMinutes()):String(new Date().getMinutes())}`
	}
	tickets[message.guild.id][message.channel.id].jsonRender=tickets[message.guild.id][message.channel.id].jsonRender||{};
	tickets[message.guild.id][message.channel.id].jsonRender[message.id]=objectRender;
	const jsonStr=JSON.stringify(tickets, null, 4);
	fs.writeFileSync('tickets.json', jsonStr, 'utf8');
	console.log(`${btna} message bien push grace au json que voici !`)
	console.log(objectRender)
	console.log('mtn boutons :')
	console.log(boutons)
	console.log('objectrender.content')
	console.log(objectRender.content)
	if((message?.embeds[0]?.description===`## Le ticket est inactif...\nLe ticket semble inactif depuis peu, voulez-vous le supprimer ?`)&&(message.author.id='1386277393743872060'))return;
	queue[message.guild.id]=queue[message.guild.id]||{};
	queue[message.guild.id][message.channel.id]=queue[message.guild.id][message.channel.id]||[];
	queue[message.guild.id][message.channel.id].push(message.id);
	setTimeout(()=>{
		if(queue[message.channel.id]?.length===1){
			const embed=new EmbedBuilder()
				.setTitle(' ')
				.setDescription(`## Le ticket est inactif...\nLe ticket semble inactif depuis peu, voulez-vous le supprimer ?`)
				.setFooter({ text: 'Powered by ikikrepus community' });
			const button=new ButtonBuilder()
				.setLabel('Fermer')
				.setEmoji('🔒')
				.setCustomId('fermerTicket')
				.setStyle(ButtonStyle.Danger)
			try{
				message.channel.send({
					content: `@everyone`,
					embeds: [embed],
					components: [new ActionRowBuilder.addComponents(button)]
				});
			}catch (err){
				console.log(err)
			}
		}
		queue[message.guild.id][message.channel.id].shift()
	}, 259200000)
	const jsonStr2=JSON.stringify(queue, null, 4);
	fs.writeFileSync('queue.json', jsonStr2, 'utf8');
});

client.on('messageUpdate', async(om,message)=>{
	var imgsLnk=[];
	if (message.attachments.size > 0) {
    message.attachments.forEach(attachment => {
      if (/\.(jpg|jpeg|png|gif|webp)/i.test(attachment.url)) {
        imgsLnk.push({
        	url: attachment.url,
        	width: attachment.width,
        	height: attachment.height
        });
      }
    });
  }
  var imgsRender=[];
  imgsLnk.forEach(img=>{
  	imgsRender.push(`<div class="image" style="width:${img.width}px;height:${img.height}px;"><div class="app-icon" style="left:${Number(img.width)-32}px;"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 96 96" width="96" height="96" style="width: 20px; height: auto; transform:translate3d(0px, 0px, 0px);content-visibility:visible;position:relative;left:6px;top:4px;" preserveAspectRatio="xMidYMid meet"><defs><clipPath id="__lottie_element_58458"><rect width="96" height="96" x="0" y="0"></rect></clipPath><clipPath id="__lottie_element_58460"><path d="M0,0 L96,0 L96,96 L0,96z"></path></clipPath></defs><g clip-path="url(#__lottie_element_58458)"><g clip-path="url(#__lottie_element_58460)" style="display: block;" transform="matrix(2.700000047683716,0,0,2.700000047683716,-79.60000610351562,-81.35110473632812)" opacity="1"><g style="display: block;" transform="matrix(1,0,0,1,32.02199935913086,32.64699935913086)" opacity="1"><g opacity="1" transform="matrix(1,0,0,1,7.179999828338623,7.181000232696533)"><path fill="currentColor" fill-opacity="1" d=" M-6.554999828338623,1.6410000324249268 C-6.929999828338623,3.0420000553131104 -6.099999904632568,4.480999946594238 -4.698999881744385,4.85699987411499 C-4.698999881744385,4.85699987411499 1.6410000324249268,6.554999828338623 1.6410000324249268,6.554999828338623 C3.0409998893737793,6.931000232696533 4.48199987411499,6.098999977111816 4.85699987411499,4.698999881744385 C4.85699987411499,4.698999881744385 6.554999828338623,-1.6410000324249268 6.554999828338623,-1.6410000324249268 C6.929999828338623,-3.0420000553131104 6.098999977111816,-4.480999946594238 4.698999881744385,-4.85699987411499 C4.698999881744385,-4.85699987411499 -1.6410000324249268,-6.556000232696533 -1.6410000324249268,-6.556000232696533 C-3.0409998893737793,-6.931000232696533 -4.48199987411499,-6.099999904632568 -4.85699987411499,-4.698999881744385 C-4.85699987411499,-4.698999881744385 -6.554999828338623,1.6410000324249268 -6.554999828338623,1.6410000324249268z"></path></g></g><g style="display: block;" transform="matrix(1,0,0,1,47.44300079345703,32.419002532958984)" opacity="1"><g opacity="1" transform="matrix(1,0,0,1,7.802000045776367,7.021999835968018)"><path fill="rgb(199,200,206)" fill-opacity="1" d=" M-6.478000164031982,2.4040000438690186 C-7.552000045776367,4.372000217437744 -6.126999855041504,6.771999835968018 -3.884999990463257,6.771999835968018 C-3.884999990463257,6.771999835968018 3.885999917984009,6.771999835968018 3.885999917984009,6.771999835968018 C6.127999782562256,6.771999835968018 7.552000045776367,4.372000217437744 6.479000091552734,2.4040000438690186 C6.479000091552734,2.4040000438690186 2.5929999351501465,-4.718999862670898 2.5929999351501465,-4.718999862670898 C1.4739999771118164,-6.771999835968018 -1.4730000495910645,-6.771999835968018 -2.5929999351501465,-4.718999862670898 C-2.5929999351501465,-4.718999862670898 -6.478000164031982,2.4040000438690186 -6.478000164031982,2.4040000438690186z"></path></g></g><g style="display: block;" transform="matrix(1,0,0,1,32.119998931884766,49.04499816894531)" opacity="1"><g opacity="1" transform="matrix(1,0,0,1,7.081999778747559,7.046999931335449)"><path fill="currentColor" fill-opacity="1" d=" M-0.9409999847412109,-6.26800012588501 C-0.42100000381469727,-6.796999931335449 0.41999998688697815,-6.796999931335449 0.9409999847412109,-6.26800012588501 C0.9409999847412109,-6.26800012588501 2.056999921798706,-5.132999897003174 2.056999921798706,-5.132999897003174 C2.2699999809265137,-4.916999816894531 2.5480000972747803,-4.78000020980835 2.8459999561309814,-4.744999885559082 C2.8459999561309814,-4.744999885559082 4.4120001792907715,-4.561999797821045 4.4120001792907715,-4.561999797821045 C5.140999794006348,-4.4770002365112305 5.665999889373779,-3.805999994277954 5.585000038146973,-3.061000108718872 C5.585000038146973,-3.061000108718872 5.410999774932861,-1.4630000591278076 5.410999774932861,-1.4630000591278076 C5.377999782562256,-1.1579999923706055 5.447000026702881,-0.8510000109672546 5.605999946594238,-0.5910000205039978 C5.605999946594238,-0.5910000205039978 6.441999912261963,0.7720000147819519 6.441999912261963,0.7720000147819519 C6.831999778747559,1.406999945640564 6.644999980926514,2.24399995803833 6.0229997634887695,2.6440000534057617 C6.0229997634887695,2.6440000534057617 4.690999984741211,3.502000093460083 4.690999984741211,3.502000093460083 C4.436999797821045,3.6649999618530273 4.24399995803833,3.9119999408721924 4.144000053405762,4.201000213623047 C4.144000053405762,4.201000213623047 3.621000051498413,5.7179999351501465 3.621000051498413,5.7179999351501465 C3.378000020980835,6.423999786376953 2.619999885559082,6.796999931335449 1.9259999990463257,6.551000118255615 C1.9259999990463257,6.551000118255615 0.43799999356269836,6.021999835968018 0.43799999356269836,6.021999835968018 C0.15399999916553497,5.921999931335449 -0.1550000011920929,5.921999931335449 -0.43799999356269836,6.021999835968018 C-0.43799999356269836,6.021999835968018 -1.9270000457763672,6.551000118255615 -1.9270000457763672,6.551000118255615 C-2.619999885559082,6.796999931335449 -3.378000020980835,6.423999786376953 -3.621999979019165,5.7179999351501465 C-3.621999979019165,5.7179999351501465 -4.144999980926514,4.201000213623047 -4.144999980926514,4.201000213623047 C-4.24399995803833,3.9119999408721924 -4.436999797821045,3.6649999618530273 -4.690999984741211,3.502000093460083 C-4.690999984741211,3.502000093460083 -6.02400016784668,2.6440000534057617 -6.02400016784668,2.6440000534057617 C-6.644999980926514,2.24399995803833 -6.831999778747559,1.406999945640564 -6.442999839782715,0.7720000147819519 C-6.442999839782715,0.7720000147819519 -5.605999946594238,-0.5910000205039978 -5.605999946594238,-0.5910000205039978 C-5.447000026702881,-0.8510000109672546 -5.377999782562256,-1.1579999923706055 -5.4120001792907715,-1.4630000591278076 C-5.4120001792907715,-1.4630000591278076 -5.585000038146973,-3.061000108718872 -5.585000038146973,-3.061000108718872 C-5.665999889373779,-3.805999994277954 -5.142000198364258,-4.4770002365112305 -4.4120001792907715,-4.561999797821045 C-4.4120001792907715,-4.561999797821045 -2.8469998836517334,-4.744999885559082 -2.8469998836517334,-4.744999885559082 C-2.5480000972747803,-4.78000020980835 -2.2699999809265137,-4.916999816894531 -2.056999921798706,-5.132999897003174 C-2.056999921798706,-5.132999897003174 -0.9409999847412109,-6.26800012588501 -0.9409999847412109,-6.26800012588501z"></path></g></g><g style="display: block;" transform="matrix(-1,0,0,-1,62.694000244140625,63.320003509521484)" opacity="1"><g opacity="1" transform="matrix(1,0,0,1,7.247000217437744,7.247000217437744)"><path fill="currentColor" fill-opacity="1" d=" M1.5130000114440918,-5.5920000076293945 C0.9929999709129333,-6.997000217437744 -0.9940000176429749,-6.997000217437744 -1.5140000581741333,-5.5920000076293945 C-1.5140000581741333,-5.5920000076293945 -2.190999984741211,-3.760999917984009 -2.190999984741211,-3.760999917984009 C-2.4600000381469727,-3.0339999198913574 -3.0339999198913574,-2.4600000381469727 -3.76200008392334,-2.190999984741211 C-3.76200008392334,-2.190999984741211 -5.5920000076293945,-1.5130000114440918 -5.5920000076293945,-1.5130000114440918 C-6.997000217437744,-0.9940000176429749 -6.997000217437744,0.9929999709129333 -5.5920000076293945,1.5130000114440918 C-5.5920000076293945,1.5130000114440918 -3.76200008392334,2.190999984741211 -3.76200008392334,2.190999984741211 C-3.0339999198913574,2.4600000381469727 -2.4600000381469727,3.0339999198913574 -2.190999984741211,3.760999917984009 C-2.190999984741211,3.760999917984009 -1.5140000581741333,5.5920000076293945 -1.5140000581741333,5.5920000076293945 C-0.9940000176429749,6.997000217437744 0.9929999709129333,6.997000217437744 1.5130000114440918,5.5920000076293945 C1.5130000114440918,5.5920000076293945 2.190000057220459,3.760999917984009 2.190000057220459,3.760999917984009 C2.4600000381469727,3.0339999198913574 3.0329999923706055,2.4600000381469727 3.760999917984009,2.190999984741211 C3.760999917984009,2.190999984741211 5.5920000076293945,1.5130000114440918 5.5920000076293945,1.5130000114440918 C6.997000217437744,0.9929999709129333 6.997000217437744,-0.9940000176429749 5.5920000076293945,-1.5130000114440918 C5.5920000076293945,-1.5130000114440918 3.760999917984009,-2.190999984741211 3.760999917984009,-2.190999984741211 C3.0329999923706055,-2.4600000381469727 2.4600000381469727,-3.0339999198913574 2.190000057220459,-3.760999917984009 C2.190000057220459,-3.760999917984009 1.5130000114440918,-5.5920000076293945 1.5130000114440918,-5.5920000076293945z"></path></g></g></g></g></svg></div><img src="${img.url}" style="width:${img.width}px;height:${img.height}px;"></div>`)
  });
	if(Object.keys(tickets[message.guild.id]||[]).indexOf(message.channel.id)<0)return;
	var h=[];
	for(var i=0;i<message.embeds.length;i++){
		var cleanedDescription=message.embeds[i].description;
		cleanedDescription=(()=>{var a='';try{a=marked.parse(cleanedDescription)}catch{a="<p>Erreur lors de l'archivage du message...</p>";e=true}return a})().replace(/<strong>(.*?)<\/strong>/g, "<span class=\"bold\">$1</span>").replace(/<p>(.*?)<\/p>/g, "$1").replace(/<\/h([123]{1})><br>/g, "</h$1><br class=\"not\">").replace(/<br><h([123]{1})>/g, "<br class=\"not\"><h$1>");
		cleanedDescription=cleanedDescription.replace(/<\/h([123]{1})><br>/g, "</h$1><br class=\"not\">").replace(/<br><h([123]{1})>/g, "<br class=\"not\"><h$1>");
		cleanedDescription=(msgcontent=>{
  let returnDescription = msgcontent || ''; // Utiliser msgcontent comme base

  // Trouver tous les timestamps dans le message
  const timestampMatches = msgcontent.match(/&lt;t:(\d+):([TDFRtdfr])&gt;/g) || [];

  // Parcourir chaque timestamp trouvé
  for (let i = 0; i < timestampMatches.length; i++) {
    const match = timestampMatches[i].match(/&lt;t:(\d+):([TDFRtdfr])&gt;/);
    if (!match) continue;

    const unixTimestamp = parseInt(match[1]); // Extraire l'horodatage
    const date = new Date(unixTimestamp * 1000); // Convertir en objet Date
    const format = match[2]; // Extraire le modificateur (t, T, d, D, f, F, R)

    let formattedDate;
    switch (format) {
      case 'F': // Format complet
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        break;
      case 'f': // Format court avec jour
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        break;
      case 't': // Heure et minute
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          hour: '2-digit',
          minute: '2-digit',
        });
        break;
      case 'T': // Heure, minute, seconde
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        break;
      case 'd': // Date courte
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        break;
      case 'D': // Date longue
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        break;
      case 'R': // Temps relatif
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
        }) + ` (environ ${Math.floor((Date.now() - date) / (1000 * 60 * 60 * 24))} jours à partir de maintenant)`;
        break;
      default:
        formattedDate = date.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
    }

    // Remplacer le timestamp par la date formatée
    returnDescription = returnDescription.replace(timestampMatches[i], formattedDate);
  }

  return returnDescription;
})(cleanedDescription)
		h[i]={
			author: {
				img: message.embeds[i]?.author?.icon_url,
				text: message.embeds[i]?.author?.name
			},
			title: message.embeds[i].title,
			description: cleanedDescription,
			footer: {
				img: message.embeds[i]?.footer?.icon_url,
				text: message.embeds[i]?.footer?.text
			},
			reactions: []
		}
	}
	const boutons = [];
	message.components.forEach(row => {
		row.components.forEach(component => {
			if (component.type === 2) { // Type 2 = Button
				boutons.push({
					customId: component.customId || '',
					label: component.label || ' ',
					style: component.style?(Object.keys(ButtonStyle).find(key=>ButtonStyle[key] === component.style)).toLowerCase():'primary',
					emoji: component.emoji ? component.emoji.name || component.emoji.id : '',
					url: component.url || '',
					disabled: component.disabled || false,
					type: 'Button'
				});
			}
		});
	});
	var g=[];
	for(var i=0;i<boutons.length;i++){
		g[i]={
			emoji: boutons[i].emoji,
			label: boutons[i].label,
			style: boutons[i].style,
			link: boutons[i].url||null
		}
	}
	const author=await message.guild.members.fetch(message.author.id);
	const phr=author.roles.highest;
	const hex=(phr?.color||0).toString(16);
	var e=false;
	const objectRender={
		content: (await(async()=>{var a='';try{a=marked.parse(message.content)}catch{a="Erreur lors de l'archivage du message...";e=true}console.log(a.match(/&lt;@[0123456789]{19}&gt;/))
			for(var i=0;i<(a.match(/&lt;@[0123456789]{19}&gt;/)||[]).length;i++){
    const userId=a.match(/&lt;@[0123456789]{19}&gt;/)[i].substr(5,19)
    console.log(`userid=${userId}`)
    /*// Simulation de fetch par le bot
  const user={
    username: 'mydkong_toctoc',
        globalName: 'Poulpe Glacé',
        bot: false
  }*/ // on simule plus !
    const user=await message.guild.members.cache.get(userId)
    a=a.replace(new RegExp(`&lt;@${userId}&gt;`, ''), `<span class="mention">@${user.user.globalName||user.user.username}</span>`)
}
			for(var i=0;i<(a.match(/&lt;#[0123456789]{19}&gt;/)||[]).length;i++){
    const channelId=a.match(/&lt;#[0123456789]{19}&gt;/)[i].substr(5,19)
    console.log(`channelid=${channelId}`)
    const channel=await message.guild.channels.cache.get(channelId)
    console.log('channel: ')
    console.log(channel)
    a=a.replace(new RegExp(`&lt;#${channelId}&gt;`, ''), `<span class="mention-channel"><svg class="icon_b75563 channel-icon" aria-label="Salon" aria-hidden="false" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M10.99 3.16A1 1 0 1 0 9 2.84L8.15 8H4a1 1 0 0 0 0 2h3.82l-.67 4H3a1 1 0 1 0 0 2h3.82l-.8 4.84a1 1 0 0 0 1.97.32L8.85 16h4.97l-.8 4.84a1 1 0 0 0 1.97.32l.86-5.16H20a1 1 0 1 0 0-2h-3.82l.67-4H21a1 1 0 1 0 0-2h-3.82l.8-4.84a1 1 0 1 0-1.97-.32L15.15 8h-4.97l.8-4.84ZM14.15 14l.67-4H9.85l-.67 4h4.97Z" clip-rule="evenodd" class=""></path></svg>${channel.name}</span>`)
}
			for(var i=0;i<(a.match(/&lt;a?:[A-Za-z_]+:\d{1,19}&gt;/)||[]).length;i++){
			console.log('match')
			console.log(a.match(/&lt;a?:[A-Za-z_]+:\d{1,19}&gt;/)[i].match(/&lt;a?:[A-Za-z_]+:/)[0].length, a.match(/&lt;a?:[A-Za-z_]+:\d{1,19}&gt;/)[i].match(/\d{1,19}/)[i].length)
    const emojiId=a.match(/&lt;a?:[A-Za-z_]+:\d{1,19}&gt;/)[i].substr(a.match(/&lt;a?:[A-Za-z_]+:\d{1,19}&gt;/)[i].match(/&lt;a?:[A-Za-z_]+:/)[0].length,a.match(/&lt;a?:[A-Za-z_]+:\d{1,19}&gt;/)[i].match(/\d{1,19}/)[i].length);
    console.log(`emojiid=${emojiId}`)
    a=a.replace(new RegExp(`&lt;a?:[A-Za-z_]+:${emojiId}&gt;`, ''), `<span class="emoji"><img src="https://cdn.discordapp.com/emojis/${emojiId}.webp?size=44&animated=true" draggable="false"></span>`)
}
a=(msgcontent=>{
  let returnDescription = msgcontent || ''; // Utiliser msgcontent comme base

  // Trouver tous les timestamps dans le message
  const timestampMatches = msgcontent.match(/&lt;t:(\d+):([TDFRtdfr])&gt;/g) || [];

  // Parcourir chaque timestamp trouvé
  for (let i = 0; i < timestampMatches.length; i++) {
    const match = timestampMatches[i].match(/&lt;t:(\d+):([TDFRtdfr])&gt;/);
    if (!match) continue;

    const unixTimestamp = parseInt(match[1]); // Extraire l'horodatage
    const date = new Date(unixTimestamp * 1000); // Convertir en objet Date
    const format = match[2]; // Extraire le modificateur (t, T, d, D, f, F, R)

    let formattedDate;
    switch (format) {
      case 'F': // Format complet
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        break;
      case 'f': // Format court avec jour
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        break;
      case 't': // Heure et minute
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          hour: '2-digit',
          minute: '2-digit',
        });
        break;
      case 'T': // Heure, minute, seconde
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        break;
      case 'd': // Date courte
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        break;
      case 'D': // Date longue
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        break;
      case 'R': // Temps relatif
        formattedDate = date.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
        }) + ` (environ ${Math.floor((Date.now() - date) / (1000 * 60 * 60 * 24))} jours à partir de maintenant)`;
        break;
      default:
        formattedDate = date.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
    }

    // Remplacer le timestamp par la date formatée
    returnDescription = returnDescription.replace(timestampMatches[i], formattedDate);
  }

  return returnDescription;
})(a)
		;return a})()).replace(/<strong>(.*?)<\/strong>/g, "<span class=\"bold\">$1</span>"),
		embeds: h,
		buttons: g,
		modified: message.editedTimestamp,
		author: {
			id: message.author.id,
			tag: message.author.tag,
			username: message.author.username,
			nickName: message.author.nickName,
			globalName: message.author.globalName,
			bot: message.author.bot||e,
			avatar: message.author.avatarURL({ dynamic: true, size: 128 }),
			color: hex
		},
		images: imgsRender,
		date: `${String(new Date().getDate()).length===1?"0"+String(new Date().getDate()):String(new Date().getDate())}/${String(new Date().getMonth()+1).length===1?"0"+String(new Date().getMonth()+1):String(new Date().getMonth()+1)}/${String(new Date().getYear()+1900)} ${String(new Date().getHours()).length===1?"0"+String(new Date().getHours()):String(new Date().getHours())}:${String(new Date().getMinutes()).length===1?"0"+String(new Date().getMinutes()):String(new Date().getMinutes())}`
	}
	console.log('couleur du membre :',phr.color)
	tickets[message.guild.id][message.channel.id].jsonRender=tickets[message.guild.id][message.channel.id].jsonRender||{};
	tickets[message.guild.id][message.channel.id].jsonRender[om.id]=objectRender;
	const jsonStr=JSON.stringify(tickets, null, 4);
	fs.writeFileSync('tickets.json', jsonStr, 'utf8');
	console.log(`${btna} message bien push grace au json que voici !`)
	console.log(objectRender)
	console.log('mtn boutons :')
	console.log(boutons)
	console.log('objectrender.content')
	console.log(objectRender.content)
	if((message?.embeds[0]?.description===`## Le ticket est inactif...\nLe ticket semble inactif depuis peu, voulez-vous le supprimer ?`)&&(message.author.id='1386277393743872060'))return;
	queue[message.guild.id]=queue[message.guild.id]||{};
	queue[message.guild.id][message.channel.id]=queue[message.guild.id][message.channel.id]||[];
	queue[message.guild.id][message.channel.id].push(message.id+'edited');
	setTimeout(()=>{
		if(queue[message.channel.id]?.length===1){
			const embed=new EmbedBuilder()
				.setTitle(' ')
				.setDescription(`## Le ticket est inactif...\nLe ticket semble inactif depuis peu, voulez-vous le supprimer ?`)
				.setFooter({ text: 'Powered by ikikrepus community' });
			const button=new ButtonBuilder()
				.setLabel('Fermer')
				.setEmoji('🔒')
				.setCustomId('fermerTicket')
				.setStyle(ButtonStyle.Danger)
			try{
				message.channel.send({
					content: `@everyone`,
					embeds: [embed],
					components: [new ActionRowBuilder.addComponents(button)]
				});
			}catch (err){
				console.log(err)
			}
		}
		queue[message.guild.id][message.channel.id].shift()
	}, 259200000)
	const jsonStr2=JSON.stringify(queue, null, 4);
	fs.writeFileSync('queue.json', jsonStr2, 'utf8');
});

client.on('messageReactionAdd', async (reaction,user)=>{
	if(Object.keys(tickets[reaction.message.guild.id]||[]).indexOf(reaction.message.channel.id)<0)return;
	let finallyObject={};
	if(reaction.emoji.id){
		finallyObject={
			display: `<img src="https://cdn.discordapp.com/emojis/${reaction.emoji.id}.webp?size=44&animated=true">`,
			name: reaction.emoji.name,
			id: reaction.emoji.id,
			count: reaction.count
		}
	}else{
		finallyObject={
			display: `<emoji>${reaction.emoji.name}</emoji>`,
			name: reaction.emoji.name,
			id: null,
			count: reaction.count
		}
	}
	tickets[reaction.message.guild.id][reaction.message.channel.id].jsonRender[reaction.message.id].reactions=tickets[reaction.message.guild.id][reaction.message.channel.id].jsonRender[reaction.message.id].reactions||{}; 
	tickets[reaction.message.guild.id][reaction.message.channel.id].jsonRender[reaction.message.id].reactions[reaction.emoji.id||reaction.emoji.name]=finallyObject;
	const jsonStr=JSON.stringify(tickets, null, 4);
	fs.writeFileSync('tickets.json', jsonStr, 'utf8');
})

client.on('messageReactionRemove', async (reaction,user)=>{
	if(Object.keys(tickets[reaction.message.guild.id]||[]).indexOf(reaction.message.channel.id)<0)return;
	let finallyObject={};
	try{
		delete tickets[reaction.message.guild.id][reaction.message.channel.id].jsonRender[reaction.message.id].reactions[reaction.emoji.id||reaction.emoji.name];
	}catch{}
	const jsonStr=JSON.stringify(tickets, null, 4);
	fs.writeFileSync('tickets.json', jsonStr, 'utf8');
	tickets=JSON.parse(jsonStr);
})

client.on('messageDelete', async message=>{
	if(Object.keys(tickets[message.guild.id]||[]).indexOf(message.channel.id)<0)return;
	delete tickets[message.guild.id][message.channel.id].jsonRender[message.id];
	const jsonStr=JSON.stringify(tickets, null, 4);
	fs.writeFileSync('tickets.json', jsonStr, 'utf8');
	tickets=JSON.parse(fs.readFileSync('tickets.json', 'utf8'));
})

client.on('messageCreate', async message=>{
	if(!(message.channel.isThread()))return;
	if(!message.system)return;
	if(!message.type==='PINNED_MESSAGE')return;
	message.delete();
	console.log(`${btna} message système concernant le pin d'un nouveau msg dans un thread ou salon supprimé !`);
});

client.on('guildMemberAdd', async interaction=>{
	if(interaction.user.bot)return;
	const targetGuild=await client.guilds.cache.get(interaction.guild.id);
	const targetChannel=await targetGuild.channels.cache.get('1397680554412867735');
	const text=new TextDisplayBuilder().setContent(`### Ho ! Un nouveau membre !\n🎉 Hello \`@${interaction.user.globalName||interaction.user.username}\` ! J'espère que tu vas bien t'amuser au sein de ce serveur !\nCommence par lire le règlement de ce serveur 😉`);
	const buttonDiscuter=new ButtonBuilder()
		.setLabel('Lire le règlement')
		.setStyle(ButtonStyle.Link)
		.setURL('https://discord.com/channels/1395506837264269494/1395533125270114324/1396047958457450607');
	const targetUserAvatar=interaction.user.avatarURL({ dynamic: true, size: 256 })||member.user.defaultAvatarURL;
	const thumbnail=new ThumbnailBuilder().setURL(targetUserAvatar);
	const section=new SectionBuilder()
		.addTextDisplayComponents(text)
		.setThumbnailAccessory(thumbnail);
	const container=new ContainerBuilder();
	container.addSectionComponents(section);
	const actionrow=new ActionRowBuilder().addComponents(buttonDiscuter);
	container.addActionRowComponents(actionrow);
	try{
		await targetChannel.send({
			flags: MessageFlags.IsComponentsV2,
			components: [container]
		});
		const rulesChannel=await targetGuild.channels.cache.get('1395533125270114324');
		const ghostping=await rulesChannel.send(`<@${interaction.user.id}>`);
		await ghostping.delete();
	}catch{}
});

client.on(Events.GuildMemberRemove, async interaction=>{
	if(interaction.user.bot)return;
	if(interaction.partial){
		await interaction.fetch()
	}
	const targetGuild=await client.guilds.cache.get(interaction.guild.id);
	const targetChannel=await targetGuild.channels.cache.get('1397680554412867735');
	const text=new TextDisplayBuilder();
	text.setContent(`### Un membre vient de partir... 😭\nÀ bientôt \`@${interaction.user.globalName||interaction.user.username}\` ! J'espère que tu t'es bien amusé(e) au sein de ce serveur 👋 !`);
	const targetUserAvatar=interaction.user.avatarURL({ dynamic: true, size: 256 })||interaction.user.defaultAvatarURL;
	const thumbnail=new ThumbnailBuilder().setURL(targetUserAvatar);
	const section=new SectionBuilder()
	section.setThumbnailAccessory(thumbnail)
	section.addTextDisplayComponents(text);
	const container=new ContainerBuilder()
	container.addSectionComponents(section);
	try{
		await targetChannel.send({
			flags: MessageFlags.IsComponentsV2,
			components: [container]
		});
	}catch{}
});

client.login(token)
