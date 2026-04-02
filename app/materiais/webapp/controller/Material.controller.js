sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/VBox",
    "sap/m/Label"
], function (Controller, JSONModel, MessageBox, Dialog, Button, Input, VBox, Label) {
    "use strict";

    return Controller.extend("materiais.materiais.controller.Material", {

        // ── onInit: registra a rota ──────────────────────────────────────
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteMaterial").attachPatternMatched(this._onRouteMatched, this);
        },

        // ── Handler da rota ──────────────────────────────────────────────
        _onRouteMatched: function () {
            this._registrarModel();
            this._carregarMateriais();
        },

        // Registra o JSONModel na view
        _registrarModel: function () {
            var oModel = new JSONModel({ tableMaterial: [] });
            this.getView().setModel(oModel, "tableMaterial");
        },

        // Carrega os materiais do serviço CAP
        _carregarMateriais: function () {
            var oModel = this.getView().getModel("tableMaterial");

            fetch("/material/Material")
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    oModel.setProperty("/tableMaterial", data.value || []);
                })
                .catch(function () {
                    MessageBox.error("Erro ao carregar materiais.");
                });
        },

        // ── Botão Filtrar ────────────────────────────────────────────────
        onFiltrar: function () {
            var oInput = this.byId("inputQuantidade");
            var quantidade = parseInt(oInput.getValue(), 10);
            var oModel = this.getView().getModel("tableMaterial");

            if (!quantidade || quantidade <= 0) {
                MessageBox.warning("Informe uma quantidade válida.");
                return;
            }

            fetch("/material/filtroMateriais(quantidade=" + quantidade + ")")
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    oModel.setProperty("/tableMaterial", data.value || []);
                })
                .catch(function () {
                    MessageBox.error("Erro ao filtrar materiais.");
                });
        },

        // ── Botão Limpar ─────────────────────────────────────────────────
        onLimpar: function () {
            this.byId("inputQuantidade").setValue("");
            this._carregarMateriais();
        },

        // ── DESAFIO: Abrir Dialog de Criar ───────────────────────────────
        onAbrirDialogCriar: function () {
            var oView = this.getView();

            if (!this._oDialog) {
                this._oInputNome = new Input({ id: oView.createId("dlgNome"), placeholder: "Nome do material" });
                this._oInputDescr = new Input({ id: oView.createId("dlgDescr"), placeholder: "Descrição do material" });

                this._oDialog = new Dialog({
                    title: "Criar Novo Material",
                    content: new VBox({
                        class: "sapUiSmallMargin",
                        items: [
                            new Label({ text: "Nome", required: true }),
                            this._oInputNome,
                            new Label({ text: "Descrição", required: true }),
                            this._oInputDescr
                        ]
                    }),
                    beginButton: new Button({
                        text: "Salvar",
                        type: "Emphasized",
                        press: this._onSalvarMaterial.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancelar",
                        press: function () { this._oDialog.close(); }.bind(this)
                    })
                });

                oView.addDependent(this._oDialog);
            }

            this._oInputNome.setValue("");
            this._oInputDescr.setValue("");
            this._oDialog.open();
        },

        _onSalvarMaterial: function () {
            var nome = this._oInputNome.getValue().trim();
            var descr = this._oInputDescr.getValue().trim();

            console.log("Nome:", nome, "Descr:", descr); // para debug

            if (!nome || !descr) {
                MessageBox.warning("Preencha todos os campos obrigatórios.");
                return;
            }

            var numMat = Math.floor(Math.random() * 9000) + 1000;
            var that = this;

            fetch("/material/adicionarMaterial", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Nome: nome, Descr: descr })
            })
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    var resultado = data.value || data;
                    if (resultado.sucesso) {
                        MessageBox.success(resultado.mensagem, {
                            onClose: function () {
                                that._oDialog.close();
                                that._carregarMateriais();
                            }
                        });
                    } else {
                        MessageBox.error(resultado.mensagem);
                    }
                })
                .catch(function () {
                    MessageBox.error("Erro de comunicação com o servidor.");
                });
        }

    });
});