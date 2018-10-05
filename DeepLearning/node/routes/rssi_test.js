/***********************
	[TODO] 
		Implement UPDATE, DELETE

***********************/

_ = require("underscore")
module.exports = {
	router : router
}
function router(app, RSSI_TEST)
{
	// GET ALL BOOKS
	app.get('/api/rssi_test/all', (req,res) => {
		RSSI_TEST.find((err, rssi_testAllDatas) => {
			if(err) 
				return res.status(500).send({error: 'database failure'});
			res.json(rssi_testAllDatas);
		})
	});

	// GET SINGLE BOOK
	app.get('/api/rssi_test/:rssi_test_id', (req, res) => {
		RSSI_TEST.findOne({_id: req.params.rssi_test_id}, (err, rssi_testData) => {
			if(err) 
				return res.status(500).json({error: err});
			if(!rssi_testData) 
				return res.status(404).json({error: 'book not found'});
			res.json(rssi_testData);
		})
	});

	app.post('/api/rssi_test/save', (req, res) => {

		// var rssi_test = new RSSI_TEST( _.extend( req.body, // { // 	time : req.body.time // }))
		var rssi_test = new RSSI_TEST( _.extend( req.body));
		// var rssi_test_data = Object.create( req.body );
		// Now we add to this the user id
		// rssi_test_data.title = req.body.name;
		// And finally...
		// var rssi_test = new RSSI_TEST( rssi_test_data );
		
		// var rssi_test = new RSSI_TEST();
		// rssi_test.set('iAmNotInTheSchema', true);
		// rssi_test.title = req.body.name;
		// rssi_test.time = new Date(req.body.time);
		// rssi_test.rssi_test_data = new Array(req.body.rssi_test_data);
		// rssi_test.current_data = new Array(req.body.current_data);

		rssi_test.save( (err) => {
			if(err){
				console.error(err);
				res.json({result: 'save Error'});
				return;
			}

			res.json({result: 'save Success'});
		});
	});


	//TODO : UPDATE, DELETE
	// // UPDATE THE BOOK
	app.put('/api/rssi_test/:rssi_test_id', (req, res) => {
		Book.findById(req.params.book_id, (err, book) => {
			if(err) return res.status(500).json({ error: 'database failure' });
			if(!book) return res.status(404).json({ error: 'book not found' });
	
			if(req.body.title) book.title = req.body.title;
			if(req.body.author) book.author = req.body.author;
			if(req.body.published_date) book.published_date = req.body.published_date;
	
			book.save( (err) => {
				if(err) res.status(500).json({error: 'failed to update'});
				res.json({message: 'book updated'});
			});
	
		});
	
	});

	// // DELETE BOOK
	// app.delete('/api/books/:book_id', function(req, res){
	// 	res.end();
	// });

}
