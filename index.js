const express 	 = require("express"),
	  bodyParser = require("body-parser"),
	  mongoose 	 = require("mongoose"),
	  app 		 = express(),
	  port       = process.env.PORT || 3000;
let   questionNumber,
	  currentScore,
	  thePlayer,
	  answered	 = [];

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect("mongodb://localhost/prime_football_trivia", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true
});

const questionSchema = new mongoose.Schema({
	question: String,
	options: [{body: String, letter: String}],
	answer: String 
});

const playerSchema = new mongoose.Schema({
	name: String,
	score: Number 
});

const Question = mongoose.model("Question", questionSchema);
const Player = mongoose.model("Player", playerSchema);

// Question.create({
// 	question: "Who was the only player to miss in the 2006 World Cup finals penalty shoot-out?",
// 	options: [{body: "Claude Makelele", letter: "A"}, {body: "Patrick Vieira", letter: "B"},
// 			 {body: "Florent Malouda", letter: "C"}, {body: "David Trezeguet", letter: "D"}],
// 	answer: "D"
// }, function(err, question){
// 	if(err){
// 		console.log("Something went wrong:");
// 		console.log(err);
// 	}
// 	else{
// 		console.log("A new question has been saved to the DB:");
// 		console.log(question);
// 	}
// })

app.get("/", function(req, res){
	answered = [];
	Player.deleteMany({},function(err){
		if(err){
			console.log("Something went wrong")
		}
		else{
			res.render("landing");
		}
	});
});

app.post("/", function(req, res){
	let name = req.body.playerName;
	let playerData = {name: name, score: 0};
	Player.create(playerData, function(err){
		if(err){
			console.log("Something went wrong");
		}
		else{
			res.redirect("/trivia");
		}
	})
 });

app.get("/trivia", function(req, res){
	Player.find({}, function(err, currentPlayer){
	if(err){
		console.log(err);
	}
	else {
		thePlayer = currentPlayer[0].name;
		res.render("trivia", {currentPlayer: currentPlayer[0].name, score: currentPlayer[0].score});
	}
  })
});

app.post("/trivia/start", function(req, res){
	let selected = req.body.selected;
	Player.find({}, function(err, player){
		if(err){
			console.log(err);
		}
		else {
			currentScore = player[0].score;	
		}
	});

	Question.find({}, function(err, questions){
		if(err){
			console.log(err);
		}
		else {
			if(questions[questionNumber].answer === selected){	
				Player.updateOne({}, { score: currentScore+1 }, function(err, player){
					if(err){
						console.log(err);
					}
					else {
						console.log(player);
					}
				});
			}
		}
	})
	res.redirect("/trivia/start");
});

app.get("/trivia/start", function(req, res){
	for(let i = 0; ; i++){
		if(answered.length === 10){
			break;
		}
		questionNumber = Math.floor(Math.random() * 20);
		if(answered.indexOf(questionNumber) === -1){
			Question.find({}, function(err, questions){
				if(err){
					console.log(err);
				}
				else {
					res.render("start", {question: questions[questionNumber].question, options: questions[questionNumber].options});
				}
			})
			answered.push(questionNumber);
			return;
		} 
	}
	Player.find({}, function(err, player){
		if(err){
			console.log(err);
		}
		else {
			res.render("end", {currentPlayer: thePlayer, score: player[0].score});
		}
	});
});

app.get("/trivia/playagain", function(req, res){
	answered = [];
	Player.updateOne({}, { score: 0 }, function(err, player){
		if(err){
			console.log(err);
		}
		else {
			console.log(player);
		}
	});
	res.redirect("/trivia/start");
})

app.listen(port, function(){
	console.log("Prime Football Trivia Server listening on port 3000");
})