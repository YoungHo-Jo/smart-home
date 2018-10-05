/***********************
	[TODO] 
		Implement UPDATE, DELETE

***********************/
_ = require("underscore")
module.exports = {
	router : router
}

function router(app, CURRENT)
{
	// GET ALL BOOKS
	app.get('/api/current/all', (req,res) => {
		CURRENT.find((err, currentAllDatas) => {
			if(err) 
				return res.status(500).send({error: 'database failure'});
			res.json(currentAllDatas);
		})
	});

	// GET SINGLE BOOK
	app.get('/api/current/:current_id', (req, res) => {
		CURRENT.findOne({_id: req.params.current_id}, (err, currentData) => {
			if(err) 
				return res.status(500).json({error: err});
			if(!currentData) 
				return res.status(404).json({error: 'book not found'});
			res.json(currentData);
		})
	});

	app.post('/api/current/save', (req, res) => {

		// var current = new CURRENT( _.extend( req.body, // { // 	time : req.body.time // }))
		var current = new CURRENT( _.extend( req.body));
			current.save( (err) => {
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
	app.put('/api/current/:current_id', (req, res) => {
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
