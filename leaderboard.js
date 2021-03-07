const fetch = require('node-fetch');
const cheerio = require('cheerio');

const YEAR = 2021;
const HOSTUSER = 'lb_discord';
const URI = 'https://letterboxd.com/';
const _OMITTED = [];

async function
getusers()
{
	let users = [];
	let p = HOSTUSER + '/followers/';

	while (p) {
		let res;
		let body;
		let $;

		res = await fetch(URI + p);
		body = await res.text();
		$ = cheerio.load(body);
		users = users.concat($('.person-summary .name').map(function(_, e) { return $(e).attr('href').slice(1, -1); }).get());

		p = $('.paginate-nextprev:not(.paginate-disabled) .next')?.attr('href');
	}
	return users; /* .filter(u => !OMITTED.includes(u)) */
}

async function
gethours(u)
{
	let res;
	let body;
	let $;

	res = await fetch(URI + u + '/year/' + YEAR + '/',
			  { redirect: 'manual' });
	if (!res.ok)
		return -res.status;
	body = await res.text();
	$ = cheerio.load(body);
	return Number($('.statistic:contains("Hours") .value').text().replace(',', ''));
}

async function
main()
{
	let leaderboard = [];
	let users;
	let i = 0;

	users = await getusers();
	for (; i < users.length; i++)
		leaderboard.push({ u: users[i], h: await gethours(users[i]) });
	leaderboard.sort((a, b) => { return b.h - a.h; });
	console.log(leaderboard);
}

main();
