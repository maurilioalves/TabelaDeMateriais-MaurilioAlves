using my.materials as db from '../db/schema';

service MaterialService @(path: '/material') {

  entity Material as projection on db.Material;

  // Função: retorna N materiais
  function filtroMateriais(quantidade : Integer) returns array of Material;

  // Action (Desafio): adiciona novo material
  action adicionarMaterial(Nome : String, Descr : String)
    returns { sucesso : Boolean; mensagem : String };
}