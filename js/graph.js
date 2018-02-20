/*
 * Draws the graph
 */

function Graph(maxCrops) {
	// Prepare variables.

	var svgWidth = 1080;
	var svgHeight = 480;

	var width = svgWidth - 64;
	var height = (svgHeight - 56) / 2;
	var barOffsetX = 56;
	var barOffsetY = 40;

	// Prepare web elements.
	var svg = d3.select("div.graph")
		.append("svg")
		.attr("width", svgWidth)
		.attr("height", svgHeight)
		.style("background-color", "#333333")
		.style("border-radius", "8px");

	svg.append("g")
		.append("text")
			.attr("class", "axis")
			.attr("x", 48)
			.attr("y", 24)
			.style("text-anchor", "end")
			.text("Profit");

	var tooltip = d3.select("body")
		.append("div")
		.style("position", "absolute")
		.style("z-index", 10)
		.style("visibility", "hidden")
		.style("background", "rgb(0, 0, 0)")
		.style("background", "rgba(0, 0, 0, 0.75)")
		.style("padding", "8px")
		.style("border-radius", "8px")
		.style("border", "2px solid black");	

	var gAxis = svg.append("g");
	var gProfit = svg.append("g");
	var gSeedLoss = svg.append("g");
	var gFertLoss = svg.append("g");
	var gIcons = svg.append("g");
	var gTooltips = svg.append("g");

	var axisY;

	/*
	 * Formats a specified number, adding separators for thousands.
	 * @param num The number to format.
	 * @return Formatted string.
	 */
	function formatNumber(num) {
		num = num.toFixed(2) + '';
		var x = num.split('.');
		var x1 = x[0];
		var x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		return x1 + x2;
	}

	/*
	 * Gets the maximum absolute height of bars for a specific data point,
	 * rounded up to a multiple of 100.
	 */
	function getRoundedAbsoluteHeight(d, options) {
		var height = d.drawProfit;
		if (height < 0)
			height = -height;
		if (options.buySeed && -d.drawSeedLoss > height)
			height = -d.drawSeedLoss;
		if (options.buyFert && -d.drawFertLoss > height)
			height = -d.drawFertLoss;
		return (~~((height + 99) / 100) * 100);
	}

	/*
	 * Updates the X and Y D3 scale.
	 */
	function GraphHelper(cropList, options) {
		var graphHelper = this;

		var barPadding = 4;
		var barSpacing = width / maxCrops;
		var barWidth = barSpacing - barPadding;
		var miniBarWidth = barWidth / 8;

		var scale_x = d3.scale.ordinal()
			.domain(d3.range(maxCrops))
			.rangeRoundBands([0, width]);
		var scale_y = d3.scale.linear()
			.domain([0, d3.max(cropList, function (d) {
				return getRoundedAbsoluteHeight(d, options);
			})])
			.range([height, 0]);

		var ax = updateScaleAxis(cropList, options);

		this.yAxis = d3.svg.axis()
			.scale(ax)
			.orient("left")
			.tickFormat(d3.format(",s"))
			.ticks(16);

		var numMiniBars = 0;
		if (options.buySeed)
			numMiniBars++;
		if (options.buyFert)
			numMiniBars++;

		this.setGraphSize = function () {
			svg.attr("width", barOffsetX + barPadding * 2 + (barSpacing) * cropList.length);
			d3.select(".graph").attr("width", barOffsetX + barPadding * 2 + (barSpacing) * cropList.length);
		}

		this.configBarsProfit = function (target) {
			(target
				.attr("x", function(d, i) { 
					return scale_x(i) + barOffsetX + miniBarWidth * numMiniBars;
				})
				.attr("y", function(d) { 
					if (d.drawProfit >= 0)
						return scale_y(d.drawProfit) + barOffsetY;
					else 
						return height + barOffsetY;
				})
				.attr("height", function(d) { 
					if (d.drawProfit >= 0)
						return height - scale_y(d.drawProfit);
					else 
						return height - scale_y(-d.drawProfit);
				})
				.attr("width", function(d) { 
					return barWidth - miniBarWidth * numMiniBars;
				})
				.attr("fill", function (d) {
					if (d.drawProfit >= 0)
						return "lime";
					else
						return "red";
				})
			);
		};
		
		this.configBarsSeed = function (target) {
			(target
				.attr("x", function(d, i) { return scale_x(i) + barOffsetX; })
				.attr("y", height + barOffsetY)
				.attr("height", function(d) { 
					if (options.buySeed)
						return height - y(-d.drawSeedLoss); 
					else
						return 0;
				})
				.attr("width", miniBarWidth)
				.attr("fill", "orange")
			);
		};
		
		this.configBarsFert = function (target) {
			(target
				.attr("x", function(d, i) { 
					if (options.buySeed)
						return scale_x(i) + barOffsetX + miniBarWidth; 
					else
						return scale_x(i) + barOffsetX; 
				})
				.attr("y", height + barOffsetY)
				.attr("height", function(d) { 
					if (options.buyFert)
						return height - scale_y(-d.drawFertLoss); 
					else
						return 0;
				})
				.attr("width", miniBarWidth)
				.attr("fill", "brown")
			);
		};
		
		this.configIcons = function (target) {
			(target
				.attr("x", function(d, i) { return scale_x(i) + barOffsetX; })
				.attr("y", function(d) { 
					if (d.drawProfit >= 0)
						return scale_y(d.drawProfit) + barOffsetY - barSpacing;
					else 
						return height + barOffsetY - barSpacing;
				})
				.attr('width', barWidth)
				.attr('height', barWidth)
				.attr("xlink:href", function(d) { return "img/" + d.info.img; })
			);
		};
		
		/* Set size of the mouseover target that triggers tooltips */
		this.configTooltips = function (target) {
			(target
				.attr("x", function(d, i) { return scale_x(i) + barOffsetX - barPadding/2; })
				.attr("y", function(d) {
					var base;
					if (d.drawProfit >= 0)
						base = scale_y(d.drawProfit);
					else 
						base = height;
					return base + barOffsetY - barSpacing;
				})
				.attr("height", function(d) { 
					var base;
					if (d.drawProfit >= 0)
						base = scale_y(d.drawProfit);
					else 
						base = height;

					var topHeight = height + barSpacing - base;

					var biggestLoss = 0;
					if (options.buySeed && d.drawSeedLoss < biggestLoss)
						biggestLoss = d.drawSeedLoss;
					if (options.buyFert && d.drawFertLoss < biggestLoss)
						biggestLoss = d.drawFertLoss;
					if (d.drawProfit < biggestLoss)
						biggestLoss = d.drawProfit;

					return topHeight + (height - scale_y(-biggestLoss));
				})
				.attr("width", barSpacing)
			);
		};
		
	}

	/*
	 * Updates the axis D3 scale.
	 * @return The new scale.
	 */
	function updateScaleAxis(cropList, options) {
		return d3.scale.linear()
			.domain([
				-d3.max(cropList, function (d) {
					return getRoundedAbsoluteHeight(d, options);
				}),
				d3.max(cropList, function (d) {
					return getRoundedAbsoluteHeight(d, options);
				})])
			.range([height*2, 0]);
	}

	function drawTooltip(d, tooltip, options) {
		tooltip.selectAll("*").remove();
		tooltip.style("visibility", "visible");

		tooltip.append("h3").attr("class", "tooltipTitle").text(d.name);

		var tooltipTable = tooltip.append("table")
			.attr("class", "tooltipTable")
			.attr("cellspacing", 0);
		var tooltipTr;
		

		tooltipTr = tooltipTable.append("tr");
		tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Total profit:");
		if (d.profit > 0)
			tooltipTr.append("td").attr("class", "tooltipTdRightPos").text("+" + formatNumber(d.profit))
				.append("div").attr("class", "gold");
		else
			tooltipTr.append("td").attr("class", "tooltipTdRightNeg").text(formatNumber(d.profit))
				.append("div").attr("class", "gold");

		tooltipTr = tooltipTable.append("tr");
		tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Profit per day:");
		if (d.averageProfit > 0)
			tooltipTr.append("td").attr("class", "tooltipTdRightPos").text("+" + formatNumber(d.averageProfit))
				.append("div").attr("class", "gold");
		else
			tooltipTr.append("td").attr("class", "tooltipTdRightNeg").text(formatNumber(d.averageProfit))
				.append("div").attr("class", "gold");

		if (options.buySeed) {
			tooltipTr = tooltipTable.append("tr");
			tooltipTr.append("td").attr("class", "tooltipTdLeftSpace").text("Total seed loss:");
			tooltipTr.append("td").attr("class", "tooltipTdRightNeg").text(formatNumber(d.seedLoss))
				.append("div").attr("class", "gold");

			tooltipTr = tooltipTable.append("tr");
			tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Seed loss per day:");
			tooltipTr.append("td").attr("class", "tooltipTdRightNeg").text(formatNumber(d.averageSeedLoss))
				.append("div").attr("class", "gold");
		}

		if (options.buyFert) {
			tooltipTr = tooltipTable.append("tr");
			tooltipTr.append("td").attr("class", "tooltipTdLeftSpace").text("Total fertilizer loss:");
			tooltipTr.append("td").attr("class", "tooltipTdRightNeg").text(formatNumber(d.fertLoss))
				.append("div").attr("class", "gold");

			tooltipTr = tooltipTable.append("tr");
			tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Fertilizer loss per day:");
			tooltipTr.append("td").attr("class", "tooltipTdRightNeg").text(formatNumber(d.averageFertLoss))
				.append("div").attr("class", "gold");
		}


		tooltipTr = tooltipTable.append("tr");
		tooltipTr.append("td").attr("class", "tooltipTdLeftSpace").text("Produce sold:");
		switch (options.produce) {
			case 0: tooltipTr.append("td").attr("class", "tooltipTdRight").text("Raw crops"); break;
			case 1: 
				if (d.produce.jar > 0)
					tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.info.produce.jarType);
				else
					tooltipTr.append("td").attr("class", "tooltipTdRightNeg").text("None");
				break;
			case 2:
				if (d.produce.keg > 0)
					tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.info.produce.kegType);
				else
					tooltipTr.append("td").attr("class", "tooltipTdRightNeg").text("None");
				break;
		}
		tooltipTr = tooltipTable.append("tr");
		tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Duration:");
		tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.duration + " days");
		tooltipTr = tooltipTable.append("tr");
		tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Harvests:");
		tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.harvests);

		if (options.extra) {

			tooltip.append("h3").attr("class", "tooltipTitleExtra").text("Crop info");
			tooltipTable = tooltip.append("table")
				.attr("class", "tooltipTable")
				.attr("cellspacing", 0);

			tooltipTr = tooltipTable.append("tr");
			tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Value (Normal):");
			tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.info.produce.rawN)
				.append("div").attr("class", "gold");
			tooltipTr = tooltipTable.append("tr");
			tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Value (Silver):");
			tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.info.produce.rawS)
				.append("div").attr("class", "gold");
			tooltipTr = tooltipTable.append("tr");
			tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Value (Gold):");
			tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.info.produce.rawG)
				.append("div").attr("class", "gold");
			tooltipTr = tooltipTable.append("tr");
			if (d.info.produce.jar > 0) {
				tooltipTr.append("td").attr("class", "tooltipTdLeftSpace").text("Value (" + d.info.produce.jarType + "):");
				tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.info.produce.jar)
				.append("div").attr("class", "gold");
			}
			else {
				tooltipTr.append("td").attr("class", "tooltipTdLeftSpace").text("Value (Jar):");
				tooltipTr.append("td").attr("class", "tooltipTdRight").text("None");
			}
			tooltipTr = tooltipTable.append("tr");
			if (d.info.produce.keg > 0) {
				tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Value (" + d.info.produce.kegType + "):");
				tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.info.produce.keg)
				.append("div").attr("class", "gold");
			}
			else {
				tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Value (Keg):");
				tooltipTr.append("td").attr("class", "tooltipTdRight").text("None");
			}


			var first = true;
			if (d.info.seeds.pierre > 0) {
				tooltipTr = tooltipTable.append("tr");
				tooltipTr.append("td").attr("class", "tooltipTdLeftSpace").text("Seeds (Pierre):");
				first = false;
				tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.info.seeds.pierre)
				.append("div").attr("class", "gold");
			}
			if (d.info.seeds.joja > 0) {
				tooltipTr = tooltipTable.append("tr");
				if (first) {
					tooltipTr.append("td").attr("class", "tooltipTdLeftSpace").text("Seeds (Joja):");
					first = false;
				}
				else
					tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Seeds (Joja):");
				tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.info.seeds.joja)
				.append("div").attr("class", "gold");
			}
			if (d.info.seeds.special > 0) {
				tooltipTr = tooltipTable.append("tr");
				if (first) {
					tooltipTr.append("td").attr("class", "tooltipTdLeftSpace").text("Seeds (Special):");
					first = false;
				}
				else
					tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Seeds (Special):");
				tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.info.seeds.special)
				.append("div").attr("class", "gold");
				tooltipTr = tooltipTable.append("tr");
				tooltipTr.append("td").attr("class", "tooltipTdLeft").text("");
				tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.info.seeds.specialLoc);
			}

			tooltipTr = tooltipTable.append("tr");
			tooltipTr.append("td").attr("class", "tooltipTdLeftSpace").text("Time to grow:");
			tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.info.growth.initial + " days");
			tooltipTr = tooltipTable.append("tr");
			tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Time to regrow:");
			if (d.info.growth.regrow > 0)
				tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.info.growth.regrow + " days");
			else
				tooltipTr.append("td").attr("class", "tooltipTdRight").text("N/A");
			if (d.info.produce.extra > 0) {
				tooltipTr = tooltipTable.append("tr");
				tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Extra produce:");
				tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.info.produce.extra);
				tooltipTr = tooltipTable.append("tr");
				tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Extra chance:");
				tooltipTr.append("td").attr("class", "tooltipTdRight").text((d.info.produce.extraPerc * 100) + "%");
			}
		}
	}

	/*
	 * Renders the graph.
	 * This is called only when opening for the first time or when changing seasons/seeds.
	 */
	function render(cropList, options) {
		var graphHelper = new GraphHelper(cropList, options);

		graphHelper.setGraphSize();

		axisY = gAxis.attr("class", "axis")
			.call(graphHelper.yAxis)
			.attr("transform", "translate(48, " + barOffsetY + ")");

		var barsProfit = gProfit.selectAll("rect")
			.data(cropList)
			.enter()
			.append("rect");
		graphHelper.configBarsProfit(barsProfit);

		var barsSeed = gSeedLoss.selectAll("rect")
			.data(cropList)
			.enter()
			.append("rect");
		graphHelper.configBarsSeed(barsSeed);

		var barsFert = gFertLoss.selectAll("rect")
			.data(cropList)
			.enter()
			.append("rect");	
		graphHelper.configBarsFert(barsFert);

		var imgIcons = gIcons.selectAll("image")
			.data(cropList)
			.enter()
			.append("svg:image");
		graphHelper.configIcons(imgIcons);

		var barsTooltips = gTooltips.selectAll("rect")
			.data(cropList)
			.enter()
			.append("rect")
				.attr("opacity", "0")
				.attr("cursor", "pointer")
				.on("mouseover", function(d) { 
					drawTooltip(d, tooltip, options);
				})
				.on("mousemove", function() { 
					tooltip.style("top", (d3.event.pageY - 16) + "px").style("left",(d3.event.pageX + 20) + "px");
				})
				.on("mouseout", function() { tooltip.style("visibility", "hidden"); })
				.on("click", function(d) { window.open(d.url, "_blank"); });
		graphHelper.configTooltips(barsTooltips);
	}

	/*
	 * Updates the already rendered graph, showing animations.
	 */
	this.update = function (cropList, options) {
		var graphHelper = new GraphHelper(cropList, options);

		axisY.transition()
			.call(graphHelper.yAxis);

		graphHelper.configBarsProfit(gProfit.selectAll("rect").data(cropList).transition());
		graphHelper.configBarsSeed(gSeedLoss.selectAll("rect").data(cropList).transition());
		graphHelper.configBarsFert(gFertLoss.selectAll("rect").data(cropList).transition());
		graphHelper.configIcons(gIcons.selectAll("image").data(cropList).transition());
		graphHelper.configTooltips(gTooltips.selectAll("rect").data(cropList).transition());
	}

	this.initialRender = function (cropList, options) {
		render(cropList, options);
	}

	this.rerender = function (cropList, options) {
		gAxis.selectAll("*").remove();
		gProfit.selectAll("*").remove();
		gSeedLoss.selectAll("*").remove();
		gFertLoss.selectAll("*").remove();
		gIcons.selectAll("*").remove();
		gTooltips.selectAll("*").remove();
		
		render(cropList, options);
	}
}
