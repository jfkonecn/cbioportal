/* Rule:
 * 
 * condition: function from datum to boolean
 * shapes - a list of Shapes
 * legend_label
 * exclude_from_legend
 * 
 * Shape:
 * type
 * x
 * y
 * ... shape-specific attrs ...
 * 
 * Attrs by shape:
 * 
 * rectangle: x, y, width, height, stroke, stroke-width, fill
 * triangle: x1, y1, x2, y2, x3, y3, stroke, stroke-width, fill
 * ellipse: x, y, width, height, stroke, stroke-width, fill
 * line: x1, y1, x2, y2, stroke, stroke-width
 */

var Shape = require('./oncoprintshape.js');

function ifndef(x, val) {
    return (typeof x === "undefined" ? val : x);
}

function makeIdCounter() {
    var id = 0;
    return function () {
	id += 1;
	return id;
    };
}

function shallowExtend(target, source) {
    var ret = {};
    for (var key in target) {
	if (target.hasOwnProperty(key)) {
	    ret[key] = target[key];
	}
    }
    for (var key in source) {
	if (source.hasOwnProperty(key)) {
	    ret[key] = source[key];
	}
    }
    return ret;
}


var NA_SHAPES = [
    {
	'type': 'rectangle',
	'fill': 'rgba(238, 238, 238, 1)',
	'z': '0',
    },
    {
	'type': 'line',
	'x1': '0%',
	'y1': '0%',
	'x2': '100%',
	'y2': '100%',
	'stroke': 'rgba(85, 85, 85, 1)',
	'stroke-width': '1',
    },
];
var NA_STRING = "na";
var NA_LABEL = "N/A";

var DEFAULT_GENETIC_ALTERATION_PARAMS = {
    rule_params: {
	'*': {
	    shapes: [{
		    'type': 'rectangle',
		    'fill': 'rgba(211, 211, 211, 1)',
		    'z': -1
		}],
	    exclude_from_legend: true,
	    z: -1
	},
	'cna': {
	    'AMPLIFIED': {
		shapes: [{
			'type': 'rectangle',
			'fill': 'rgba(255,0,0,1)',
			'x': '0%',
			'y': '0%',
			'width': '100%',
			'height': '100%',
			'z':0,
		    }],
		legend_label: 'Amplification',
	    },
	    'GAINED': {
		shapes: [{
			'type': 'rectangle',
			'fill': 'rgba(255,182,193,1)',
			'x': '0%',
			'y': '0%',
			'width': '100%',
			'height': '100%',
			'z':0,
		    }],
		legend_label: 'Gain',
	    },
	    'HOMODELETED': {
		shapes: [{
			'type': 'rectangle',
			'fill': 'rgba(0,0,255,1)',
			'x': '0%',
			'y': '0%',
			'width': '100%',
			'height': '100%',
			'z':0,
		    }],
		legend_label: 'Deep Deletion',
	    },
	    'HEMIZYGOUSLYDELETED': {
		shapes: [{
			'type': 'rectangle',
			'fill': 'rgba(143, 216, 216,1)',
			'x': '0%',
			'y': '0%',
			'width': '100%',
			'height': '100%',
			'z':0,
		    }],
		legend_label: 'Shallow Deletion',
	    }
	},
	'mrna': {
	    'UPREGULATED': {
		shapes: [{
			'type': 'rectangle',
			'fill': 'rgba(0, 0, 0, 0)',
			'stroke': 'rgba(255, 153, 153, 1)',
			'stroke-width': '2',
			'x': '0%',
			'y': '0%',
			'width': '100%',
			'height': '100%',
			'z': -2,
		    }],
		legend_label: 'mRNA Upregulation',
	    },
	    'DOWNREGULATED': {
		shapes: [{
			'type': 'rectangle',
			'fill': 'rgba(0, 0, 0, 0)',
			'stroke': 'rgba(102, 153, 204, 1)',
			'stroke-width': '2',
			'x': '0%',
			'y': '0%',
			'width': '100%',
			'height': '100%',
			'z': -2,
		    }],
		legend_label: 'mRNA Downregulation',
	    },
	},
	'rppa': {
	    'UPREGULATED': {
		shapes: [{
			'type': 'triangle',
			'x1': '50%',
			'y1': '0%',
			'x2': '100%',
			'y2': '33.33%',
			'x3': '0%',
			'y3': '33.33%',
			'fill': 'rgba(0,0,0,1)',
			'z':2,
		    }],
		legend_label: 'Protein Upregulation',
	    },
	    'DOWNREGULATED': {
		shapes: [{
			'type': 'triangle',
			'x1': '50%',
			'y1': '100%',
			'x2': '100%',
			'y2': '66.66%',
			'x3': '0%',
			'y3': '66.66%',
			'fill': 'rgba(0,0,0,1)',
			'z':2,
		    }],
		legend_label: 'Protein Downregulation',
	    }
	},
	'mut_type': {
	    'MISSENSE': {
		shapes: [{
			'type': 'rectangle',
			'fill': '#008000',
			'x': '0%',
			'y': '33.33%',
			'width': '100%',
			'height': '33.33%',
			'z':3.2,
		    }],
		legend_label: 'Missense Mutation',
	    },
	    'INFRAME': {
		shapes: [{
			'type': 'rectangle',
			'fill': 'rgba(159, 129, 112, 1)',
			'x': '0%',
			'y': '33.33%',
			'width': '100%',
			'height': '33.33%',
			'z':3.2,
		    }],
		legend_label: 'Inframe Mutation',
	    },
	    'TRUNC': {
		shapes: [{
			'type': 'rectangle',
			'fill': 'rgba(0, 0, 0, 1)',
			'x': '0%',
			'y': '33.33%',
			'width': '100%',
			'height': '33.33%',
			'z':3.2,
		    }],
		legend_label: 'Truncating Mutation',
	    },
	    'FUSION': {
		shapes: [{
			'type': 'triangle',
			'fill': 'rgba(0, 0, 0, 1)',
			'x1': '0%',
			'y1': '0%',
			'x2': '100%',
			'y2': '50%',
			'x3': '0%',
			'y3': '100%',
			'z':3.1,
		    }],
		legend_label: 'Fusion',
	    }
	}
    }
};

