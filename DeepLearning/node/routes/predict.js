/***********************
	[TODO] 
		Implement UPDATE, DELETE

*********************/
_ = require("underscore")
module.exports = {
	router : router
}

function router(app, PREDICT)
{
	// GET ALL BOOKS
	app.get('/api/predict/all', (req,res) => {
		PREDICT.find((err, predictAllDatas) => {
			if(err) 
				return res.status(500).send({error: 'database failure'});
			res.json(predictAllDatas);
		})
	});

	// GET SINGLE BOOK
	app.get('/api/predict/:predict_id', (req, res) => {
		PREDICT.findOne({_id: req.params.predict_id}, (err, predictData) => {
			if(err) 
				return res.status(500).json({error: err});
			if(!predictData) 
				return res.status(404).json({error: 'book not found'});
			res.json(predictData);
		})
	});

	app.post('/api/predict/save', (req, res) => {

		// var predict = new PREDICT( _.extend( req.body, // { // 	time : req.body.time // }))
		var predict = new PREDICT( _.extend( req.body));

		predict.save( (err) => {
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
	app.put('/api/predict/:predict_id', (req, res) => {
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
