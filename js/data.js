
// Different player levels with respective percentages.
var qualityPercentages = {
	"gold": {
		"normal":  [ 1,  3,  5,  7,  9, 11, 13, 15, 17, 19, 21],
		"basic":   [ 4,  8, 12, 15, 19, 23, 26, 30, 34, 37, 41],
		"quality": [ 8, 13, 18, 24, 29, 34, 40, 45, 50, 56, 61]
	},
	"silver": {
		"normal":  [ 2,  6, 10, 14, 18, 22, 26, 30, 34, 38, 42],
		"basic":   [ 9, 16, 23, 31, 38, 45, 53, 60, 67, 75, 75],
		"quality": [15, 26, 37, 47, 58, 69, 75, 75, 75, 75, 75]
	}
};

// Different fertilizers with their stats.
var fertilizers = [
	{
		"name": "None",
		"qualityLevel": "normal",
		"growth": 1,
		"cost": 0
	},	
	{	
		"name": "Basic Fertilizer",
		"qualityLevel": "basic",
		"growth": 1,
		"cost": 100
	},
	{
		"name": "Quality Fertilizer",
		"qualityLevel": "quality",
		"growth": 1,
		"cost": 150
	},
	{
		"name": "Speed-Gro",
		"qualityLevel": "normal",
		"growth": 0.9,
		"cost": 100
	},
	{
		"name": "Deluxe Speed-Gro",
		"qualityLevel": "normal",
		"growth": 0.75,
		"cost": 150
	}
];

// Different seasons with predefined crops.
var seasons = [
	{
		"name": "Spring",
		"duration": 28,
		"crops": [
			crops.coffeebean,
			crops.strawberry,
			crops.rhubarb,
			crops.potato,
			crops.cauliflower,
			crops.greenbean,
			crops.kale,
			crops.garlic,
			crops.parsnip,
			crops.bluejazz,
			crops.tulip,
			crops.ancientfruit
		]
	},
	{
		"name": "Summer",
		"duration": 28,
		"crops": [
			crops.blueberry,
			crops.starfruit,
			crops.redcabbage,
			crops.hops,
			crops.melon,
			crops.hotpepper,
			crops.tomato,
			crops.radish,
			crops.summerspangle,
			crops.poppy,
			crops.wheat,
			crops.corn,
			crops.coffeebean,
			crops.sunflower,
			crops.ancientfruit
		]
	},
	{
		"name": "Fall",
		"duration": 28,
		"crops": [
			crops.sweetgemberry,
			crops.cranberries,
			crops.pumpkin,
			crops.grape,
			crops.artichoke,
			crops.beet,
			crops.eggplant,
			crops.amaranth,
			crops.yam,
			crops.fairyrose,
			crops.bokchoy,
			crops.sunflower,
			crops.wheat,
			crops.corn,
			crops.ancientfruit
		]
	},
	{
		"name": "Greenhouse",
		"duration": 112,
		"crops": [
			crops.coffeebean,
			crops.strawberry,
			crops.rhubarb,
			crops.potato,
			crops.cauliflower,
			crops.greenbean,
			crops.kale,
			crops.garlic,
			crops.parsnip,
			crops.bluejazz,
			crops.tulip,
			crops.blueberry,
			crops.starfruit,
			crops.redcabbage,
			crops.hops,
			crops.melon,
			crops.hotpepper,
			crops.tomato,
			crops.radish,
			crops.summerspangle,
			crops.poppy,
			crops.wheat,
			crops.corn,
			crops.sweetgemberry,
			crops.cranberries,
			crops.pumpkin,
			crops.grape,
			crops.artichoke,
			crops.beet,
			crops.eggplant,
			crops.amaranth,
			crops.yam,
			crops.fairyrose,
			crops.bokchoy,
			crops.sunflower,
			crops.ancientfruit
		]
	}
];