var RuleSet = (function () {
    var getRuleSetId = makeIdCounter();
    var getRuleId = makeIdCounter();

    function RuleSet(params) {
	/* params:
	 * - legend_label
	 * - exclude_from_legend
	 */
	this.rule_map = {};
	this.rule_set_id = getRuleSetId();
	this.z_map = {};
	this.legend_label = params.legend_label;
	this.exclude_from_legend = params.exclude_from_legend;
	this.recently_used_rule_ids = {};
    }

    RuleSet.prototype.getLegendLabel = function () {
	return this.legend_label;
    }

    RuleSet.prototype.getRuleSetId = function () {
	return this.rule_set_id;
    }

    RuleSet.prototype.addRules = function (list_of_params) {
	var self = this;
	return list_of_params.map(function (params) {
	    return self.addRule(params);
	});
    }

    RuleSet.prototype.addRule = function (params) {
	var rule_id = getRuleId();
	var z = (typeof params.z === "undefined" ? rule_id : params.z);
	this.rule_map[rule_id] = new Rule(params);
	this.z_map[rule_id] = parseFloat(z);
	return rule_id;
    }

    RuleSet.prototype.removeRule = function (rule_id) {
	delete this.rule_map[rule_id];
    }

    RuleSet.prototype.getRule = function (rule_id) {
	return this.rule_map[rule_id];
    }

    RuleSet.prototype.getRules = function () {
	var self = this;
	return Object.keys(this.rule_map).map(function (rule_id) {
	    return {id: rule_id, rule: self.getRule(rule_id)};
	});
    }

    RuleSet.prototype.isExcludedFromLegend = function () {
	return this.exclude_from_legend;
    }

    RuleSet.prototype.clearRecentlyUsedRules = function () {
	this.recently_used_rule_ids = {};
    }

    RuleSet.prototype.markRecentlyUsedRule = function (rule_id) {
	this.recently_used_rule_ids[rule_id] = true;
    }

    RuleSet.prototype.getRecentlyUsedRules = function () {
	var self = this;
	return Object.keys(this.recently_used_rule_ids).map(
		function (rule_id) {
		    return self.getRule(rule_id);
		});
    }

    RuleSet.prototype.apply = function (data, cell_width, cell_height) {
	// Returns a list of lists of concrete shapes, in the same order as data
	this.clearRecentlyUsedRules();

	var rules = this.getRules();
	var rules_len = rules.length;
	var self = this;

	return data.map(function (d) {
	    var concrete_shapes = [];
	    for (var j = 0; j < rules_len; j++) {
		var rule_concrete_shapes =
			rules[j].rule.getConcreteShapes(
			d, cell_width, cell_height);
		if (rule_concrete_shapes.length > 0) {
		    self.markRecentlyUsedRule(rules[j].id);
		}
		concrete_shapes = concrete_shapes.concat(
			rule_concrete_shapes);
	    }
	    return concrete_shapes.sort(function(shapeA, shapeB) {
		if (parseFloat(shapeA.z) < parseFloat(shapeB.z)) {
		    return -1;
		} else if (parseFloat(shapeA.z) > parseFloat(shapeB.z)) {
		    return 1;
		} else {
		    return 0;
		}
	    });
	});
    }
    return RuleSet;
})();

