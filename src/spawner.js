'use strict';

var app = app || {};

app.spawner = (function()
{	
	class spawn 
	{
		constructor(x, y, fwd, speed)
		{
			this.x		= 0;
			this.y		= 0;
			this.width	= 0;
			this.height	= 0;
			
			this.fwd	= {x : 0, y : 1};
			this.speed	= 0 * app.main.option.speed;
			
			this.size	= 0;
			this.value	= 0;
			this.ability= {};
			this.dead	= false;
			this.ability.debug = false;
		}

		move()
		{
			this.x += this.fwd.x * this.speed;
			this.y += this.fwd.y * this.speed;
		}

		reflectX()
		{
			this.fwd.x *= -1;
		}
		reflectY()
		{
			this.fwd.y *= -1;
		}
		
		consume(obj)
		{
			// check if this is a bullet
			if(this.bullet === true)
			{
				obj.fwd.x = 0;
				obj.fwd.y = 0;
				
				return false;
			}
			
			// mark the smaller spawn for deletion
			obj.dead = true;

			// absorb the smaller spawn's energy
			this.radius += obj.value;	// this will need to be changed later
			this.value += obj.value;
			this.size += obj.value;

			// if player, increase amount of sides
			if(this.size / 4 >= this.sides - 2)
				this.sides++;
			//console.log(this.size);

			// adjust hit detection for new size
			this.width	= this.radius;
			this.height	= this.radius;

			// play the grow sound
			if(this.ability.player === true)
			{
				app.main.sound.growSound.play();
			}
			else
			{
				app.main.sound.badGrowSound.play();
			}
		}
		
		bounds(obj) 
		{
			if(this.width <= 0 || this.height <=0)
				return false;
						
			else if ((this.x - this.width) + this.width * 2 > obj.x - obj.width && this.x - this.width < (obj.x - obj.width) + obj.width * 2 && (this.y - this.height) + this.height * 2 > obj.y - obj.height && this.y - this.height < (obj.y - obj.height) + obj.height * 2)
			{
				if(obj.size === this.size || (this.ability.food === true && obj.ability.food === true))
				{
					//// collision check
					//this.color = '#FFFFFF';
					//obj.color	= '#FFFFFF';
					let r = getRandom(0, 4);
					
					if(r >= 0 && r < 1)
					{
						this.fwd.x = obj.fwd.x;
						obj.fwd.y = this.fwd.y;
					}
					
					else if(r >= 1 && r < 2)
					{
						let y = this.fwd.y;
						this.fwd.x = obj.fwd.y;
						obj.fwd.x = y;
					}
					
					else if(r >= 2 && r < 3)
					{
						let x = this.fwd.x;
						this.fwd.x = obj.fwd.y;
						obj.fwd.y = x;
					}
					
					else if(r >= 3 && r <= 4)
					{
						let x = obj.fwd.x;
						obj.fwd.x = this.fwd.x;
						this.fwd.y = x;
					}
				}
				// if one of the objects is food, it cannot consume a smaller predator spawn
				else if((this.size < obj.size && this.ability.pred === true && obj.ability.food === true) || (this.size > obj.size && this.ability.food === true && obj.ability.pred === true))
				{
					this.fwd = getRandomUnitVector();
					obj.fwd = getRandomUnitVector();
				}
				else if(this.size > obj.size)
				{
					if((obj.ability.player === true && obj.ability.shield === true && obj.ability.shieldTimer > 0))
					{
						obj.ability.collide = true;
					}
					else
					{
						this.consume(obj);
					}
				}
				else if(this.size < obj.size)
				{
					if((this.ability.player === true && this.ability.shield === true && this.ability.shieldTimer > 0))
					{
						this.ability.collide = true;
					}
					else
					{
						obj.consume(this);
					}
				}
			}
		}
	}

	class Pellet_Small extends spawn
	{
		constructor(radius, color, rect)
		{
			super();
			this.radius = radius;
			this.color 	= color;
			this.x		= Math.random() * rect.width + rect.left;
			this.y		= Math.random() * rect.height + rect.top;
			this.width	= this.radius * 2;
			this.height	= this.radius * 2;
			this.fwd	= getRandomUnitVector();
			
			this.speed	= Math.random() * (.05 + app.main.option.speed);
			this.value	= radius / 4;
			this.size 	= radius / 4;
			this.ability.food = true;
			this.dead	= false;
		}
		draw(ctx)
		{
			ctx.save();
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
			ctx.closePath();
			ctx.fillStyle = this.color;
			ctx.fill();
			
			ctx.beginPath();
			ctx.arc(this.x - this.radius, this.y, this.radius/2, 0, Math.PI*2, false);
			ctx.closePath();
			ctx.fillStyle = this.color;
			ctx.fill();
			
			ctx.beginPath();
			ctx.arc(this.x, this.y - this.radius, this.radius/2, 0, Math.PI*2, false);
			ctx.closePath();
			ctx.fillStyle = this.color;
			ctx.fill();
			
			ctx.beginPath();
			ctx.arc(this.x + this.radius, this.y, this.radius/2, 0, Math.PI*2, false);
			ctx.closePath();
			ctx.fillStyle = this.color;
			ctx.fill();
			
			ctx.beginPath();
			ctx.arc(this.x, this.y + this.radius, this.radius/2, 0, Math.PI*2, false);
			ctx.closePath();
			ctx.fillStyle = this.color;
			ctx.fill();
			
			if(this.ability.debug)
			{
				ctx.beginPath();
				ctx.moveTo(this.x - this.width, this.y - this.height);
				ctx.lineTo((this.x - this.width) + this.width * 2, this.y - this.height);
				ctx.lineTo((this.x - this.width) + this.width * 2, (this.y - this.height) + this.height * 2);
				ctx.lineTo(this.x - this.width, (this.y - this.height) + this.height * 2);
				ctx.closePath();
				ctx.strokeStyle = '#FFFFFF';
				ctx.stroke();
			}
			
			ctx.restore();
		}
	}
	
	class Pellet_Large extends spawn
	{
		constructor(radius, color, rect)
		{
			super();
			this.radius = radius;
			this.color 	= color;
			this.x		= Math.random() * rect.width + rect.left;
			this.y		= Math.random() * rect.height + rect.top;
			
			this.width	= this.radius;
			this.height	= this.radius;
			
			this.fwd	= getRandomUnitVector();
			this.speed	= Math.random() * (.05 + app.main.option.speed);
			
			this.value	= 4;
			this.size 	= radius;
			this.ability.food = true;
			this.dead	= false;
		}
		draw(ctx)
		{
			ctx.save();
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
			ctx.closePath();
			ctx.fillStyle = this.color;
			ctx.fill();
			
			ctx.beginPath();
			ctx.arc(this.x - this.radius, this.y, this.radius/2, 0, Math.PI*2, false);
			ctx.closePath();
			ctx.fillStyle = this.color;
			ctx.fill();
			
			ctx.beginPath();
			ctx.arc(this.x, this.y - this.radius, this.radius/2, 0, Math.PI*2, false);
			ctx.closePath();
			ctx.fillStyle = this.color;
			ctx.fill();
			
			ctx.beginPath();
			ctx.arc(this.x + this.radius, this.y, this.radius/2, 0, Math.PI*2, false);
			ctx.closePath();
			ctx.fillStyle = this.color;
			ctx.fill();
			
			ctx.beginPath();
			ctx.arc(this.x, this.y + this.radius, this.radius/2, 0, Math.PI*2, false);
			ctx.closePath();
			ctx.fillStyle = this.color;
			ctx.fill();
			
			if(this.ability.debug)
			{
				ctx.beginPath();
				ctx.moveTo(this.x - this.width, this.y - this.height);
				ctx.lineTo((this.x - this.width) + this.width * 2, this.y - this.height);
				ctx.lineTo((this.x - this.width) + this.width * 2, (this.y - this.height) + this.height * 2);
				ctx.lineTo(this.x - this.width, (this.y - this.height) + this.height * 2);
				ctx.closePath();
				ctx.strokeStyle = '#FFFFFF';
				ctx.stroke();
			}
			
			ctx.restore();
		}
	}
	
	class Bottom_Feeder extends spawn
	{
		constructor(radius, color, rect)
		{
			super();
			this.radius = radius;
			this.color 	= color;
			this.x		= Math.random() * rect.width + rect.left;
			this.y		= Math.random() * rect.height + rect.top;
			this.width	= this.radius;
			this.height	= this.radius;
			this.fwd	= getRandomUnitVector();
			
			this.speed	= Math.random() * (.2 + app.main.option.speed);
			this.value	= radius / 4;
			this.size 	= radius / 4;
			this.dead	= false;
			
			this.ability.pred = true;
		}
		draw(ctx)
		{
			ctx.save();
			
			if(this.ability.debug)
			{
				ctx.beginPath();
				ctx.moveTo(this.x - this.width, this.y - this.height);
				ctx.lineTo((this.x - this.width) + this.width * 2, this.y - this.height);
				ctx.lineTo((this.x - this.width) + this.width * 2, (this.y - this.height) + this.height * 2);
				ctx.lineTo(this.x - this.width, (this.y - this.height) + this.height * 2);
				ctx.closePath();
				ctx.strokeStyle = '#FFFFFF';
				ctx.stroke();
			}
			
			ctx.translate(this.x, this.y);
						
			ctx.beginPath();
			
			ctx.moveTo(0 - this.width, 0);
			ctx.lineTo(0, 0 - this.height);
			ctx.lineTo(this.width, 0);
			ctx.lineTo(0, this.height);
			
			ctx.closePath();
			
			ctx.fillStyle = this.color;
			ctx.fill();
			
			ctx.beginPath();
			
			ctx.moveTo(0 - this.width/1.5, 0 - this.height/1.5);
			ctx.lineTo(this.width/1.5, 0 - this.height/1.5);
			ctx.lineTo(this.width/1.5, this.height/1.5);
			ctx.lineTo(0 - this.width/1.5, this.height/1.5);
			
			ctx.closePath();
			
			
			ctx.fill();
			
			ctx.beginPath();
			
			ctx.moveTo(0 - this.width/2, 0);
			ctx.lineTo(0, 0 - this.height/2);
			ctx.lineTo(this.width/2, 0);
			ctx.lineTo(0, this.height/2);
			
			ctx.closePath();
			
			ctx.fillStyle = '#000000';
			ctx.fill();
			
			ctx.beginPath();
			
			ctx.moveTo(0 - this.width/3, 0 - this.height/3);
			ctx.lineTo(this.width/3, 0 - this.height/3);
			ctx.lineTo(this.width/3, this.height/3);
			ctx.lineTo(0 - this.width/3, this.height/3);
			
			ctx.closePath();
			
			ctx.fill();
			
			ctx.restore();
		}
	}

	class Hungerer extends spawn
	{
		constructor(radius, color, sides, rect)
		{
			super();
			this.radius = radius;
			this.sides	= sides;
			this.color 	= color;
			this.x		= rect.width/2;
			this.y		= rect.height/2;
			this.width	= this.radius;
			this.height	= this.radius;
			
			
			this.fwd	= {x : 0, y: 0};
			this.speed		= .5;
			this.reflexes	= 2;
			
			this.size 	= 2;
			this.value	= 0;
			
			this.ability.player = true;
			this.ability.pred = true;
			
			this.ability.shield = false;
			this.ability.shieldTimer = 1500;
			this.ability.currTimer = 1500;
			this.ability.collide	= false;
			
			this.ability.stun = false;
			this.ability.ammo = 3;
		}
		draw(ctx)
		{
			ctx.save();
			ctx.fillStyle = this.color;
			ctx.strokeStyle = this.color;
			ctx.lineWidth = 2;
			ctx.beginPath();

			ctx.moveTo(this.x + this.radius * Math.sin(0), this.y + this.radius * Math.cos(0));

			for(let x = 1; x < this.sides; x++)
			{
				ctx.lineTo(this.x + this.radius * Math.sin(x * Math.PI * 2 / this.sides), this.y + this.radius * Math.cos(x * Math.PI * 2 / this.sides));
			}
			ctx.closePath();

			ctx.fill();
			
			ctx.lineWidth = this.radius/2;
			ctx.strokeStyle = '#000000';
			ctx.stroke();
			
			ctx.lineWidth = 1;
			ctx.strokeStyle = this.color;
			ctx.stroke();
			
			if(this.ability.debug)
			{
				ctx.beginPath();
				ctx.moveTo(this.x - this.width, this.y - this.height);
				ctx.lineTo((this.x - this.width) + this.width * 2, this.y - this.height);
				ctx.lineTo((this.x - this.width) + this.width * 2, (this.y - this.height) + this.height * 2);
				ctx.lineTo(this.x - this.width, (this.y - this.height) + this.height * 2);
				ctx.closePath();
				ctx.strokeStyle = '#FFFFFF';
				ctx.stroke();
			}

			ctx.restore();
		}
	}
	
	class StunGun extends spawn
	{
		constructor(x, y, fwd, radius, color)
		{
			super();
			this.radius = radius;
			this.color 	= color;
			this.x		= x;
			this.y		= y;
			this.width	= this.radius * 2;
			this.height	= this.radius * 2;
			this.fwd	= fwd;
			
			this.speed	= 5;
			this.size	= 1000;
			this.dead	= false;
			this.bullet	= true;
		}
		draw(ctx)
		{
			ctx.save();
			
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
			ctx.closePath();
			ctx.fillStyle = this.color;
			ctx.fill();
			
			if(this.ability.debug)
			{
				ctx.beginPath();
				ctx.moveTo(this.x - this.width, this.y - this.height);
				ctx.lineTo((this.x - this.width) + this.width * 2, this.y - this.height);
				ctx.lineTo((this.x - this.width) + this.width * 2, (this.y - this.height) + this.height * 2);
				ctx.lineTo(this.x - this.width, (this.y - this.height) + this.height * 2);
				ctx.closePath();
				ctx.strokeStyle = '#FFFFFF';
				ctx.stroke();
			}
			
			ctx.restore();
		}
	}
	
	class clickBox extends spawn
	{
		constructor(x, y, width, height, text)
		{
			super();
			this.color 	= '#FFFFFF';
			this.width 	= width/2;
			this.height	= height/2;
			this.x		= x;
			this.y		= y;
			this.fwd	= getRandomUnitVector();
			this.speed	= 2;
			this.text 	= text;
		}
		draw(ctx)
		{
			ctx.save();
			
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			
			app.helper.fillText(ctx, this.text, this.x, this.y, "300% 'VT323', cursive", '#FFFFFF');
			
			//if(this.ability.debug)
			{
				ctx.beginPath();
				ctx.moveTo(this.x - this.width, this.y - this.height);
				ctx.lineTo((this.x - this.width) + this.width * 2, this.y - this.height);
				ctx.lineTo((this.x - this.width) + this.width * 2, (this.y - this.height) + this.height * 2);
				ctx.lineTo(this.x - this.width, (this.y - this.height) + this.height * 2);
				ctx.closePath();
				
				
				ctx.strokeStyle = '#FFFFFF';
				ctx.fillStyle = '#FFFFFF';
				ctx.fillRect(this.x - 1, this.y - 1, 2, 2);
				
				ctx.stroke();
			}
			
			ctx.restore();
		}
		
		resize(x, y)
		{
			this.x = x;
			this.y = y;
		}
	}
	
	class imageSpawn extends spawn
	{
		constructor(width, height, image, rect)
		{
			super();
			this.width 	= width;
			this.height	= height;
			this.image	= image;
			this.x		= Math.random() * rect.width + rect.left;
			this.y		= Math.random() * rect.height + rect.top;
			this.fwd	= getRandomUnitVector();
			this.speed	= 2;
		}
		draw(ctx)
		{
			ctx.save();

			ctx.drawImage(this.image,this.x,this.y,this.width,this.height);
			
			ctx.restore();
		}
	}


	function createSpawn(num = 12, rad = 20, col = '#FFFFFF', type = '', rect={left:0, top:0, width:300, height:300})
	{
		let sprites = [];
		for(let x = 0; x < num; x++)
		{
			// type can be smPllt, lgPllt, hunger, spiner
			if(type === 'smPllt')
			{
				// create Object literal with a prototype object of `sprite`
				let s = new Pellet_Small(rad, col, rect);
				sprites.push(s);
			}
			else if (type === 'lgPllt')
			{
				let s = new Pellet_Large(rad, col, rect);
				sprites.push(s);
			}
			else if (type === 'btmFdr')
			{
				let s = new Bottom_Feeder(rad, col, rect);
				sprites.push(s);
			}
			else if(type === 'hunger')
			{
				let s = new Hungerer(rad, col, 4, rect);
				sprites.push(s);
			}
		}

		return sprites; 
	}
	
	function createClickBox(x = 0, y = 0, w = 12, h = 12, txt = '...')
	{
		// create Object literal with a prototype object of `sprite`
		let s = new clickBox(x, y, w, h, txt);
	
		return s; 
	}

	
	function createBullet(x, y, fwd, rad, col)
	{
		let s = new StunGun(x, y, fwd, rad, col);
		
		return s; 
	}
	

	/*
	function createImageSprites(num = 20, w = 50, h = 80, url = 'images/sean.png', rect={left:0, top:0, width:300, height:300})
	{
		let spawn = [];

		let image = new Image();
		image.src = url; 

		for(let i=0;i<num;i++)
		{
			let s = new imageSpawn(w, h, image, rect);


			spawn.push(s);
		}

		return spawn; 
	}
	*/
	
	// export a public interface to this module
	return{
		createSpawn	: 	createSpawn,
		createClickBox	:	createClickBox,
		createBullet	:	createBullet
	};
})();

