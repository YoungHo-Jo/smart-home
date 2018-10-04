/***********************
	[TODO] 
		Implement UPDATE, DELETE

***********************/
_ = require("underscore")
module.exports = {
	router : router
}

function router(app, RSSI_STAY2)
{
	// GET ALL BOOKS
	app.get('/api/rssi_stay2/all', (req,res) => {
		RSSI_STAY2.find((err, rssi_stay2AllDatas) => {
			if(err) 
				return res.status(500).send({error: 'database failure'});
			res.json(rssi_stay2AllDatas);
		})
	});

	app.post('/api/rssi_stay2/save', (req, res) => {
		// var rssi_stay2 = new RSSI_STAY2( _.extend( req.body, // { // 	time : req.body.time // }))
		var rssi_stay2 = new RSSI_STAY2( _.extend(req.body));
		// var rssi_stay2 = new RSSI_STAY2( _.extend(JSON.stringify(req.body)));

		rssi_stay2.save( (err) => {
			if(err){
				console.error(err);
				res.json({result: 'save Error'});
				return;
			}
			res.json({result: 'save Success'});
		});
	});
}