var CategoricalRuleSet = (function () {
    var colors = ["#3366cc", "#dc3912", "#ff9900", "#109618",
	"#990099", "#0099c6", "#dd4477", "#66aa00",
	"#b82e2e", "#316395", "#994499", "#22aa99",
	"#aaaa11", "#6633cc", "#e67300", "#8b0707",
	"#651067", "#329262", "#5574a6", "#3b3eac",
	"#b77322", "#16d620", "#b91383", "#f4359e",
	"#9c5935", "#a9c413", "#2a778d", "#668d1c",
	"#bea413", "#0c5922", "#743411"]; // Source: D3

    function CategoricalRuleSet(params) {
	/* params
	 * - category_key
	 * - categoryToColor
	 */
	RuleSet.call(this, params);
	this.category_key = params.category_key;
	this.category_to_color = ifndef(params.category_to_color, {});
	for (var category in this.category_to_color) {
	    if (this.category_to_color.hasOwnProperty(category)) {
		addCategoryRule(this, category, this.category_to_color[category]);
	    }
	}
	this.addRule({
	    condition: function (d) {
		return d[params.category_key] === NA_STRING;
	    },
	    shapes: NA_SHAPES,
	    legend_label: NA_LABEL,
	    exclude_from_legend: false
	});
    }
    CategoricalRuleSet.prototype = Object.create(RuleSet.prototype);

    var addCategoryRule = function (ruleset, category, color) {
	var rule_params = {
	    condition: function (d) {
		return d[ruleset.category_key] === category;
	    },
	    shapes: [{
		    type: 'rectangle',
		    fill: color,
		}],
	    legend_label: category,
	    exclude_from_legend: false
	};
	ruleset.addRule(rule_params);
    };

    CategoricalRuleSet.prototype.apply = function (data, cell_width, cell_height) {
	// First ensure there is a color for all categories
	for (var i = 0, data_len = data.length; i < data_len; i++) {
	    var category = data[i][this.category_key];
	    if (!this.category_to_color.hasOwnProperty(category)) {
		var color = colors.pop();
		this.category_to_color[category] = color;
		addCategoryRule(this, category, color);
	    }
	}
	// Then propagate the call up
	return RuleSet.prototype.apply.call(this, data, cell_width, cell_height);
    };

    return CategoricalRuleSet;
})();

