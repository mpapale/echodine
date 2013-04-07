require.config({
	shim: {
		"contrib/underscore": {
			exports: "_"
		},
		"contrib/backbone": {
			deps: ["contrib/underscore", "jquery"],
			exports: "Backbone"
		}//,
		// "contrib/bootstrap": {
		// 	deps: ["jquery"],
		// 	exports: "$.fn.popover" // kind of a hack, we choose one of bootstrap's "exports" arbitrarily
		// }
	},

	enforceDefine: true
});


define(
	[
		"jquery", 
		"contrib/underscore", 
		"contrib/backbone"
	], 

	function($, _, Backbone) {


		// TODO move this to something better
		var productsJson = [
			{
				name: "Apple Butter",
				options: [{
					price: 1.0,
					size: 4
				}]
			},
			{
				name: "Brandy-soaked cherries",
				options: [{
					price: 2.0,
					size: 8
				}]
			},
			{
				name: "Meyer Lemon and Rose Petal Jam",
				options: [{
					price: 1.0,
					size: 4
				}, {
					price: 2.0,
					size: 12.5
				}]
			},
			{
				name: "Apricot Mustard",
				options: [{
					price: 1.0,
					size: 4
				}] 
			},
			{
				name: "Grapefruit Mint Syrup",
				options: [{
					price: 2.0,
					size: 8
				}, { 
					price: 3.0,
					size: 12.5
				}] 
			},
			{
				name: "Navel Orange Jam",
				options: [{
					price: 2.0, 
					size: 12.5
				}] 
			},
			{
				name: "Grand Marnier-spiced cranberries",
				options: [{
					price: 3.0,
					size: 12.5
				}]
			}
		];
		// TODO not this
		var imageResource = function(productName) {
			return 'img/echo/' + productName.split(/[- ]/).join('-').toLowerCase() + '.jpg';
		};

		// model definition
		var ProductModel = Backbone.Model.extend({
			defaults: {
				name: '',
				sizes: []
			}
		});

		// collection model defintion
		var ProductCollection = Backbone.Collection.extend({
			model: ProductModel
		});


		// view definition
		var ProductListView = Backbone.View.extend({
			tagName: 'ul',
			className: 'product-list-view',
			initialize: function() {
				$('#content').append(this.$el);
			},
			render: function() {
				this.$el.empty();

				this.$el.append($(_.template(this.template, { 
					products: this.collection.toArray(),
					imageResource: imageResource
				})));


				// sliding controls
				var children = this.$el.children('li');
				var ul = this.$el;
				this.$el.find('.right-control').click(function() {
					var currentLeft = parseInt(ul.css('left'));
					ul.css('left', currentLeft + 980 + 'px');

					var left = $(ul.find('li.left-periphery'));
					var right = $(ul.find('li.right-periphery'));

					if (left.length) {
						left.prev().addClass('left-periphery');
					} else {
						right.next().addClass('left-periphery');
					}

					if (right.length) {
						right.prev().addClass('right-periphery');
					} else {
						left.next().addClass('right-periphery');
					}

					left.removeClass('left-periphery');
					right.removeClass('right-periphery');


				});

				this.$el.find('.left-control').click(function() {
					var currentLeft = parseInt(ul.css('left'));
					ul.css('left', currentLeft - 980 + 'px');

					var left = $(ul.find('li.left-periphery'));
					var right = $(ul.find('li.right-periphery'));

					if (left.length) {
						left.next().addClass('left-periphery');
					} else {
						right.prev().addClass('left-periphery');
					}

					if (right.length) {
						right.next().addClass('right-periphery');
					} else {
						left.prev().addClass('right-periphery');
					}

					left.removeClass('left-periphery');
					right.removeClass('right-periphery');

				});

				// initialize sliding
				this.$el.find('li').first().next().addClass('right-periphery');


				// toggling of sizes
				var cards = this.$el.children('li');
				_.each(cards, function(card) {
					var sizes = $(card).find('.details-container .sizes li');
					sizes.first().addClass('selected');

					sizes.click(function() {
						var currentSize = $(this);
						_.each(sizes, function (size) { $(size).removeClass('selected'); });
						currentSize.addClass('selected');
						var price = parseInt(currentSize.attr('data-price')).toFixed(2);
						$(card).find('.details-container .price').text('$' + price);
					});
				});


				return this;
			},
			template: '' + 
				'<% _.each(products, function(product) { %>' +
					'<li>' +
						'<div class="left-control">&gt;</div>' +
						'<div class="img-container">' +
							'<img src="<%= imageResource(product.get("name")) %>" />' +
						'</div>' +
						'<div class="details-container">' +
							'<h1><%= product.get("name") %></h1>' +
							'<div class="price">$<%= product.get("options")[0].price.toFixed(2) %></div>' +
							'<ul class="sizes">' +
								'<% _.each(product.get("options"), function(option) { %>' +
									'<li data-price="<%= option.price %>"><%= option.size %> oz</li>' +
								'<% }); %>' +
							'</ul>' +
							'<div style="clear:both;"></div>' +
							'<button class="btn btn-primary btn-large" type="button">Buy me!</button>' +
						'</div>' +
						'<div class="right-control">&lt;</div>' +
					'</li>' +
				'<%}); %>'
		});


		// set up page
		// first build the udnerlying collection
		var allProducts = new ProductCollection();
		_.forEach(productsJson, function(productData) {
			var product = new ProductModel({
				name: productData.name,
				options: productData.options.sort(function(optA, optB) {
					return optA.size - optB.size;
				})
			});

			allProducts.add(product);
		});


		// make a main view
		var mainView = new ProductListView({
			collection: allProducts
		}).render();

	}
);
