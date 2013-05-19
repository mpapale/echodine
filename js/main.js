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
		var CARD_WIDTH = 800;
		var CARD_MARGIN = 5;
		var CARD_CONTAINER_MARGIN = 25;


		// TODO move this to something better
		var productsJson = [
			{
				name: "Apple Butter",
				options: [{
					price: 1.0,
					size: 4,
					soldOut: false
				}]
			},
			{
				name: "Brandy-soaked cherries",
				options: [{
					price: 2.0,
					size: 8,
					soldOut: false
				}]
			},
			{
				name: "Meyer Lemon and Rose Petal Jam",
				options: [{
					price: 1.0,
					size: 4,
					soldOut: false
				}, {
					price: 2.0,
					size: 12.5,
					soldOut: false
				}]
			},
			{
				name: "Apricot Mustard",
				options: [{
					price: 1.0,
					size: 4,
					soldOut: true
				}],
			},
			{
				name: "Grapefruit Mint Syrup",
				options: [{
					price: 2.0,
					size: 8,
					soldOut: false
				}, { 
					price: 3.0,
					size: 12.5,
					soldOut: false
				}] 
			},
			{
				name: "Navel Orange Jam",
				options: [{
					price: 2.0, 
					size: 12.5,
					soldOut: false
				}] 
			},
			{
				name: "Grand Marnier-spiced cranberries",
				options: [{
					price: 3.0,
					size: 12.5,
					soldOut: false
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
				options: []
			}
		});

		// collection model defintion
		var ProductCollection = Backbone.Collection.extend({
			model: ProductModel
		});



		// view definition
		// TODO rewrite this code so that render takes into account
		// the current state of the shopping cart
		var ProductListView = Backbone.View.extend({
			tagName: 'ul',
			className: 'product-list-view',
			initialize: function() {
				$('#content').append(this.$el);
				this.options.shoppingCart.bind('remove', this.itemRemoved, this);
			},
			itemRemoved: function(product) {
				var $listEl = this.$el.children('li[data-name="' + product.get('name') + '"]');
				var $sizeEl = $listEl.find('.sizes li[data-size="' + product.get('options')[0].size + '"]');
				var buyMeButton = $listEl.find('button');

				$sizeEl.attr('data-in-cart', 'false');

				if ($sizeEl.hasClass('selected')) {
					buyMeButton.removeClass('in-cart');
					buyMeButton.text('Buy me!');
				}

			},
			render: function() {
				var shoppingCart = this.options.shoppingCart;
				this.$el.empty();

				this.$el.append($(_.template(this.template, { 
					products: this.collection.toArray(),
					imageResource: imageResource
				})));

				var distanceToMoveCard = function() {
					return CARD_WIDTH + 2*CARD_MARGIN;
				};


				// sliding controls
				var children = this.$el.children('li');
				var ul = this.$el;
				this.$el.find('.right-control').click(function() {
					var currentLeft = parseInt(ul.css('left'));
					ul.css('left', currentLeft + distanceToMoveCard() + 'px');

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
					ul.css('left', currentLeft - distanceToMoveCard() + 'px');

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


				// toggling of sizes and adding to shopping cart
				var cards = this.$el.children('li');
				_.each(cards, function (card) {
					var sizes = $(card).find('.details-container .sizes li');
					var buyMeButton = $(card).find('button');
					

					sizes.first().addClass('selected');

					sizes.click(function() {
						var currentSize = $(this);
						buyMeButton.removeClass('sold-out');
						buyMeButton.removeClass('in-cart');
						_.each(sizes, function (size) { $(size).removeClass('selected'); });
						currentSize.addClass('selected');
						var price = parseFloat(currentSize.attr('data-price')).toFixed(2);
						$(card).find('.details-container .price').text('$' + price);

						var soldOut = currentSize.attr('data-sold-out') === 'true';
						// this is nasty
						var inCart = currentSize.attr('data-in-cart') === 'true';


						if (soldOut) {
							buyMeButton.addClass('sold-out');
							buyMeButton.text('Sold out!');
						} else if (inCart) {
							buyMeButton.addClass('in-cart');
							buyMeButton.text('In cart!');
						} else {
							buyMeButton.text('Buy me!');
						}
					});

					buyMeButton.click(function () {
						var currentSize = $(card).find('.details-container .sizes .selected');

						if (!buyMeButton.hasClass('sold-out') &&
							!buyMeButton.hasClass('in-cart')) {
							// TODO deduplication
							shoppingCart.add(new ProductModel({
								name: $(card).attr('data-name'),
								options: [
									{
										price:  parseFloat(currentSize.attr('data-price')),
										size: parseFloat(currentSize.attr('data-size'))
									}
								]
							}));

							buyMeButton.addClass('in-cart');
							buyMeButton.text('In cart!');
							currentSize.attr('data-in-cart', 'true');
						}
					});
				});

				var positionCardContainer = function(container) {
					var leftOffset = Math.max(0, ($(window).width() - CARD_WIDTH) / 2) - CARD_CONTAINER_MARGIN;
					var cards = container.children('li');
					var selectedIndex = 0;

					_.each(cards, function(card, cardIndex) { if ($(card).hasClass('left-periphery')) { selectedIndex = cardIndex + 1; }});

					leftOffset = leftOffset - (selectedIndex * (CARD_WIDTH + 2*CARD_MARGIN));
					console.log('computed leftOffset: ' + leftOffset);
					container.css('left', leftOffset + 'px');
				};

				positionCardContainer(this.$el);

				$(window).resize((function($el) {
					return function() {
						positionCardContainer($el);
					};
				}(this.$el)));


				return this;
			},
			template: '' + 
				'<% _.each(products, function(product) { %>' +
					'<li data-name="<%= product.get("name") %>" >' +
						'<div class="left-control">&gt;</div>' +
						'<div class="img-container">' +
							'<img src="<%= imageResource(product.get("name")) %>" />' +
						'</div>' +
						'<div class="details-container">' +
							'<h1><%= product.get("name") %></h1>' +
							'<div class="price">$<%= product.get("options")[0].price.toFixed(2) %></div>' +
							'<ul class="sizes">' +
								'<% _.each(product.get("options"), function(option) { %>' +
									'<li data-price="<%= option.price %>" data-sold-out="<%= option.soldOut %>" data-size="<%= option.size %>" ><%= option.size %> oz</li>' +
								'<% }); %>' +
							'</ul>' +
							'<div style="clear:both;"></div>' +
							'<button class="btn btn-primary btn-large<%= product.get("options")[0].soldOut ? " sold-out" : "" %>" type="button">' +
								'<%= product.get("options")[0].soldOut ? "Sold out!" : "Buy me!" %>' +
							'</button>' +
						'</div>' +
						'<div class="right-control">&lt;</div>' +
					'</li>' +
				'<%}); %>'
		});

		// order view definition
		var OrderView = Backbone.View.extend({
			tagName: 'div',
			className: 'order-view',
			initialize: function() {
				var ordersViewEl = this.$el;
				ordersViewEl.append($('<span class="close-button">X</span>').click(function() {
					ordersViewEl.hide();
				}));
				ordersViewEl.append(
					'<div class="orders-container">' +
						'<ul class="orders"></ul>' +
						'<div id="confirmation"></div>' +
					'</div>'
				);
				$('#container').append(ordersViewEl);

				this.listenTo(this.collection, 'remove', this.render);
			},
			render: function() {
				var ordersContainer = this.$el.children('.orders-container');
				ordersContainer.children().empty();
				var $listEl = ordersContainer.children('ul.orders');
				var shoppingCart = this.collection;

				// fuck templates
				if (this.collection.length > 0) {
					this.collection.each(function(product) {
						var $listItem = $('<li />');

						$listItem
							.append($('<span>X</span>')
								.click(function () {
									shoppingCart.remove(product);
								})
							)
							.append('<strong>' + product.get("name") + '</strong>' + 
								' $' + product.get("options")[0].price.toFixed(2) + 
								' ' + product.get("options")[0].size + 'oz'
							);

						$listEl.append($listItem);

					});
				} else {
					$listEl.text('You have no items in your shopping cart');
				}

				this.$el.show();


			}
		});


		// set up page
		// first build the udnerlying collection
		var allProducts = new ProductCollection();
		_.each(productsJson, function(productData) {
			var product = new ProductModel({
				name: productData.name,
				options: _.map(productData.options, function(option) {
						option.soldOut = !!option.soldOut;
						return option;
					}).sort(function(optA, optB) {
						return optA.size - optB.size;
					})
			});

			allProducts.add(product);
		});

		// initialize a shopping cart
		var shoppingCart = new ProductCollection();


		// make a main view
		var mainView = new ProductListView({
			collection: allProducts,
			shoppingCart: shoppingCart
		}).render();

		var orderView = new OrderView({
			collection: shoppingCart
		});

		$('img.douchey-jar').click(function() {
			orderView.render();
		});

	}
);
