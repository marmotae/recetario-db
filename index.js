// preparamos los requisitos para hacer un request
var request = require("request");

"use strict"; 

class Receta{
    /**
     * Función para la construcción de un objeto receta, que no contiene ni ingredientes, ni preparación,
     * ni información nutrimental
     * @param {*} nombre                El nombre de la receta
     * @param {*} descripcion           La descripción general de la receta
     * @param {*} porciones             Número de porciones resultantes de la receta
     * @param {*} tiempoDePreparacion   Tiempo aproximado de preparació n
     */
    constructor(nombre,descripcion,porciones,tiempoDePreparacion){
        this._id = "";
        this._rev = "";
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.porciones = porciones;
        this.tiempoDePreparacion = tiempoDePreparacion;
        this.ingredientes = [];
        this.informacionNutrimental = {};
        this.preparacion = [];
    }

    /**
     * Función para la creación de un ingrediente a la lista de ingredientes de la receta
     * @param {*} cantidad      La cantidad a ser usada de este ingrediente
     * @param {*} unidad        La unidad de medida del ingrediente al que se refiere la cantidad
     * @param {*} ingrediente   El nombre del ingrediente
     */
    agregaIngrediente(cantidad,unidad,ingrediente){
        var entrada = {};
        entrada.ingrediente = ingrediente;
        entrada.unidad = unidad;
        entrada.cantidad = cantidad;
        this.ingredientes.push(entrada);
    }

    /**
     * Función para la creación de la información nutrimental de la receta
     * @param {*} calorias          La cantidad de calorías que contiene la receta
     * @param {*} caloriasDeGrasa   El porcentaje de calorías provimiente de grasa
     * @param {*} proteina          La cantidad de gramos de proteina de la receta
     * @param {*} grasa             La cantidad de gramos de grasa de la receta
     * @param {*} grasaSaturada     La cantidad de gramos de grasa saturada de la receta
     * @param {*} carbohidratos     La cantidad de gramos de carnohidratos de la receta
     * @param {*} fibra             La cantidad de gramos de fibra de la receta
     * @param {*} sodio             La cantidad de miligramos de sodio de la receta
     * @param {*} colesterol        La cantidad de miligramos de colesterol de la receta
     */
    agregaInformacionNutrimental(calorias,caloriasDeGrasa,proteina,grasa,grasaSaturada,carbohidratos,fibra,sodio,colesterol){
        this.informacionNutrimental.calorias=calorias;
        this.informacionNutrimental.caloriasDeGrasa=caloriasDeGrasa;
        this.informacionNutrimental.proteina=proteina;
        this.informacionNutrimental.grasa=grasa;
        this.informacionNutrimental.grasaSaturada=grasaSaturada;
        this.informacionNutrimental.carbohidratos=carbohidratos;
        this.informacionNutrimental.fibra=fibra;
        this.informacionNutrimental.sodio=sodio;
        this.informacionNutrimental.colesterol=colesterol;
    }

    /**
     * Función para agregar un paso de preparación a la receta 
     * @param {*} instruccion   La instrucción a ser agregada a la receta
     */
    agregaPaso(instruccion){
        var paso = this.preparacion.length + 1;
        var entrada = {};
        entrada.orden = paso;
        entrada.instruccion=instruccion;
        this.preparacion.push(entrada);
    }
}

class RecetarioDB {
    constructor (host){
        this.rootPath = 'https://'+host+'/recetario/';
    }
    
    /**
     * Funcion para la inserción de una receta dentro de la base de datos documental
     * @param {*} receta 
     */
    async insertaReceta(receta){
        var options = {};
        options.method = 'POST';
        options.url = this.rootPath + 'receta';
        options.headers = { 'accept':'application/json','content-type':'application/json'};
        options.body = receta;
        options.json = true;
        return new Promise(function (resolve, reject) {
            request(options, function (error, response, body){
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(error);
                }
            });
        });
    }

    /**
     * Función para enlistar la totalidad de recetas dentro de la base de datos
     */
    async listaRecetas(){
        var options = {};
        options.method = 'GET';
        options.url = this.rootPath + 'lista';
        options.headers = { 'accept':'application/json'};
        return new Promise(function (resolve, reject) {
            request(options, function (error, response, body){
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(error);
                }
            });
        });
    }

    /**
     * Función para consultar un listado de recetas con un valor calórico igual o menor
     * al pasado como parámetro
     * @param {*} topeCalorias El tope de calorías a contemplar en la consulta
     */
    async consultaRecetasPorCalorias(topeCalorias){
        var options = {};
        options.method = 'GET';
        options.url = this.rootPath + 'calorias';
        options.qs = {calorias:topeCalorias};
        options.headers = { 'accept':'application/json'};
        return new Promise(function (resolve, reject) {
            request(options, function (error, response, body){
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(error);
                }
            });
        });
    }

    /**
     * Función para realizar una consulta a la base para buscar una receta en específico
     * identificada por su id único
     * @param {*} id El identificador de la receta
     */
    async consultaRecetasPorId(id){
        var options = {};
        options.method = 'GET';
        options.url = this.rootPath + 'receta';
        options.qs = {_id:id};
        options.headers = { 'accept':'application/json'};
    
        return new Promise(function (resolve, reject) {
            request(options, function (error, response, body){
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(error);
                }
            });
        });
    }

    /**
     * Función para realizar la actualización de una receta existente a una nueva versión del mismo
     * @param {*} id El identificador de la receta
     * @param {*} nuevoValor La nueva versión de la receta
     */
    async actualizaReceta(id, nuevoValor){
        resp = await consultaRecetasPorId(id);
        viejo = JSON.parse(resp);
        nuevoValor._id = viejo.recetas[0]._id;
        nuevoValor._rev = viejo.recetas[0]._rev;
        
        var options = {};
        options.method = 'PUT';
        options.url = this.rootPath + 'receta';
        options.headers = { 'accept':'application/json','content-type':'application/json'};
        options.body = nuevoValor;
        options.json = true;
        return new Promise(function (resolve, reject) {
            request(options, function (error, response, body){
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(error);
                }
            });
        });
    }

    /**
     * Función para eliminar una receta existente dentro de la base de datos
     * @param {*} id 
     */
    async eliminaReceta(id){
        resp = await consultaRecetasPorId(id);
        viejo = JSON.parse(resp);
        meta = {};
        meta._id = viejo.recetas[0]._id;
        meta._rev = viejo.recetas[0]._rev;
        
        var options = {};
        options.method = 'DELETE';
        options.url = this.rootPath + 'receta';
        options.headers = { 'accept':'application/json','content-type':'application/json'};
        options.body = meta;
        options.json = true;
        return new Promise(function (resolve, reject) {
            request(options, function (error, response, body){
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(error);
                }
            });
        });
    }
}

module.exports.Receta = Receta;
module.exports.DB = RecetarioDB;