const tickets = [
	1, 3, 1
];

const roll_tickets = 18; 
const free_tickets = 15;

const total_tickets_count = tickets.reduce( ( a, b ) => a + b , 0);
console.log(total_tickets_count);

const rolls = 3;

const win_chances = [];

for (let count of tickets) {
	let chance = 1;
	for (let i = 0; i < rolls; i++ ) {
		chance = (count ) / total_tickets_count;
	}
	win_chances.push(chance);
}

console.log(win_chances);