var LinearInterpRuleSet = (function () {
    function LinearInterpRuleSet(params) {
	/* params
	 * - value_key
	 * - value_range
	 */
	RuleSet.call(this, params);
	this.value_key = params.value_key;
	this.value_range = params.value_range;
	this.inferred_value_range;

	this.addRule({
	    condition: function (d) {
		return isNaN(d[params.value_key]);
	    },
	    shapes: NA_SHAPES,
	    legend_label: NA_LABEL,
	    exclude_from_legend: false
	});

	this.makeInterpFn = function () {
	    var range = getEffectiveValueRange(this);
	    if (range[0] === range[1]) {
		// Make sure non-zero denominator
		range[0] -= range[0] / 2;
		range[1] += range[1] / 2;
	    }
	    var range_spread = range[1] - range[0];
	    var range_lower = range[0];
	    return function (val) {
		return (val - range_lower) / range_spread;
	    };
	};
    }
    LinearInterpRuleSet.prototype = Object.create(RuleSet.prototype);

    var getEffectiveValueRange = function (ruleset) {
	var ret = [ruleset.value_range[0], ruleset.value_range[1]];
	if (typeof ret[0] === "undefined") {
	    ret[0] = ruleset.inferred_value_range[0];
	}
	if (typeof ret[1] === "undefined") {
	    ret[1] = ruleset.inferred_value_range[1];
	}
	return ret;
    };

    LinearInterpRuleSet.prototype.apply = function (data, cell_width, cell_height) {
	// First find value range
	var value_min = Number.POSITIVE_INFINITY;
	var value_max = Number.NEGATIVE_INFINITY;
	for (var i = 0, datalen = data.length; i < datalen; i++) {
	    var d = data[i];
	    value_min = Math.min(value_min, d[this.value_key]);
	    value_max = Math.max(value_max, d[this.value_key]);
	}
	this.inferred_value_range = [value_min, value_max];
	this.updateLinearRules();

	// Then propagate the call up
	return RuleSet.prototype.apply.call(this, data, cell_width, cell_height);
    };

    LinearInterpRuleSet.prototype.updateLinearRules = function () {
	throw "Not implemented in abstract class";
    };

    return LinearInterpRuleSet;
})();

var GradientRuleSet = (function () {
    function GradientRuleSet(params) {
	/* params
	 * - color_range
	 */
	LinearInterpRuleSet.call(this, params);
	this.color_range;
	(function setUpColorRange(self) {
	    var color_start;
	    var color_end;
	    try {
		color_start = params.color_range[0]
			.match(/rgba\(([\d.,]+)\)/)
			.split(',')
			.map(parseFloat);
		color_end = params.color_range[1]
			.match(/rgba\(([\d.,]+)\)/)
			.split(',')
			.map(parseFloat);
		if (color_start.length !== 4 || color_end.length !== 4) {
		    throw "wrong number of color components";
		}
	    } catch (err) {
		color_start = [0, 0, 0, 1];
		color_end = [255, 0, 0, 1];
	    }
	    self.color_range = color_start.map(function (c, i) {
		return [c, color_end[i]];
	    });
	})(this);
	console.log(this.color_range);
	this.gradient_rule;
	this.updateLinearRules();

    }
    GradientRuleSet.prototype = Object.create(LinearInterpRuleSet.prototype);

    GradientRuleSet.prototype.updateLinearRules = function () {
	if (typeof this.gradient_rule !== "undefined") {
	    this.removeRule(this.gradient_rule);
	}
	var interpFn = this.makeInterpFn();
	var value_key = this.value_key;
	var color_range = this.color_range;
	this.gradient_rule = this.addRule({
	    condition: function (d) {
		return !isNaN(d[value_key]);
	    },
	    shapes: [{
		    type: 'rectangle',
		    fill: function (d) {
			var t = interpFn(d[value_key]);
			return "rgba(" + color_range.map(
				function (arr) {
				    return (1 - t) * arr[0]
					    + t * arr[1];
				}).join(",") + ")";
		    }
		}],
	    exclude_from_legend: false
	});
    };

    return GradientRuleSet;
})();

