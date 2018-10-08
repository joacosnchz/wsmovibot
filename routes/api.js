var express = require('express');
var router = express.Router();
var fs = require('fs');
var http = require('http');
var { WebhookClient } = require('dialogflow-fulfillment');

router.post('/webhook', (req, res, next) => {
	var agent = new WebhookClient({ request: req, response: res });
  	console.log(req.body);

  	let parameters = req.body.queryResult.parameters;

  	if(parameters) {
  		try {
  			console.log(parameters.NumeroParada + ' ' + parameters.LineaColectivo);
			if(parameters.NumeroParada && parameters.LineaColectivo) {
				console.log('entra');
				getCuandoLlega(parameters.NumeroParada, parameters.LineaColectivo, proximos => {
					console.log(proximos);
					if(proximos.length > 0) {
						res.json({ 'fulfillmentText': 'El proximo ' + proximos[0].linea + ' llega en ' + proximos[0].arribo });
					} else {
						res.json({ 'fulfillmentText': 'Disculpe, no hay servicios disponibles' });
					}
				});
			} else {
				res.json({ 'fulfillmentText': 'Disculpe, no pudimos efectuar su busqueda' });
			}
		} catch(e) {
			res.json({ 'fulfillmentText': 'Disculpe, no pudimos efectuar su busqueda' });
		}
  	} else {
  		res.json({ 'fulfillmentText': 'Disculpe, no pudimos efectuar su busqueda' });
  	}

	console.log('TODO: checklocal: '+ agent.locale);
	if(agent.locale === 'es') {

	}
});

router.get('/cuandollega/:parada/:linea', (req, res, next) => {
	getCuandoLlega(req.params.parada, req.params.linea, proximos => {
		res.json(proximos[0]);
	});
});

function getCuandoLlega(parada, linea, callback) {
	let data = '';
	http.get('http://rosarioton.esy.es/cuandollegaXparada/' + parada + '/' + linea, resp => {
		resp.on('data', chunk => {
			data += chunk;
		});

		resp.on('end', () => {
			console.log(data);
			try {
				callback(JSON.parse(data));
			} catch(e) {
				callback([]);
			}
		});
	});
};

module.exports = router;
