(function() {
	function bindEvents() {
		
	}

	function Superloop() {
		bindEvents();
	};

	return Superloop;
})();

$(function() {
	console.log('Starting background rendering');

	var $body = $('body');
	var Color = net.brehaut.Color;

	var g = new Goo({
		userData: {
			tick: new Date().getTime(),
			color: new Color({ hue: 0, saturation: 0.6, value: 1})
		},
		fullscreen: true,
		// width: $body.width(),
		// height: $body.height(),
		container: document.body,
		onDraw: function(g, tick) {
			g.ctx.clearRect(0, 0, g.width, g.height);

			g.ctx.fillStyle = g.userData.color.toCSS();
			g.ctx.fillRect(0, 0, g.width, g.height);

			g.userData.color = g.userData.color.shiftHue(180 * (tick - g.userData.tick) / 1000);
			g.userData.tick = tick;
		}
	});
});