(function() {
	var global = window;

	// dependencies. we'll replace this with require js if i feel like it
	var _ = window._; // underscore
	var $ = window.$; // jquery
	var Backbone = window.Backbone; 

	// setup some models
	var ProductModel = Backbone.Model.extend({
		imageUrl: '',
		sizes: [], // list of floats, in fluid ounces
		price: 0.0, // in dollars
		quantity: 0
	});

	var ShoppingCartModel = Backbone.Model.extend({
		items: [] // collection of ProductModels
	});


	// now for some views
	var UberView = Backbone.View.extend({}); // TODO setup some shit so it shows a little of the shopping cart model + image tiles

	var ShoppingCartView = Backbone.View.extend({}); // TODO editable view for shopping cart.

	var ProductOverlayView = Backbone.View.extend({}); // TODO show details of the product, and allow to add to cart.

	
}());