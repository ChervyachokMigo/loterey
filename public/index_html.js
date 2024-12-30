const ticket_price = 25;
const roll_tickets = 18;
let free_tickets = 0;

function update_table (users) {
	const users_data = JSON.parse(users);

    users_data.sort((a, b) => b.tickets - a.tickets);

	//всего билетов
	let total_tickets = users_data.reduce((sum, user) => sum + user.tickets, 0);
	let total_with_free = total_tickets + free_tickets;

	//add percent by user
	users_data.forEach((user, index) => {
        let percent = ((user.tickets / total_tickets) * 100).toFixed(2);
        users_data[index].percent = percent;
    });

	$('.output').html('');
	
	//create header
	$('.output').append('<div class="header"><div>Участник</div><div>Билетов</div><div>Шанс</div></div>');

    //add percent by user row
    users_data.forEach(({ user, tickets, percent }) => {
        $('.output').append(`<div class="user_row"><div>${user}</div><div>${tickets} = ${ticket_price * tickets} руб.</div><div>${percent}%</div></div>`);
    });

    //add total tickets row
    $('.output').append(`<div class="total_tickets_row"><div>Всего билетов: ${total_with_free} = ${ticket_price * total_with_free} руб.</div></div>`);
	const need_tickets = roll_tickets - total_with_free % roll_tickets;
	let roll_available = Math.trunc(total_with_free / roll_tickets);

	if (need_tickets !== roll_tickets) {
		roll_available++;
		$('.output').append(`<div class="total_tickets_row"><div>Для следующей крутки нужно: ${1 + need_tickets} = ${ticket_price * (1 + need_tickets)} руб.</div></div>`);
	} else {
		$('.output').append(`<div class="total_tickets_row"><div>Для следующей крутки нужно: ${1} = ${ticket_price * 1} руб.</div></div>`);
	}

    $('.output').append(`<div class="total_tickets_row"><div>Доступно круток: ${roll_available} шт.</div></div>`);
	if (roll_available > 0) {
		$('#roll_button').removeClass('disabled');
	} else {
		$('#roll_button').addClass('disabled');
	}
}

function get_users () {
	$.post({
		url: 'http://localhost:3333/users',
		type: 'POST',
		success: function (res) {
            update_table(res);
		}
	})
}

function add () {
	let user = document.getElementById('name').value.trim();
	let tickets = parseInt(document.getElementById('tickets').value.trim());
	$.post({
		url: 'http://localhost:3333/',
		type: 'POST',
		data: { user, tickets },
		success: function (response) {
            document.getElementById('name').value = '';
            document.getElementById('tickets').value = '';
			get_users();
		}
	})
}

function update_free_tickets (val) {
	free_tickets = JSON.parse(val);
	
	$('.output_2').html('');
	$('.output_2').append(`<div>Бесплатных билетов: ${free_tickets} = ${ticket_price * free_tickets} руб.</div>`);
	get_users();
}

function get_free_tickets () {
	$.post({
        url: 'http://localhost:3333/free_tickets',
        type: 'POST',
		data: {get_value: true},
        success: function (response) {
            update_free_tickets(response);
        }
    })
}


function add_tickets () {
	let free_tickets = parseInt(document.getElementById('free_tickets').value.trim());
	$.post({
		url: 'http://localhost:3333/free_tickets',
		type: 'POST',
		data: { value: free_tickets },
		success: function (response) {
			update_free_tickets(response);
		}
	})
}


function calc (e) {
	$('.input_4_output').html( `${e.value} руб. = ${Math.trunc(e.value / 25)} билета`);
}

//format date from ms
function formatDate (ms) {
	let date = new Date(ms);
	let options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
	return date.toLocaleString('ru', options);
}


//get history
function get_history () {
    $.post({
        url: 'http://localhost:3333/history',
        type: 'POST',
        success: function (response) {
            let history = JSON.parse(response);
            $('.history').html('');
            history.forEach((v) => {
				const { winner, roll_tickets, shuffle_list, end, date } = v;
				console.log(shuffle_list)
                $('.history').append(`<div class="row">
					<div class="date">Дата: ${formatDate(date)}</div>
					<div class="winner">Победитель: ${winner}</div>
					<div class="shuffle_list"><div>Билеты:</div><div>${shuffle_list}</div></div>
				</div>`);
            });
        }
    })
}

function roll () {
	$.post({
        url: 'http://localhost:3333/roll',
        type: 'POST',
		data: { roll_tickets: roll_tickets },
        success: function (result) {
			let { winner, end, shuffle_list } = JSON.parse(result);
			console.log('result', result)
			$('.winner').html('');
			$('.winner').append(`<div class="text_name"><div class="text">Победитель:</div><div class="name">${winner}</div></div></div>`);
			$('.winner').append(`<div><div class="tickets_roll">Билеты участников:</div><div>${shuffle_list.join(', ')}</div></div>`);
            if (end) {
				$('.winner').append(`<div class="text">Розыгрыш окончен.</div>`);
			}
			get_users();
			get_free_tickets();
			get_history();
        }
    })
}