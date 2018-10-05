/***********************
	[TODO] 
		Implement UPDATE, DELETE

***********************/
_ = require("underscore")
module.exports = {
	router : router
}

function router(app, RSSI_REAL)
{
	// GET ALL BOOKS
	app.get('/api/rssi_real/all', (req,res) => {
		RSSI_REAL.find((err, rssi_realAllDatas) => {
			if(err) 
				return res.status(500).send({error: 'database failure'});
			res.json(rssi_realAllDatas);
		})
	});

	app.post('/api/rssi_real/save', (req, res) => {
		// var rssi_real = new RSSI_REAL( _.extend( req.body, // { // 	time : req.body.time // }))
		var rssi_real = new RSSI_REAL( _.extend(req.body));
		// var rssi_real = new RSSI_REAL( _.extend(JSON.stringify(req.body)));

		rssi_real.save( (err) => {
			if(err){
				console.error(err);
				res.json({result: 'save Error'});
				return;
			}
			res.json({result: 'save Success'});
		});
	});
}