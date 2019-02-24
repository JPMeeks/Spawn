'use strict';

// keyboard information
const KEYBOARD = 
Object.freeze({
	NORTH	:	87,
	EAST	: 	68, 
	WEST	:	65, 
	SOUTH	:	83,
	UP		:	38,
	RIGHT	:	39,
	LEFT	:	37,
	DOWN	:	40,
	MUTE	:	77,
	BACK	: 	8
});

const KEYS = [];

window.onkeyup = (e) =>
{
	KEYS[e.keyCode] = false;
	e.preventDefault();
}

window.onkeydown = (e) =>
{
	KEYS[e.keyCode] = true;
}

// these 2 helpers are used by classes.js
function getRandomUnitVector()
{
	let x = getRandom(-1,1);
	let y = getRandom(-1,1);
	let length = Math.sqrt(x*x + y*y);
	if(length == 0)
	{ // very unlikely
		x = 1; // point right
		y = 0;
		length = 1;
	} 
	else
	{
		x /= length;
		y /= length;
	}

	return {x:x, y:y};
}

function getRandom(min, max) 
{
	return Math.random() * (max - min) + min;
}

function resizeCanvas()
{
    if(window.innerWidth > 600)
        canvas.width = self.innerWidth - 20;
	
    if(window.innerHeight > 200)
        canvas.height = window.innerHeight - 30;
}

function getMouse(e)
{
	var mouse = {}; // make an object
	mouse.x = e.pageX - e.target.offsetLeft;
	mouse.y = e.pageY - e.target.offsetTop;
	return mouse;
}

//function MouseDown(e)
//{
//	//canvas.onmousedown = doMousedown;
//	let mouse = getMouse(e);
//}
