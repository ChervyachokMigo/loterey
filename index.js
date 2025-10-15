const fs = require('fs')
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');

let userlist = [];

const save_userlist = () => fs.writeFileSync('userlist.json', JSON.stringify(userlist, null, 4), { encoding: 'utf8' });
const backup_userlist = () => {
	const filename_date = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/\:/g, '_');;
	//replace dots
	const backup_filename = filename_date

	const backup_file = path.join(__dirname, `userlist_backup_${filename_date}.json`);
    fs.copyFileSync('userlist.json', backup_file);
	userlist = [];
	save_userlist();
}


if (fs.existsSync('userlist.json')) {
	userlist = JSON.parse(fs.readFileSync('userlist.json', { encoding: 'utf8' }));
} else {
	save_userlist();
}

let history = [];

const save_history = () => fs.writeFileSync('history.json', JSON.stringify(history, null, 4), { encoding: 'utf8' });

if (fs.existsSync('history.json')) {
	history = JSON.parse(fs.readFileSync('history.json', { encoding: 'utf8' }));
} else {
	save_history();
}

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/', (req, res) => {
	console.log( req.body );
	if (req.body) {
		if (req.body.user && req.body.tickets) {
			const user_data = {
                user: req.body.user,
                tickets: parseInt(req.body.tickets)
            };
			const idx = userlist.findIndex( v => v.user === user_data.user );
			if (idx > -1) {
				userlist[idx].tickets +=  user_data.tickets;
			} else {
				userlist.push(user_data);
			}
			save_userlist();
            res.sendStatus(200);
		}
	}
	
});

let free_tickets = 0;

app.post('/free_tickets', (req, res) => {
	console.log( req.body );
	if (req.body) {
		if (req.body.value) {
			free_tickets += parseInt(req.body.value);
            res.send(JSON.stringify(free_tickets, null, 4));
		} else if (req.body.get_value) {
			res.send(JSON.stringify(free_tickets, null, 4));
		}
	}
	
});

app.post('/history', (req, res) => {
    res.send(JSON.stringify(history, null, 4));
});

app.post('/users', (req, res) => {
    res.send(JSON.stringify(userlist, null, 4));
});

const roll = (tickets) => {
	function shuffle_array(array) {
		for (let i = array.length - 1; i >= 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	}

	let members = [];
	userlist.forEach( v => {
		for (let i = 0; i < v.tickets; i++) {
			members.push( v.user );
		}
	});

	for (let i = 0; i < 100; i++) {
		shuffle_array(members);
	}

	const shuffle_list = members.slice();
	console.log(shuffle_list);

	const winner = members.shift();
	console.log(winner);

	let idx = userlist.findIndex( v => v.user === winner );
	if (idx > -1) {
        userlist[idx].tickets -= tickets;
		if (userlist[idx].tickets < 0) {
			userlist.splice(idx, 1);
			console.log('У участника не осталось билетов, убираем из списка')
        }
        save_userlist();
    }
	return { winner, shuffle_list };
}

app.post('/roll', (req, res) => {
	console.log( req.body );
	const roll_tickets = req.body.roll_tickets;
	let winner = null;
	let shuffle_list = null;
	let end = false;

	let total_tickets = userlist.reduce((sum, user) => sum + user.tickets, 0);
	let total_with_free = total_tickets + free_tickets;

	if (free_tickets > 0) {
		const spend_tickets = free_tickets - roll_tickets;
		if (spend_tickets >= 0) {
            free_tickets = spend_tickets;
        } else {
            free_tickets = 0;
			let result = roll(Math.abs(spend_tickets));
			winner = result.winner;
			shuffle_list = result.shuffle_list;

        }
	} else {
		let result = roll(roll_tickets);
		winner = result.winner;
		shuffle_list = result.shuffle_list;
	}

	if (total_with_free > roll_tickets) {
		end = false;
	} else {
		end = true;
		backup_userlist();
	}

	history.unshift({ winner, roll_tickets, shuffle_list, end, date: new Date().valueOf() });
	save_history();

    res.send(JSON.stringify({ winner, end, shuffle_list }, null, 4));
});

app.listen(3333)