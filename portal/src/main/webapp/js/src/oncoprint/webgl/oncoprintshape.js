var Shape = (function() {
    var default_parameter_values = {
	    'width': '100%', 
	    'height': '100%', 
	    'x': '0%', 
	    'y': '0%', 
	    'z': 0,
	    'x1': '0%', 
	    'x2': '0%', 
	    'x3': '0%', 
	    'y1': '0%', 
	    'y2': '0%', 
	    'y3': '0%',
	    'stroke': 'rgba(0,0,0,0)', 
	    'fill': 'rgba(23,23,23,1)', 
	    'stroke-width': '0'
    };
    var parameter_name_to_dimension_index = {
	'width': 0,
	'x':0,
	'x1':0,
	'x2':0,
	'x3':0,
	'height':1,
	'y':1,
	'y1':1,
	'y2':1,
	'y3':1
    };
    function Shape(params) {
	this.params = params;
	this.marked_params = {};
	this.completeWithDefaults();
	this.markParameterTypes();
    }
    Shape.prototype.completeWithDefaults = function() {
	var required_parameters = this.getRequiredParameters();
	for (var i=0; i<required_parameters.length; i++) {
	    var param = required_parameters[i];
	    this.params[param] = (typeof this.params[param] === 'undefined' ? default_parameter_values[param] : this.params[param]);
	}
    }
    Shape.prototype.markParameterTypes = function() {
	var parameters = Object.keys(this.params);
	for (var i=0; i<parameters.length; i++) {
	    var param_name = parameters[i];
	    var param_val = this.params[param_name];
	    if (typeof param_val === 'function') {
		this.marked_params[param_name] = {'type':'function', 'value':param_val};
	    } else {
		this.marked_params[param_name] = {'type':'value', 'value': param_val};
	    }
	}
    }
    Shape.prototype.getComputedParams = function(d, base_width, base_height) {
	var computed_params = {};
	var param_names = Object.keys(this.marked_params);
	var dimensions = [base_width, base_height];
	for (var i=0; i<param_names.length; i++) {
	    var param_name = param_names[i];
	    var param_val_map = this.marked_params[param_name];
	    var param_val = param_val_map.value;
	    if (param_name !== 'type') {
		if (param_val_map.type === 'function') {
		    param_val = param_val(d);
		}
		if (param_val[param_val.length-1] === '%') {
		    param_val = parseFloat(param_val) / 100;
		    param_val *= dimensions[parameter_name_to_dimension_index[param_name]];
		}
	    }
	    computed_params[param_name] = param_val;
	}
	return computed_params;
    };
    return Shape;
})();

var Rectangle = (function() {
    function Rectangle(params) {
	Shape.call(this, params);
    }
    Rectangle.prototype = Object.create(Shape.prototype);
    Rectangle.prototype.getRequiredParameters = function() {
	return ['width', 'height', 'x', 'y', 'z', 'stroke', 'fill', 'stroke-width']; 
    }
    return Rectangle;
})();

var Triangle = (function() {
    function Triangle(params) {
	Shape.call(this, params);
    }
    Triangle.prototype = Object.create(Shape.prototype);
    Triangle.prototype.getRequiredParameters = function() {
	return ['x1', 'x2', 'x3', 'y1', 'y2', 'y3', 'z', 'stroke', 'fill', 'stroke-width']; 
    }
    return Triangle;
})();

var Ellipse = (function() {
    function Ellipse(params) {
	Shape.call(this, params);
    }
    Ellipse.prototype = Object.create(Shape.prototype);
    Ellipse.prototype.getRequiredParameters = function() {
	return ['width', 'height', 'x', 'y', 'z', 'stroke', 'fill', 'stroke-width']; 
    }
    return Ellipse;
})();

var Line = (function() {
    function Line(params) {
	Shape.call(this, params);
    }
    Line.prototype = Object.create(Shape.prototype);
    Line.prototype.getRequiredParameters = function() {
	return ['x1', 'x2', 'y1', 'y2', 'z', 'stroke', 'stroke-width']; 
    }
    return Line;
})();

module.exports = {
    'Rectangle':Rectangle,
    'Triangle':Triangle,
    'Ellipse':Ellipse,
    'Line':Line
};