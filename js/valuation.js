/*
 * Calculates crop valuation
 *
 * Requires: crops.js, data.js
 */

valueCrops = (function() {
	/*
	 * Check if the crop is allowed in a season
	 *
	 * @param cropInfo The information about the crop.
	 * @return Boolean
	 */
	function isCropInSeason(cropInfo, season) {
		for (var j = 0; j < seasons[i].crops.length; j++) {
			var seasonCrop = seasons[i].crops[j];
			if (cropInfo.name == seasonCrop.name) {
				return true;
			}
		}
		return false;
	}

	/*
	 * Check if the crop is cross season and get number of extra seasons
	 *
	 * @param cropInfo The information about the crop.
	 * @param startSeason The initial season.
	 * @return Integer count of extra seasons, 0-2.
	 */
	function numExtraSeasons(cropInfo, startSeason) {
		var numSeasons = 0;
		for (var season = startSeason + 1; season < 3; season++) {
			if (!isCropInSeason(cropInfo, season)) {
				break;
			}
			numSeasons++;
		}
		return numSeasons;
	}

	/*
	 * Calculates the maximum number of harvests for a crop, specified days, season, etc.
	 * @param cropInfo The information about the crop.
	 * @return Object containing: harvests - Number of harvests for the specified crop; duration - duration to grow the crop and make the specified number of harvests
	 */
	function harvests(cropInfo, options) {
		var fertilizer = fertilizers[options.fertilizer];

		// if the crop is cross season, add 28 extra days for each extra season
		var remainingDays = options.days;
		if (options.crossSeason) {
			remainingDays += 28 * numExtraSeasons(cropInfo, options.season);
		}

		// console.log("=== " + cropInfo.name + " ===");

        var daysToGrow;

		if (options.skills.agri)
			daysToGrow = Math.floor(cropInfo.growth.initial * (fertilizer.growth - 0.1));
		else
			daysToGrow = Math.floor(cropInfo.growth.initial * fertilizer.growth);

		var harvests = 0;
		var duration = 0;
		var nextHarvestDay = 1 + daysToGrow;

		while (nextHarvestDay <= remainingDays) {
			harvests++;
			duration = nextHarvestDay;

			if (cropInfo.growth.regrow > 0) {
				// console.log("Harvest on day: " + day);
				nextHarvestDay += cropInfo.growth.regrow;
			}
			else {
				// console.log("Harvest on day: " + day);
				nextHarvestDay += daysToGrow;
			}
		} 

		/* Find the cheapest place to buy the seeds */
		var seedCost = null;
		if (cropInfo.seeds.pierre != 0 && options.seeds.pierre)
			seedCost = cropInfo.seeds.pierre;
		if (cropInfo.seeds.joja != 0 && options.seeds.joja)
			if (seedCost === null || seedCost > cropInfo.seeds.joja)
				seedCost = cropInfo.seeds.joja;
		if (cropInfo.seeds.special != 0 && options.seeds.special)
			if (seedCost === null || seedCost > cropInfo.seeds.special)
				seedCost = cropInfo.seeds.special;

		if (cropInfo.growth.regrow == 0 && cropInfo.harvests > 0)
			seedCost *= harvests;

		var extraItems = cropInfo.produce.extraPerc * cropInfo.produce.extra * harvests;

		// Find selling price

		var percentG = qualityPercentages.gold[fertilizer.qualityLevel][options.level];
		var percentS = qualityPercentages.silver[fertilizer.qualityLevel][options.level];
		var ratioG = percentG / 100;
		var ratioS = ((100 - percentG) * percentS) / 10000;
		// This formula is carefully written to avoid loss of precision due to
		// subtracting small numbers.  Otherwise it comes up with values
		// larger than rawG when dealing with good fertilizer and high skill levels.
		var sellPriceRaw = (
			cropInfo.produce.rawN +
			(cropInfo.produce.rawS - cropInfo.produce.rawN) * ratioS +
			(cropInfo.produce.rawG - cropInfo.produce.rawN) * ratioG);

		if (options.skills.till) {
			sellPriceRaw *= 1.1;
		}

		var sellPriceJar = cropInfo.produce.jar;
		var sellPriceKeg = cropInfo.produce.keg;
		if (options.skills.arti) {
			sellPriceJar *= 1.4;
			sellPriceKeg *= 1.4;
		}

		var totalItems = (harvests + extraItems) * options.planted;

		var produce = -1;
		var sellPrice = 0;
        
        if (options.produce.raw && sellPrice < sellPriceRaw) {
            produce = 0;
            sellPrice = sellPriceRaw;
        }
        if (options.produce.jar && sellPrice < sellPriceJar) {
            produce = 1;
            sellPrice = sellPriceJar;
        }
        if (options.produce.keg && sellPrice < sellPriceKeg) {
            produce = 2;
            sellPrice = sellPriceKeg;
        }

		// TODO are extra crops only normal quality?
		sellPrice *= totalItems;

		seedCost *= options.planted;


		// console.log("Harvests: " + harvests);
		return {"harvests": harvests,
				"extraItems": extraItems,
				"duration": duration,
				"seedLoss": -seedCost,
				"produce": produce,
				"sellPrice": sellPrice,
				"sellPriceRaw": sellPriceRaw,
				"sellPriceJar": sellPriceJar,
				"sellPriceKeg": sellPriceKeg};
	}

	/*
	 * Calculates the profit for a specified crop.
	 * @param crop The crop object, containing all the crop data.
	 * @return The total profit.
	 */
	function profit(crop, sellPrice, options) {
		var profit = sellPrice;

		if (options.buySeed) {
			profit += crop.seedLoss;
			// console.log("Profit (After seeds): " + profit);
		}

		if (options.buyFert) {
			profit += crop.fertLoss;
			// console.log("Profit (After fertilizer): " + profit);
		}

		// console.log("Profit: " + profit);
		return profit;
	}

	/*
	 * Calculates the loss to profit when fertilizer is bought.
	 *
	 * Note that harvesting does not destroy fertilizer, so this is
	 * independent of the number of harvests.
	 *
	 * @return The total loss.
	 */
	function fertLoss(options) {
		var loss = -fertilizers[options.fertilizer].cost;
		return loss * options.planted;
	}

	/*
	 * Converts any value to the average per day value.
	 * @param value The value to convert.
	 * @return Value per day.
	 */
	function perDay(value, options) {
		return value / options.days;
	}

	/*
	 * Generates the cropList array.
	 */
	function valueCrops(options) {
		var cropList = [];

		var season = seasons[options.season];

		for (var i = 0; i < season.crops.length; i++) {
			var cropInfo = season.crops[i];
			if ((options.seeds.pierre && cropInfo.seeds.pierre != 0) ||
				(options.seeds.joja && cropInfo.seeds.joja != 0) ||
				(options.seeds.special && cropInfo.seeds.special != 0)) {
				cropList.push({"id": i, "info": cropInfo});
			}
		}

		for (var i = 0; i < cropList.length; i++) {
			var growth_info = harvests(cropList[i].info, options);
			cropList[i].harvests = growth_info.harvests;
			cropList[i].duration = growth_info.duration;
			cropList[i].seedLoss = growth_info.seedLoss;
			cropList[i].produce = growth_info.produce;
			cropList[i].sellPrice = growth_info.sellPrice;
			cropList[i].sellPriceRaw = growth_info.sellPriceRaw;
			cropList[i].sellPriceJar = growth_info.sellPriceJar;
			cropList[i].sellPriceKeg = growth_info.sellPriceKeg;
			cropList[i].fertLoss = fertLoss(options);
			cropList[i].profit = profit(cropList[i], growth_info.sellPrice, options);
			cropList[i].averageProfit = perDay(cropList[i].profit, options);
			cropList[i].averageSeedLoss = perDay(cropList[i].seedLoss, options);
			cropList[i].averageFertLoss = perDay(cropList[i].fertLoss, options);
			if (options.average) {
				cropList[i].drawProfit = cropList[i].averageProfit;
				cropList[i].drawSeedLoss = cropList[i].averageSeedLoss;
				cropList[i].drawFertLoss = cropList[i].averageFertLoss;
			}
			else {
				cropList[i].drawProfit = cropList[i].profit;
				cropList[i].drawSeedLoss = cropList[i].seedLoss;
				cropList[i].drawFertLoss = cropList[i].fertLoss;
			}
		}

		function cropCompare(left, right) {
			return right.drawProfit - left.drawProfit;
		}
		cropList.sort(cropCompare);

		// console.log("==== SORTED ====");
		for (var i = 0; i < cropList.length; i++) {
			// console.log(cropList[i].drawProfit.toFixed(2) + "  " + cropList[i].name);
		}
		
		return cropList;
	}
	
	return valueCrops;
})();
