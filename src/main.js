'use strict';

// if app exists use the existing copy
// else create a new object literal
var app = app || {};

app.main = (function()
{	
	// these variables are in "Script scope" and will be available in this and other .js files
	const ctx = document.querySelector('canvas').getContext('2d');
	
	// game variables
	const GAME_STATES = Object.freeze(
	{
		START	:	Symbol('START'),
		TUTOR	: 	Symbol('TUTOR'),
		SIMUL	:	Symbol('SIMUL'),
		GOVER	:	Symbol('GOVER'),
		STORE	:	Symbol('STORE')
	});
	let gameState = GAME_STATES.START;
	let gameVar = 
	{
		level 	: 0,
		ability	: [''],
		
		x	: canvas.width/2,
		y	: canvas.height/2,
		
		fwd : {x : 0, y : 0},
		slow: .25,
		
		color	:	'#FFFFFF',
		
		bgnr	: true		
	};
	
	let Option = 
	{
		chance	: 	0.0005,
		speed	: 	.1,
		colorMod:	5
	}
	
	const Color	= 
	{
		back 	:	'#000000',
		fill	:	'#FFFFFF'
	};
	
	const Sound = {	};
	
	let image = new Image();
	
	let screenWidth = canvas.width;
	let screenHeight = canvas.height;
	
	let sprites = [];
	//let clickBoxes = [];
	let bullet = [];
	
	let spawner = app.spawner;	// ALIAS
	let helper = app.helper;
	

	function init()
	{
		resizeCanvas();
		
		// setup listeners
		canvas.onmousedown = MouseDown;
		window.addEventListener('keydown', move);
		window.addEventListener('keyup', move);
		
		window.addEventListener('keydown', Keytracker);
		
		screenHeight = canvas.height;
		screenWidth = canvas.width;
		
		image = document.querySelector('#imgSource');
		
		// load audio
		Sound.keySound = new Howl({
			src: ['assets/sound/keypress.mp3'],
			volume: 0.2
		});
		
		Sound.deadSound = new Howl({
			src: ['assets/sound/lose.mp3'],
			volume: 0.2
		});
		
		Sound.growSound = new Howl({
			src: ['assets/sound/heal.mp3'],
			volume: 0.1
		});
		
		Sound.badGrowSound = new Howl({
			src: ['assets/sound/bGrow.mp3'],
			volume: 0.25
		});
		
		Sound.melody = new Howl({
			src: ['assets/sound/melody.mp3'],
			loop		: true,
			volume: 0.4
		});
		
		
		loop();
	}
	
	function gameInit()
	{
		let margin = 50;
		let rect = {left: margin, top: margin, width: screenWidth - margin*2, height: screenHeight - margin*2};
		
		if(gameVar.level === 1)
		{
			let player 	= spawner.createSpawn(1, 8, '#FFFFFF', 'hunger', rect);
			
			let smSprite = spawner.createSpawn(32, 4, '#38F3AB', 'smPllt', rect);
			
			let lgSprite = spawner.createSpawn(8, 16, '#B10D36', 'lgPllt', rect);
			
			let bfSprite = spawner.createSpawn(4, 8, '#129EB0', 'btmFdr', rect);
			
			sprites = player.concat(smSprite, lgSprite, bfSprite);
		}
		else if (gameVar.level === 2)
		{
			let smSprite = spawner.createSpawn(24, 4, '#129EB0', 'smPllt', rect);
			
			let lgSprite = spawner.createSpawn(8, 16, '#FA5B3D', 'lgPllt', rect);
			
			let bfSprite = spawner.createSpawn(8, 17, '#BFFF00', 'btmFdr', rect);
			
			//rect = {left: margin, top: margin, width: screenWidth - margin*8, height: screenHeight - margin*8};
			
			sprites = sprites.concat(smSprite, lgSprite, bfSprite);
		}
		else if (gameVar.level === 3)
		{
			let smSprite = spawner.createSpawn(32, 4, '#FA5B3D', 'smPllt', rect);
			let bgSprite = spawner.createSpawn(16, 8, '#BFFF00', 'smPllt', rect);
			
			let lgSprite = spawner.createSpawn(8, 16, '#BFFF00', 'lgPllt', rect);
			let hgSprite = spawner.createSpawn(2, 32, '#BFFF00', 'lgPllt', rect);
			
			let bfSprite = spawner.createSpawn(8, 24, '#B10D36', 'btmFdr', rect);
			
			sprites = sprites.concat(smSprite, bgSprite, lgSprite, hgSprite, bfSprite);
		}
		else if (gameVar.level >= 4)
		{
			let aColor = '#BFFF00';
			let bColor = '#B10D36';
			let cColor = '#004AFF';
			let dColor = '#38F3AB';
			let eColor = '#FA5B3D';
			
			let smSprite = spawner.createSpawn(gameVar.level * 8, 4, aColor, 'smPllt', rect);
			let bgSprite = spawner.createSpawn(gameVar.level * 4, 8, bColor, 'smPllt', rect);
			
			let lgSprite = spawner.createSpawn(gameVar.level * 2, 16, cColor, 'lgPllt', rect);
			let hgSprite = spawner.createSpawn(gameVar.level * 1, 32, dColor, 'lgPllt', rect);
			
			let bfSprite = spawner.createSpawn(8, gameVar.level * 8, eColor, 'btmFdr', rect);
			
			sprites = sprites.concat(smSprite, bgSprite, lgSprite, hgSprite, bfSprite);
		}
		
		
	}
	
	function storePopulate()
	{
		ctx.save();
				
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';	
		
		if(gameVar.level === 1)
		{
			helper.fillText(ctx, 'SPEED INCREASE', screenWidth/2, screenHeight/2 + screenHeight/8, "300% 'VT323', cursive", Color.fill);
		}
		else if(gameVar.level === 2)
		{
			helper.fillText(ctx, 'ACID SHOT', screenWidth/2, screenHeight/2 + screenHeight/8, "300% 'VT323', cursive", Color.fill);
			helper.fillText(ctx, 'ARROW KEYS TO STUN', screenWidth/2, screenHeight/2 + screenHeight/4, "300% 'VT323', cursive", Color.fill);
		}
		else if(gameVar.level === 3)
		{
			helper.fillText(ctx, 'ARMOR', screenWidth/2, screenHeight/2 + screenHeight/8, "300% 'VT323', cursive", Color.fill);
			helper.fillText(ctx, 'ONE FREE HIT', screenWidth/2, screenHeight/2 + screenHeight/4, "300% 'VT323', cursive", Color.fill);
		}
		else if(gameVar.level >= 4)
		{
			helper.fillText(ctx, 'MAX MUTATION ACHIEVED', screenWidth/2, screenHeight/2 + screenHeight/8, "300% 'VT323', cursive", Color.fill);
		}
		
		ctx.restore();
	}
	
	function mutation()
	{
		// mutate
		if(gameVar.level === 1)
		{
			sprites[0].reflexes++;
			sprites[0].reflexes++;
			sprites[0].speed += .25;
		}
		else if(gameVar.level === 2)
		{
			sprites[0].ability.stun = true;
		}
		else if(gameVar.level === 3)
		{
			sprites[0].ability.shield = true;
		}
		else if(gameVar.level >= 4)
		{
			// DO NOTHING FOR NOW
		}
	}

	function loop()
	{
		// schedule a call to loop() in 1/60th of a second
		requestAnimationFrame(loop);
		
		// size the canvas to fit the environment
		resizeCanvas();
		screenHeight = canvas.height;
		screenWidth = canvas.width;

		// draw background
		ctx.fillRect(0, 0, screenWidth, screenHeight);

		// loop through sprites
		drawState(ctx);
	}
	
	function drawState(ctx)
	{
		ctx.save();
		
		switch(gameState)
		{
			case GAME_STATES.START:
				ctx.save();
				
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';				
				
				helper.fillText(ctx, 'SPAWN', screenWidth/2, screenHeight/4+10, "600% 'Press Start 2P', cursive", '#AF111C');
				helper.strokeText(ctx, 'SPAWN', screenWidth/2, screenHeight/4+10, 2, "600% 'Press Start 2P', cursive", '#AF111C');
				helper.fillText(ctx, 'SPAWN', screenWidth/2, screenHeight/4, "600% 'Press Start 2P', cursive", Color.back);
				helper.strokeText(ctx, 'SPAWN', screenWidth/2, screenHeight/4, 2, "600% 'Press Start 2P', cursive", Color.fill);
				
				helper.fillText(ctx, 'INSERT TOKEN', screenWidth/2, screenHeight/2 + screenHeight/4, "300% 'VT323', cursive", Color.fill);
				
				ctx.restore();
				break;
			
			case GAME_STATES.TUTOR:
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';	
				
				helper.fillText(ctx, 'USE WASD TO MOVE', screenWidth/2, screenHeight/8, "300% 'VT323', cursive", Color.fill);
				
				helper.fillText(ctx, 'AVOID GREATER', screenWidth/2, screenHeight/2 - screenHeight/16, "300% 'VT323', cursive", Color.fill);
				
				helper.fillText(ctx, 'CONSUME LESSER', screenWidth/2, screenHeight/2 + screenHeight/16, "300% 'VT323', cursive", Color.fill);
				
				helper.fillText(ctx, 'EVOLVE', screenWidth/2, screenHeight - screenHeight/8, "300% 'VT323', cursive", Color.fill);
				break;
				
			case GAME_STATES.SIMUL:
				checkEdges();
				ctx.save();
				
				let count = 0;
				checkProjectile();
				
				for (let b of bullet)
				{
					b.draw(ctx);
				}
				
				for (let s of sprites)
				{
					if(s === sprites[0])
					{
						s.draw(ctx);
						for (let t of sprites)
						{
							if(t !== s)
							{
								s.bounds(t);
							}
							if(sprites[0].ability.stun === true)
							{
								for (let b of bullet)
								{
									if(t !== sprites[0])
										b.bounds(t);
								}
							}
						}
						
						if(sprites[0].ability.collide === true)
						{
							updateTimer(5);
						}
					}
					else
					{
						if (Math.random() < Option.chance)
						{
							s.fwd = getRandomUnitVector();
						}
						s.draw(ctx);
						for (let t of sprites)
						{
							if(t !== s && t !== sprites[0])
							{
								s.bounds(t);
							}
							
						}
					}
					if(s.dead === true)
					{
						if(s === sprites[0])
						{
							gameState = GAME_STATES.GOVER;
							Sound.deadSound.play();
						}
						sprites.splice(count, 1);
					}
					
					count++;
				}
				
				// check if only predators remain
				if(sprites.length === 1)
				{
					//window.setTimeout(loadEffect, 1500)
					gameState = GAME_STATES.STORE;
				}
				
				ctx.restore();
				break;
			
			case GAME_STATES.STORE:
				ctx.save();
				
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				
				if(screenHeight < 400)
				{
					helper.fillText(ctx, 'MUTATION', screenWidth/2, screenHeight/4+10, "400% 'Press Start 2P', cursive", '#C1FF1A');
					helper.strokeText(ctx, 'MUTATION', screenWidth/2, screenHeight/4+10, 2, "400% 'Press Start 2P', cursive", '#C1FF1A');
					helper.fillText(ctx, 'MUTATION', screenWidth/2, screenHeight/4, "400% 'Press Start 2P', cursive", Color.back);
					helper.strokeText(ctx, 'MUTATION', screenWidth/2, screenHeight/4, 2, "400% 'Press Start 2P', cursive", Color.fill);
					
					storePopulate();
					//helper.fillText(ctx, 'MUTATION', screenWidth/2, screenHeight/16, "200% 'VT323', cursive", '#C1FF1A');
					//helper.fillText(ctx, 'MUTATION', screenWidth/2, screenHeight/16 - 4, "200% 'VT323', cursive", fill);
				}
				else
				{
					helper.fillText(ctx, 'MUTATION', screenWidth/2, screenHeight/4+10, "400% 'Press Start 2P', cursive", '#C1FF1A');
					helper.strokeText(ctx, 'MUTATION', screenWidth/2, screenHeight/4+10, 2, "400% 'Press Start 2P', cursive", '#C1FF1A');
					helper.fillText(ctx, 'MUTATION', screenWidth/2, screenHeight/4, "400% 'Press Start 2P', cursive", Color.back);
					helper.strokeText(ctx, 'MUTATION', screenWidth/2, screenHeight/4, 2, "400% 'Press Start 2P', cursive", Color.fill);
					
					
					storePopulate();
					//helper.fillText(ctx, 'MUTATION', screenWidth/2, screenHeight/16, "400% 'VT323', cursive", '#C1FF1A');
					//helper.fillText(ctx, 'MUTATION', screenWidth/2, screenHeight/16 - 6, "400% 'VT323', cursive", fill);
				}
				
				ctx.restore();
				break;
						
			case GAME_STATES.GOVER:
				ctx.save();
				
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';				
				
				ctx.drawImage(image, screenWidth/2 - image.width/2, screenHeight/2.5, image.width, image.height);
				
				helper.fillText(ctx, 'GAMEOVER', screenWidth/2, screenHeight/4+10, "400% 'Press Start 2P', cursive", '#AF111C');
				helper.strokeText(ctx, 'GAMEOVER', screenWidth/2, screenHeight/4+10, 2, "400% 'Press Start 2P', cursive", '#AF111C');
				helper.fillText(ctx, 'GAMEOVER', screenWidth/2, screenHeight/4, "400% 'Press Start 2P', cursive", Color.back);
				helper.strokeText(ctx, 'GAMEOVER', screenWidth/2, screenHeight/4, 2, "400% 'Press Start 2P', cursive", Color.fill);
				
				ctx.restore();
				break;
				
			//case GAME_STATES.START:
			//	break;
				
		}
		
		ctx.restore();
	}
	
	function checkEdges()
	{
		for (let s of sprites)
		{
			if(s === sprites[0])
			{
				// set fwd value of HUNGER_SPAWN to player's current value
				sprites[0].fwd = gameVar.fwd;
				
				// move the HUNGER_SPAWN
				sprites[0].move();
				
				if(s.radius)
				{
					// a circle
					if (s.x <= s.radius || s.x >= screenWidth-s.radius)
					{
						s.fwd.x = 0;
						
						if(s.x <= s.radius)
							s.x = s.radius;
						else if(s.x >= screenWidth - s.radius)
							s.x = screenWidth - s.radius;
					}
					
					if (s.y <= s.radius || s.y >= screenHeight-s.radius)
					{
						s.fwd.y = 0;
						
						if(s.y <= s.radius)
							s.y = s.radius;
						else if(s.y >= screenHeight - s.radius)
							s.y = screenHeight - s.radius;
					}
				}
			}
				
			else
			{
				// move sprites
				s.move();

				// check sides and bounce
				if(s.radius)
				{
					// a circle
					if (s.x <= s.radius || s.x >= screenWidth-s.radius)
					{
						s.reflectX();
						s.move();
					}
					if (s.y <= s.radius || s.y >= screenHeight-s.radius)
					{
						s.reflectY();
						s.move();
					}
				}
				if(s.size)
				{
					// a polygon
					if (s.x <= s.size || s.x >= screenWidth-s.size)
					{
						s.reflectX();
						s.move();
					}
					if (s.y <= s.size || s.y >= screenHeight-s.size)
					{
						s.reflectY();
						s.move();
					}
				}
				else
				{ // `s` is NOT a circle
					// left and right
					if (s.x <= 0 || s.x >= screenWidth-s.width)
					{
						s.reflectX();
						s.move();
					}
					if(s.y <= 0 || s.y >= screenHeight-s.height)
					{
						s.reflectY();
						s.move();
					}
				}
			}
			
		}
	}
	
	function MouseDown(e)
	{
		let mouse = getMouse(e);
		
		if(gameState != GAME_STATES.SIMUL || gameState != GAME_STATES.STORE)
		{
			Sound.keySound.play();
		}
		
		switch(gameState)
		{
			case GAME_STATES.START:
				gameState = GAME_STATES.SIMUL;
				gameVar.level = 1;
				if(gameVar.bgnr === true)
				{
					gameState = GAME_STATES.TUTOR;
				}
				else
				{
					gameInit();
				}
				Sound.melody.play();
				break;
			case GAME_STATES.TUTOR:
				gameState = GAME_STATES.SIMUL;
				gameInit();
				gameVar.bgnr = false;
				break;
			case GAME_STATES.SIMUL:
				
				break;
			case GAME_STATES.STORE:
				gameVar.level++;
				
				gameState = GAME_STATES.SIMUL;
				
				// set player shift
				sprites[0].radius   = 8;
				sprites[0].size 	= 2;
				sprites[0].sides	= 4;
				
				sprites[0].ability.shieldTimer 	= 1500;
				sprites[0].ability.ammo			= 4;
				
				// mutate
				mutation();
				
				gameInit();
				
				break;
			case GAME_STATES.GOVER:
				gameState = GAME_STATES.START;
				
				gameVar.level = 0;
				sprites = [];
				
				Sound.melody.stop();
				break;
		}	
	}
	
	function move(e)
    {
		if(KEYS[KEYBOARD.NORTH])
		{
			gameVar.fwd.y -= sprites[0].speed;
			
			if(gameVar.fwd.y < -sprites[0].reflexes)
			{
				gameVar.fwd.y = -sprites[0].reflexes;
			}
		}
		else if(KEYS[KEYBOARD.SOUTH])
		{
			gameVar.fwd.y += sprites[0].speed;
			
			if(gameVar.fwd.y > sprites[0].reflexes)
			{
				gameVar.fwd.y = sprites[0].reflexes;
			}
		}
		else
		{
			gameVar.fwd.y = 0;
		}
		
		if(KEYS[KEYBOARD.WEST])
		{
			gameVar.fwd.x -= sprites[0].speed;
			
			if(gameVar.fwd.x < -sprites[0].reflexes)
			{
				gameVar.fwd.x = -sprites[0].reflexes;
			}
		}
		else if(KEYS[KEYBOARD.EAST])
		{
			gameVar.fwd.x += sprites[0].speed;
			
			if(gameVar.fwd.x > sprites[0].reflexes)
			{
				gameVar.fwd.x = sprites[0].reflexes;
			}
		}
		else
		{	
			gameVar.fwd.x = 0;
		}
    }
	
	function Keytracker(e)
	{
		if(KEYS[KEYBOARD.BACK])
		{
			for(let s of sprites)
			{
				s.ability.debug = !s.ability.debug;
			}
		}
		
		if(KEYS[KEYBOARD.UP])
		{
			if(sprites[0].ability.stun === true && sprites[0].ability.ammo >= 1)
			{
				sprites[0].ability.ammo--;

				let fwd = {x: 0, y: -1};

				fireProjectile(fwd);
			}
		}
		if(KEYS[KEYBOARD.LEFT])
		{
			if(sprites[0].ability.stun === true && sprites[0].ability.ammo >= 1)
			{
				sprites[0].ability.ammo--;

				let fwd = {x: -1, y: 0};

				fireProjectile(fwd);
			}
		}
		if(KEYS[KEYBOARD.RIGHT])
		{
			if(sprites[0].ability.stun === true && sprites[0].ability.ammo >= 1)
			{
				sprites[0].ability.ammo--;

				let fwd = {x: 1, y: 0};

				fireProjectile(fwd);
			}
		}
		if(KEYS[KEYBOARD.DOWN])
		{
			if(sprites[0].ability.stun === true && sprites[0].ability.ammo >= 1)
			{
				sprites[0].ability.ammo--;

				let fwd = {x: 0, y: 1};

				fireProjectile(fwd);
			}
		}
	}
	
	function updateTimer(time)
	{
		sprites[0].ability.shieldTimer -= time;
	}
	
	function fireProjectile(direction)
	{
		bullet.push(spawner.createBullet(sprites[0].x, sprites[0].y, direction,  2, '#FFFFFF'));
	}
	
	function checkProjectile()
	{
		let count = 0;		
		for(let b of bullet)
		{
			b.move();
			if (b.x <= b.radius || b.x >= screenWidth - b.radius)
			{
				bullet.splice(count, 1);
			}
			if (b.y <= b.radius || b.y >= screenHeight - b.radius)
			{
				bullet.splice(count, 1);
			}
			count++;
		}
	}
	
	return	{
		init	:	init,
		option	:	Option,
		sound	:	Sound
	};
})();