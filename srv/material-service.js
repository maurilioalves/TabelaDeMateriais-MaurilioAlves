const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const { Material } = this.entities;

    // ── FUNÇÃO: filtroMateriais ──────────────────────────────────────────
    this.on('filtroMateriais', async (req) => {
        const { quantidade } = req.data;

        if (!quantidade || quantidade <= 0) {
            return req.error(400, 'Quantidade deve ser maior que zero.');
        }

        const materiais = await SELECT.from(Material);

        // Retorna sequencialmente os primeiros N registros
        return materiais.slice(0, quantidade);
    });

    // ── ACTION (DESAFIO): adicionarMaterial ─────────────────────────────
    this.on('adicionarMaterial', async (req) => {
        const { Nome, Descr } = req.data;

        // Validação de campos obrigatórios
        if (!Nome || !Descr) {
            return { sucesso: false, mensagem: 'Todos os campos são obrigatórios.' };
        }

        // Calcula o próximo ID sequencial
        const todos = await SELECT.from(Material).orderBy('ID desc').limit(1);
        const proximoID = todos.length > 0 ? todos[0].ID + 1 : 1;

        // Gera NumMat sequencial também
        const ultimoNumMat = todos.length > 0 ? todos[0].NumMat : 1000;
        const proximoNumMat = ultimoNumMat + 1;

        // Verifica se NumMat já existe
        const existe = await SELECT.one.from(Material).where({ NumMat: proximoNumMat });
        if (existe) {
            return { sucesso: false, mensagem: `Material com NumMat ${proximoNumMat} já cadastrado.` };
        }

        // Insere o novo material
        await INSERT.into(Material).entries({
            ID: proximoID,
            NumMat: proximoNumMat,
            Nome,
            Descr
        });

        return { sucesso: true, mensagem: `Material "${Nome}" cadastrado com sucesso! ID: ${proximoID}` };
    });
});