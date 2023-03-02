const { SlashCommandBuilder } = require('discord.js');
const { matrixMultiply } = require('../vendor/ualgebra');

module.exports = {
	data: new SlashCommandBuilder()
		.setName(`matrixmult`)
		.setDescription('Multiplies 2 matrices'),
	async execute(interaction) {
        const m1 = global.matrix1.get(interaction.user.id);
        const m2 = global.matrix2.get(interaction.user.id);
        if (m1 == undefined || m2 == undefined) {
            await interaction.reply(`${interaction.user.username} you have to set matrices using .matrix1 and .matrix2 first!`);
            return;
        }
        if (m1[0].length != m2.length) {
            await interaction.reply(`${interaction.user.username} your matrices cannot be multiplid! Remember m x n * n x p = m x p`);
        }
        const matrix = matrixMultiply(m1, m2);
        await interaction.reply(`${interaction.user.username}, your matrix is: \n${matrix.join('\n')}`);
	},
};