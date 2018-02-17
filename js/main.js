
var graph = new Graph(seasons[3].crops.length);

/*
 * Gets all options, based on the options set in the HTML.
 */
function getOptions() {
	// Options used to draw the graph.
	var options = {
		"produce" : 0,
		"planted": 1,
		"days": 28,
		"fertilizer": 2,
		"level": 0,
		"season": 3,
		"buySeed": false,
		"buyFert": false,
		"average": false,
		"seeds": {
			"pierre": true,
			"joja": true,
			"special": true
		},
		"skills": {
			"till": false,
			"agri": false,
			"arti": false
		},
		"extra": false
	};

	options.season = parseInt(document.getElementById('select_season').value);

	if (options.season != 3) {
		document.getElementById('current_day_row').style.display = 'table-row';
		document.getElementById('number_days_row').style.display = 'none';
		document.getElementById('cross_season_row').style.display = 'table-row';

		if (document.getElementById('current_day').value <= 0)
			document.getElementById('current_day').value = 1;
		if (document.getElementById('current_day').value > 28 && options.season != 3)
			document.getElementById('current_day').value = 28;
		options.days = 29 - document.getElementById('current_day').value;
	} else {
		document.getElementById('current_day_row').style.display = 'none';
		document.getElementById('number_days_row').style.display = 'table-row';
		document.getElementById('cross_season_row').style.display = 'none';

		if (document.getElementById('number_days').value > 100000 && options.season == 3)
			document.getElementById('number_days').value = 100000;
		options.days = document.getElementById('number_days').value;
	}

	options.produce = parseInt(document.getElementById('select_produce').value);

	if (document.getElementById('number_planted').value <= 0)
		document.getElementById('number_planted').value = 1;
	options.planted = document.getElementById('number_planted').value;

	options.average = document.getElementById('check_average').checked;

	options.crossSeason = document.getElementById('cross_season').checked;

	options.seeds.pierre = document.getElementById('check_seedsPierre').checked;
	options.seeds.joja = document.getElementById('check_seedsJoja').checked;
	options.seeds.special = document.getElementById('check_seedsSpecial').checked;

	options.buySeed = document.getElementById('check_buySeed').checked;

	options.fertilizer = parseInt(document.getElementById('select_fertilizer').value);

	options.buyFert = document.getElementById('check_buyFert').checked;

	if (document.getElementById('number_level').value < 0)
		document.getElementById('number_level').value = 0;
	if (document.getElementById('number_level').value > 10)
		document.getElementById('number_level').value = 10;
	options.level = document.getElementById('number_level').value;

	if (options.level >= 5) {
		document.getElementById('check_skillsTill').disabled = false;
		document.getElementById('check_skillsTill').style.cursor = "pointer";
		options.skills.till = document.getElementById('check_skillsTill').checked;
	}
	else {
		document.getElementById('check_skillsTill').disabled = true;
		document.getElementById('check_skillsTill').style.cursor = "default";
		document.getElementById('check_skillsTill').checked = false;
	}

	if (options.level == 10 && options.skills.till) {
		document.getElementById('select_skills').disabled = false;
		document.getElementById('select_skills').style.cursor = "pointer";
	}
	else {
		document.getElementById('select_skills').disabled = true;
		document.getElementById('select_skills').style.cursor = "default";
		document.getElementById('select_skills').value = 0;
	}
	if (document.getElementById('select_skills').value == 1) {
		options.skills.agri = true;
		options.skills.arti = false;
	}
	else if (document.getElementById('select_skills').value == 2) {
		options.skills.agri = false;
		options.skills.arti = true;
	}
	else {
		options.skills.agri = false;
		options.skills.arti = false;
	}

	options.extra = document.getElementById('check_extra').checked;
	return options;
}

/*
 * Called once on startup to draw the UI.
 */
function initial() {
	var options = getOptions();
	var cropList = valueCrops(options);
	graph.initialRender(cropList, options);
}

/*
 * Called on every option change to animate the graph.
 */
function refresh() {
	var options = getOptions();
	var cropList = valueCrops(options);
	graph.update(cropList, options);
}

/*
 * Called when changing season/seeds, to redraw the graph.
 */
function rebuild() {
	var options = getOptions();
	var cropList = valueCrops(options);
	graph.rerender(cropList, options);
}

initial();
