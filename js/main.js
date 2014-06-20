var Color = net.brehaut.Color;

(function() {
	function bindEvents() {

	}

	function Superloop() {
		bindEvents();
	};

	return Superloop;
})();

var Background = (function() {
	/**
	 * Private
	 **/
	var goo,
		ctx,
		tick = new Date().getTime(),
		color = new Color({ hue: 0, saturation: 0.6, value: 1}),
		objects = [];

	function random( min, max ) {
		return Math.random() * ( max - min ) + min;
	}

	function initializeGoo() {
		goo = new Goo({
			fullscreen: true,
			container: document.body,
			onDraw: onDraw
		});
	}

	function onDraw(g, tick) {
		g.ctx.clearRect(0, 0, g.width, g.height);

		g.ctx.fillStyle = g.userData.color.toCSS();
		g.ctx.fillRect(0, 0, g.width, g.height);

		g.userData.color = g.userData.color.shiftHue(180 * (tick - g.userData.tick) / 1000);
		g.userData.tick = tick;
	}


	function Particle( x, y ) {
		this.x = x;
		this.y = y;
		// track the past coordinates of each particle to create a trail effect, increase the coordinate count to create more prominent trails
		this.coordinates = [];
		this.coordinateCount = 5;
		while( this.coordinateCount-- ) {
			this.coordinates.push( [ this.x, this.y ] );
		}
		// set a random angle in all possible directions, in radians
		this.angle = random( 0, Math.PI * 2 );
		this.speed = random( 1, 10 );
		// friction will slow the particle down
		this.friction = 0.95;
		// gravity will be applied and pull the particle down
		this.gravity = 1;
		// set the hue to a random number +-20 of the overall hue variable
		this.hue = random( hue - 20, hue + 20 );
		this.brightness = random( 50, 80 );
		this.alpha = 1;
		// set how fast the particle fades out
		this.decay = random( 0.015, 0.03 );
	}

	// update particle
	Particle.prototype.update = function( index ) {
		// remove last item in coordinates array
		this.coordinates.pop();
		// add current coordinates to the start of the array
		this.coordinates.unshift( [ this.x, this.y ] );
		// slow down the particle
		this.speed *= this.friction;
		// apply velocity
		this.x += Math.cos( this.angle ) * this.speed;
		this.y += Math.sin( this.angle ) * this.speed + this.gravity;
		// fade out the particle
		this.alpha -= this.decay;

		// remove the particle once the alpha is low enough, based on the passed in index
		if( this.alpha <= this.decay ) {
			objects.splice( index, 1 );
		}
	}

	// draw particle
	Particle.prototype.draw = function() {
		goo.ctx. beginPath();
		// move to the last tracked coordinates in the set, then draw a line to the current x and y
		goo.ctx.moveTo( this.coordinates[ this.coordinates.length - 1 ][ 0 ], this.coordinates[ this.coordinates.length - 1 ][ 1 ] );
		goo.ctx.lineTo( this.x, this.y );
		goo.ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
		goo.ctx.stroke();
	}

	/**
	 * Constructor
	 **/
	function Background() {
		// Get the Color lib from it's namespace
		window.Color = net.brehaut.Color;

		initializeGoo();

		$('canvas').on('click', function() {
			fireRandomFirework();
		});
	}

	Background.prototype.createExplosion = function() {
		objects.push(new Particle(random(0, goo.width), random(0, goo.height / 2)));
	}

	return Background;
})();


var background;

$(function() {
	background = new Background();
})

// $(function() {
// 	console.log('Starting background rendering');

// 	var $body = $('body');
// 	var Color = net.brehaut.Color;

// 	var g = new Goo({
// 		userData: {
// 			tick: new Date().getTime(),
// 			color: new Color({ hue: 0, saturation: 0.6, value: 1})
// 		},
// 		fullscreen: true,
// 		// width: $body.width(),
// 		// height: $body.height(),
// 		container: document.body,
// 		onDraw: function(g, tick) {
// 			g.ctx.clearRect(0, 0, g.width, g.height);

// 			g.ctx.fillStyle = g.userData.color.toCSS();
// 			g.ctx.fillRect(0, 0, g.width, g.height);

// 			g.userData.color = g.userData.color.shiftHue(180 * (tick - g.userData.tick) / 1000);
// 			g.userData.tick = tick;
// 		}
// 	});
// });