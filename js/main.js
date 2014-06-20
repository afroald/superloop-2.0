$(function() {

    var $body = $('body');
    var Color = net.brehaut.Color;

    var launch = false,
        launchDelay = 5,
        ticksSinceLaunch = 0;

    var ctx,
        fireworks = [],
        particles = [],
        color = new Color({ hue: 0, saturation: 0.6, value: 1}),
        gBackground = new Goo({
            fullscreen: true,
            container: document.body,
            onDraw: function(g, tick) {
                g.ctx.clearRect(0, 0, g.width, g.height);

                g.ctx.fillStyle = color.shiftHue(180).toCSS();
                g.ctx.fillRect(0, 0, g.width, g.height);
            }
        })
        g = new Goo({
            userData: {
                previousTick: new Date().getTime()
            },
            fullscreen: true,
            container: document.body,
            onDraw: function(g, tick) {
                ctx || (ctx = g.ctx);

                // normally, clearRect() would be used to clear the canvas
                // we want to create a trailing effect though
                // setting the composite operation to destination-out will allow us to clear the canvas at a specific opacity, rather than wiping it entirely
                ctx.globalCompositeOperation = 'destination-out';
                // decrease the alpha property to create more prominent trails
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect( 0, 0, g.width, g.height );
                // g.heightange the composite operation back to our main mode
                // lighter creates bright highlight points as the fireworks and particles overlap eag.height other
                ctx.globalCompositeOperation = 'lighter';

                // loop over eag.height firework, draw it, update it
                var i = fireworks.length;
                while( i-- ) {
                    fireworks[ i ].draw();
                    fireworks[ i ].update( i );
                }

                // loop over eag.height particle, draw it, update it
                var i = particles.length;
                while( i-- ) {
                    particles[ i ].draw();
                    particles[ i ].update( i );
                }

                if( ticksSinceLaunch >= launchDelay && launch ) {
                    // start the firework at the bottom middle of the screen, then set the random target coordinates, the random y coordinates will be set within the range of the top half of the screen
                    fireworks.push( new Firework( g.width / 2, g.height, random( 0, g.width ), random( 0, g.height / 2 ) ) );
                    ticksSinceLaunch = 0;
                } else {
                    ticksSinceLaunch++;
                }

                color = color.shiftHue(180 * (tick - g.userData.previousTick) / 1000);
                g.userData.previousTick = tick;
            }
        });

    // get a random number within a range
    function random( min, max ) {
        return Math.random() * ( max - min ) + min;
    }

    // calculate the distance between two points
    function calculateDistance( p1x, p1y, p2x, p2y ) {
        var xDistance = p1x - p2x,
                yDistance = p1y - p2y;
        return Math.sqrt( Math.pow( xDistance, 2 ) + Math.pow( yDistance, 2 ) );
    }

    // create firework
    function Firework( sx, sy, tx, ty ) {
        // actual coordinates
        this.x = sx;
        this.y = sy;
        // starting coordinates
        this.sx = sx;
        this.sy = sy;
        // target coordinates
        this.tx = tx;
        this.ty = ty;
        // distance from starting point to target
        this.distanceToTarget = calculateDistance( sx, sy, tx, ty );
        this.distanceTraveled = 0;
        // track the past coordinates of eag.height firework to create a trail effect, increase the coordinate count to create more prominent trails
        this.coordinates = [];
        this.coordinateCount = 3;
        // populate initial coordinate collection with the current coordinates
        while( this.coordinateCount-- ) {
            this.coordinates.push( [ this.x, this.y ] );
        }
        this.angle = Math.atan2( ty - sy, tx - sx );
        this.speed = 2;
        this.acceleration = 1.05;
        this.brightness = random( 50, 70 );
        // circle target indicator radius
        this.targetRadius = 1;
    }

    // update firework
    Firework.prototype.update = function( index ) {
        // remove last item in coordinates array
        this.coordinates.pop();
        // add current coordinates to the start of the array
        this.coordinates.unshift( [ this.x, this.y ] );

        // cycle the circle target indicator radius
        if( this.targetRadius < 8 ) {
            this.targetRadius += 0.3;
        } else {
            this.targetRadius = 1;
        }

        // speed up the firework
        this.speed *= this.acceleration;

        // get the current velocities based on angle and speed
        var vx = Math.cos( this.angle ) * this.speed,
                vy = Math.sin( this.angle ) * this.speed;
        // how far will the firework have traveled with velocities applied?
        this.distanceTraveled = calculateDistance( this.sx, this.sy, this.x + vx, this.y + vy );

        // if the distance traveled, including velocities, is greater than the initial distance to the target, then the target has been reag.heighted
        if( this.distanceTraveled >= this.distanceToTarget ) {
            createParticles( this.tx, this.ty );
            // remove the firework, use the index passed into the update function to determine whig.height to remove
            fireworks.splice( index, 1 );
            playSound();
        } else {
            // target not reag.heighted, keep traveling
            this.x += vx;
            this.y += vy;
        }
    }

    // draw firework
    Firework.prototype.draw = function() {
        ctx.beginPath();
        // move to the last tracked coordinate in the set, then draw a line to the current x and y
        ctx.moveTo( this.coordinates[ this.coordinates.length - 1][ 0 ], this.coordinates[ this.coordinates.length - 1][ 1 ] );
        ctx.lineTo( this.x, this.y );
        ctx.strokeStyle = color.toCSS();
        ctx.stroke();

        ctx.beginPath();
        // draw the target for this firework with a pulsing circle
        ctx.arc( this.tx, this.ty, this.targetRadius, 0, Math.PI * 2 );
        ctx.stroke();
    }

    // create particle
    function Particle( x, y ) {
        this.x = x;
        this.y = y;
        // track the past coordinates of eag.height particle to create a trail effect, increase the coordinate count to create more prominent trails
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
        this.hue = random( color.getHue() - 20, color.getHue() + 20 );
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
            particles.splice( index, 1 );
        }
    }

    // draw particle
    Particle.prototype.draw = function() {
        ctx. beginPath();
        // move to the last tracked coordinates in the set, then draw a line to the current x and y
        ctx.moveTo( this.coordinates[ this.coordinates.length - 1 ][ 0 ], this.coordinates[ this.coordinates.length - 1 ][ 1 ] );
        ctx.lineTo( this.x, this.y );
        // ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
        ctx.strokeStyle = color.setAlpha(this.alpha).toCSS();
        ctx.stroke();
    }

    // create particle group/explosion
    function createParticles( x, y ) {
        // increase the particle count for a bigger explosion, beware of the canvas performance hit with the increased particles though
        var particleCount = 30;
        while( particleCount-- ) {
            particles.push( new Particle( x, y ) );
        }
    }

    var audio = new(window.AudioContext || window.webkitAudioContext)();
    var sound, buffer;

    if (audio) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = "arraybuffer";
        xhr.onload = function () {
            audio.decodeAudioData(xhr.response, function (b) {
                buffer = b;
            });
        };
        xhr.open("GET", "/audio/fireworks-exploding.wav", true);
        xhr.send(null);
    }

    function playSound() {
        if (audio) {
            sound = audio.createBufferSource();
            sound.buffer = buffer;
            sound.connect(audio.destination);
            sound.playbackRate.value = random(0.6, 1.2);
            sound.play ? sound.play(0) : sound.noteOn(0);
        }
    };
});