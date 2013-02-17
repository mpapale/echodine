require.config({
	shim: {
		"contrib/underscore": {
			exports: "_"
		},
		"contrib/backbone": {
			deps: ["contrib/underscore", "jquery"],
			exports: "Backbone"
		},
		"contrib/bootstrap": {
			deps: ["jquery"],
			exports: "$.fn.popover" // kind of a hack, we choose one of bootstrap's "exports" arbitrarily
		}
	},

	enforceDefine: true
});


define(
	[
		"jquery", 
		"contrib/underscore", 
		"contrib/backbone",
		"contrib/bootstrap"
	], 

	function($, _, Backbone) {
		// TODO move this to something better
		var productsJson = [
			{
				name: "Apple Butter",
				sizes: [4]
			},
			{
				name: "Brandy-soaked cherries",
				sizes: [8] 
			},
			{
				name: "Meyer Lemon and Rose Petal Jam",
				sizes: [4, 12.5]
			},
			{
				name: "Apricot Mustard",
				sizes: [4] 
			},
			{
				name: "Grapefruit Mint Syrup",
				sizes: [8, 12.5] 
			},
			{
				name: "Navel Orange Jam",
				sizes: [12.5] 
			},
			{
				name: "Grand Marnier-spiced cranberries",
				sizes: [12.5]
			}
		];

		var ProductModel = Backbone.Model.extend({
			defaults: {
				name: '',
				sizes: []
			}
		});

		var ProductCollection = Backbone.Collection.extend({
			model: ProductModel
		});

		var allProducts = new ProductCollection();

		var ProductListView = Backbone.View.extend({
			tagName: 'ul',
			className: 'product-list-view',
			initialize: function() {
				$('body').append(this.$el);
				this.listenTo(this.collection, "initialized", this.render);
			},
			render: function() {
				this.$el.empty();

				this.collection.forEach(function(product) {
					this.$el.append($('<li><strong>' + product.get('name') + '</strong>. ' + product.get('sizes').join(',') + '</li>'));
				}.bind(this));

				return this;
			}
		});

		var mainView = new ProductListView({
			collection: allProducts
		});

		productsJson.forEach(function(productData) {
			var product = new ProductModel({
				name: productData.name,
				sizes: productData.sizes
			});

			allProducts.add(product);
		});
		allProducts.trigger('initialized');



	}
);
