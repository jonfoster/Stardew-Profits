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
						return height - scale_y(-d.drawSeedLoss); 
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

		tooltip.append("h3").attr("class", "tooltipTitle").text(d.info.name);

		var tooltipTable = tooltip.append("table")
			.attr("class", "tooltipTable")
			.attr("cellspacing", 0);
		var tooltipTr;

		function addRow(leftClassSuffix, rightClassSuffix, isGold, leftText, rightText) {
			var tooltipTr = tooltipTable.append("tr");
			tooltipTr.append("td").attr("class", "tooltipTdLeft" + leftClassSuffix).text(leftText);
			var row2 = tooltipTr.append("td").attr("class", "tooltipTdRight" + rightClassSuffix).text(rightText);
			if (isGold)
				row2.append("div").attr("class", "gold");
		}

		function addRowPosNegGold(leftClassSuffix, leftText, value) {
			if (value > 0)
				addRow(leftClassSuffix, "Pos", true, leftText, "+" + formatNumber(value));
			else
				addRow(leftClassSuffix, "Neg", true, leftText, formatNumber(value));
		}

		addRowPosNegGold("", "Total profit:", d.profit);
		addRowPosNegGold("", "Profit per day:", d.averageProfit);

		if (options.buySeed) {
			addRowPosNegGold("Space", "Total seed loss:", d.seedLoss);
			addRowPosNegGold("", "Seed loss per day:", d.averageSeedLoss);
		}

		if (options.buyFert) {
			addRowPosNegGold("Space", "Total fertilizer loss:", d.fertLoss);
			addRowPosNegGold("", "Fertilizer loss per day:", d.averageFertLoss);
		}

		var produceType;
		switch (d.produce) {
			case 0: produceType = "Raw crops"; break;
			case 1: 
				if (d.info.produce.jar > 0)
					produceType = d.info.produce.jarType;
				break;
			case 2:
				if (d.info.produce.keg > 0)
					produceType = d.info.produce.kegType;
				break;
		}
		if (produceType)
			addRow("Space", "", false, "Produce sold:", produceType);
		else
			addRow("Space", "Neg", false, "Produce sold:", "None");
		addRow("", "", false, "Duration:", d.duration + " days");
		addRow("", "", false, "Harvests:", d.harvests);

		if (options.extra) {

			tooltip.append("h3").attr("class", "tooltipTitleExtra").text("Crop info");
			tooltipTable = tooltip.append("table")
				.attr("class", "tooltipTable")
				.attr("cellspacing", 0);

			var rawMultiplier = (options.skills.till ? 1.1 : 1);

			addRow("", "", true, "Value (Normal):", formatNumber(d.info.produce.rawN * rawMultiplier));
			addRow("", "", true, "Value (Silver):", formatNumber(d.info.produce.rawS * rawMultiplier));
			addRow("", "", true, "Value (Gold):", formatNumber(d.info.produce.rawG * rawMultiplier));
			addRow("", "", true, "Value (Average):", formatNumber(d.sellPriceRaw));
			if (d.info.produce.jar > 0) {
				addRow("Space", "", true, "Value (" + d.info.produce.jarType + "):", formatNumber(d.sellPriceJar));
			}
			else {
				addRow("Space", "", false, "Value (Jar):", "None");
			}
			if (d.info.produce.keg > 0) {
				addRow("", "", true, "Value (" + d.info.produce.kegType + "):", formatNumber(d.sellPriceKeg));
			}
			else {
				addRow("", "", false, "Value (Keg):", "None");
			}

			var spaceIfFirst = "Space";
			if (d.info.seeds.pierre > 0) {
				addRow(spaceIfFirst, "", true, "Seeds (Pierre):", d.info.seeds.pierre);
				spaceIfFirst = "";
			}
			if (d.info.seeds.joja > 0) {
				addRow(spaceIfFirst, "", true, "Seeds (Joja):", d.info.seeds.joja);
				spaceIfFirst = "";
			}
			if (d.info.seeds.special > 0) {
				addRow(spaceIfFirst, "", true, "Seeds (Special):", d.info.seeds.special);
				spaceIfFirst = "";
				addRow("", "", false, "", d.info.seeds.specialLoc);
			}

			addRow("Space", "", false, "Time to grow:", d.info.growth.initial + " days");
			if (d.info.growth.regrow > 0)
				addRow("", "", false, "Time to regrow:", d.info.growth.regrow + " days");
			else
				addRow("", "", false, "Time to regrow:", "N/A");
			if (d.info.produce.extra > 0) {
				addRow("", "", false, "Extra produce:", d.info.produce.extra);
				addRow("", "", false, "Extra chance:", (d.info.produce.extraPerc * 100) + "%");
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
				.on("click", function(d) { window.open(d.info.url, "_blank"); });
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
