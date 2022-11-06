'use strict';

const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const black = ctx.createImageData(1, 1);
black.data[0] = black.data[1] = black.data[2] = 0;
black.data[3] = 255;
const white = ctx.createImageData(1, 1);
white.data[0] = white.data[1] = white.data[2] = 255;
white.data[3] = 255;

function
parseHex(s)
{
	const v = [];

	while (true) {
		const a = s.match(/([0-9a-fA-F]{1,2})[^0-9a-fA-F]*$/u);
		if (a === null)
			break;
		v.unshift(parseInt(a[1], 16));
		s = s.slice(0, a.index);
	}

	return v;
}

function
parseBin(s)
{
	const v = [];

	while (true) {
		const a = s.match(/([01]{1,8})[^01]*$/u);
		if (a === null)
			break;
		v.unshift(parseInt(a[1], 2));
		s = s.slice(0, a.index);
	}

	return v;
}

function
parseStr(s)
{
	return Array.from(new TextEncoder().encode(s));
}

function
getInitialState()
{
	const parserTab = { bin: parseBin, hex: parseHex, str: parseStr };
	return (parserTab[enc.value] || (_ => []))(init.value);
}

function
handleReset() {
	const arr = getInitialState();
	canvas.width = +wwidth.value || arr.length * 8;
	canvas.style.width = `${canvas.width * 2}px`;
	canvas.height = 1;
	const pos = align.value === 'left' ? 0
		: align.value === 'right' ? canvas.width - arr.length * 8
		: (canvas.width - arr.length * 8) / 2 | 0;
	for (let i = 0; i < canvas.width; i++)
		ctx.putImageData(white, i, 0);
	const bit = n => arr[n>>3] & 0x80 >> (n&7);
	for (let i = 0; i < arr.length * 8; i++)
		ctx.putImageData(bit(i) ? black : white, pos + i, 0);
}
reset.addEventListener('click', handleReset);

function
nextGeneration()
{
	const prev = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const lastImg = ctx.getImageData(0, canvas.height-1, canvas.width, 1);
	const last = [];
	for (let i = 0; i < lastImg.data.length; i += 4)
		last.push(!!lastImg.data[i] || !lastImg.data[i+3] ? 0 : 1)
	canvas.height++;
	ctx.putImageData(prev, 0, 0);
	for (let i = 0; i < canvas.width; i++) {
		const v = last[i-1] << 2 | last[i] << 1 | last[i+1] << 0;
		ctx.putImageData(+rule.value & 1 << v ? black : white,
				i, canvas.height-1);
	}
	window.scrollBy(0, 2);
}
step.addEventListener('click', nextGeneration);

let id = null;
function
handleStart()
{
	if (id === null) {
		id = setInterval(nextGeneration);
		start.textContent = 'ストップ (Space)';
	} else {
		clearInterval(id);
		id = null;
		start.textContent = 'スタート (Space)';
	}
}
start.addEventListener('click', handleStart);
window.addEventListener('keydown', e => {
	if (e.key === ' ') {
		handleStart();
		e.preventDefault();
	}
});