var BarRuleSet = (function () {
    function BarRuleSet(params) {
	LinearInterpRuleSet.call(this, params);
	this.bar_rule;
	this.fill = params.fill || 'rgba(0,0,255,1)';
	this.updateLinearRules();
    }
    BarRuleSet.prototype = Object.create(LinearInterpRuleSet.prototype);

    BarRuleSet.prototype.updateLinearRules = function () {
	if (typeof this.bar_rule !== "undefined") {
	    this.removeRule(this.bar_rule);
	}
	var interpFn = this.makeInterpFn();
	var value_key = this.value_key;
	this.bar_rule = this.addRule({
	    condition: function (d) {
		return !isNaN(d[value_key]);
	    },
	    shapes: [{
		    type: 'rectangle',
		    y: function (d) {
			var t = interpFn(d[value_key]);
			return (1 - t) * 100 + "%";
		    },
		    height: function (d) {
			var t = interpFn(d[value_key]);
			return t * 100 + "%";
		    },
		    fill: this.fill,
		    'stroke-width': 1,
		    stroke: 'rgba(0,255,0,1)'
		}],
	    exclude_from_legend: false
	});
    };

    return BarRuleSet;
})();

var GeneticAlterationRuleSet = (function () {
    function GeneticAlterationRuleSet(params) {
	/* params:
	 * - rule_params
	 */
	RuleSet.call(this, params);
	this.addRule({
	    condition: function (d) {
		return d.hasOwnProperty(NA_STRING);
	    },
	    shapes: NA_SHAPES,
	    legend_label: NA_LABEL,
	    exclude_from_legend: false
	});
	(function addRules(self) {
	    var rule_params = params.rule_params;
	    for (var key in rule_params) {
		if (rule_params.hasOwnProperty(key)) {
		    var key_rule_params = rule_params[key];
		    if (key === '*') {
			self.addRule(rule_params['*']);
		    } else {
			for (var value in key_rule_params) {
			    if (key_rule_params.hasOwnProperty(value)) {
				var condition = (function(k,v) {
				    return (v === '*' ?
					function (d) {
					    return (typeof d[k] !== 'undefined');
					} :
					function (d) {
					    return d[k] === v;
					});
				    })(key, value);
				self.addRule(shallowExtend(key_rule_params[value],
						{'condition': condition}));
			    }
			}
		    }
		}
	    }
	})(this);
    }
    GeneticAlterationRuleSet.prototype = Object.create(RuleSet.prototype);

    return GeneticAlterationRuleSet;
})();

var Rule = (function () {
    function Rule(params) {
	this.condition = params.condition || function (d) {
	    return true;
	};
	this.shapes = params.shapes.map(function(shape){ 
	    if (shape.type === 'rectangle') {
		return new Shape.Rectangle(shape);
	    } else if (shape.type === 'triangle') {
		return new Shape.Triangle(shape);
	    } else if (shape.type === 'ellipse') {
		return new Shape.Ellipse(shape);
	    } else if (shape.type === 'line') {
		return new Shape.Line(shape);
	    }
	});
	this.legend_label = params.legend_label || "";
	this.exclude_from_legend = params.exclude_from_legend;
	this.legend_config = {'type':'simple', 'target': {'mut_type':'MISSENSE'}}; // or {'type':'number', 'range':[lower, upper]} or {'type':'color', 'range':['rgba(...)' or '#...', 'rgba(...)' or '#...']}
    }
    Rule.prototype.getLegendConfig = function() {
	return this.legend_config;
    }
    Rule.prototype.getConcreteShapes = function (d, cell_width, cell_height) {
	// Gets concrete shapes (i.e. computed
	// real values from percentages) 
	// or returns empty list if the rule condition is not met.
	if (!this.condition(d)) {
	    return [];
	}
	var concrete_shapes = [];
	for (var i = 0, shapes_len = this.shapes.length; i < shapes_len; i++) {
	    concrete_shapes.push(this.shapes[i].getComputedParams(d, cell_width, cell_height));
	}
	return concrete_shapes;
    }

    Rule.prototype.isExcludedFromLegend = function () {
	return this.exclude_from_legend;
    }

    return Rule;
})();

module.exports = function (params) {
    if (params.type === 'categorical') {
	return new CategoricalRuleSet(params);
    } else if (params.type === 'gradient') {
	return new GradientRuleSet(params);
    } else if (params.type === 'bar') {
	return new BarRuleSet(params);
    } else if (params.type === 'gene') {
	// TODO: specification of params
	return new GeneticAlterationRuleSet(DEFAULT_GENETIC_ALTERATION_PARAMS);
    }
}