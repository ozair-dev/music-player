// DOM elements and variables declarations

const tempStorage = {volume:0.5, speed:1};
let playlistItems = [];
let audio;

const app = document.querySelector("#app");
const contentDiv = app.querySelector('#content');
const animationDiv = app.querySelector("#animation-div");
const playlistEl = app.querySelector('#playlist')
const playlistItemsEl = app.querySelector("#playlist-items")
let playlistItemElArr = [];
const playlistHeader = app.querySelector('#playlist-header');
const playlistToggleButton = playlistHeader.querySelector('i');
const audioSelect = app.querySelector("#select-audio")
const durationDiv = app.querySelector("#duration-div");
const currentTimeEl = app.querySelector("#current-time");
const totalTimeEl = app.querySelector("#total-time") 
const durationBar = app.querySelector("#duration-bar");
const hoverDuration = app.querySelector("#hover-duration");
const durationBall = app.querySelector("#duration-ball");
const togglePlayButton = app.querySelector('#toggle-play');
const stopButton = app.querySelector("#stop")
const prevButton = app.querySelector('#prev');
const nextButton = app.querySelector("#next");
const speedControlButton = app.querySelector("#speed-control-button")
const speedButtons = app.querySelectorAll('[data-speed]')
const loop = app.querySelector("#loop-button");
const shuffle = app.querySelector("#shuffle-button");
const volumeButton = app.querySelector("#volume-button")
const volumeDiv = app.querySelector('#volume-div');
const volumeBar = app.querySelector('#volume-bar');
const volumeInfo = app.querySelector("#volume-info")
const popUps = [{el:volumeButton, class:"changing-volume"}, {el:speedControlButton, class:"changing-speed"}];
// functions

function handlePlaylistClicked(e){
	if(e.target!== playlistToggleButton){
		tempStorage.playlistClicked =true;
	}
}

function togglePlaylist(e){
	if(tempStorage.playlistClicked){
		playlistEl.style.removeProperty('top');
		const playlistPercent = getPlaylistPercentage(e, contentDiv)
		if(playlistPercent<=50)	{
			playlistEl.classList.add('showing');
		}
		else {
			playlistEl.classList.remove('showing');
		}
	}
}

function getTime(duration){
	let time = "";
	if(parseInt(duration/3600)){
		let hours = parseInt(duration/3600)
		if(hours<10) hours = "0"+hours;
		time +=hours+":";
		duration %= 3600;
	}

	let minutes = parseInt(duration/60);
	if(minutes<10) minutes = "0"+minutes;
	time+= minutes+":";
	duration %= 60 
	duration = parseInt(duration)

	if(duration<10) duration="0"+duration;
	time+=duration
	return time;
}

function playAudio(idx){
	let playEl = app.querySelector(`[data-idx='${idx}']`)
	if(tempStorage.currentlyPlaying!==playEl){
		if(tempStorage.currentlyPlaying){
			tempStorage.currentlyPlaying.classList.remove('playing');
		}else{
			playlist.classList.remove('showing')
		}
		playEl.classList.add('playing');
		animationDiv.querySelector("#audio-title").textContent = playlistItems[idx].name
		tempStorage.currentlyPlaying = playEl;
		if(audio){
			audio.src = "";
		}else{
			audio = new Audio();
		}
		
		const src = URL.createObjectURL(playlistItems[idx]);
		audio.src = src;
		audio.volume = tempStorage.volume;
		audio.playbackRate = tempStorage.speed;
		currentTimeEl.textContent = getTime(audio.currentTime);
		audio.ondurationchange = ()=>totalTimeEl.textContent = getTime(audio.duration);
		audio.play();
		audio.onplay = ()=>{
			togglePlayButton.classList.add('playing');
			playEl.classList.remove('paused');
			animationDiv.classList.add('playing');
		}
		audio.onpause = ()=>{
			togglePlayButton.classList.remove('playing');
			playEl.classList.add('paused');
			animationDiv.classList.remove('playing')
		}
		audio.ontimeupdate = ()=>{
			const {currentTime} = audio;
			currentTimeEl.textContent = getTime(currentTime);
			const percent = 100*currentTime/audio.duration;
			durationBar.style.setProperty("width", `${percent}%`);
		}
	
		audio.onended = ()=>tempStorage.loop?audio.play():playNext();


	}	
	
}

function stopAudio(){
	if(audio){
		audio.pause();
		audio.currentTime = 0;
	}
}

function changeSpeed(){
	tempStorage.speed = this.dataset.speed;
	speedControlButton.querySelector("#current-speed").textContent = tempStorage.speed;
	if(audio){
		audio.playbackRate = this.dataset.speed;
	}
}

const getRandomAudio = ()=>Math.floor(Math.random()*(playlistItems.length));

function playNext(){
	if(audio){
		let index;	
		if(tempStorage.shuffle){
			index = getRandomAudio();
		}
		else if(tempStorage.currentlyPlaying.dataset.idx != playlistItems.length-1){
			index = Number(tempStorage.currentlyPlaying.dataset.idx)+1;
		}else{
			index = 0;
		}
		playAudio(index);
	}
}

function playPrevious(){
	if(audio){
		let index;
		if(tempStorage.shuffle)	index = getRandomAudio();
		else if(tempStorage.currentlyPlaying.dataset.idx > 0) index = Number(tempStorage.currentlyPlaying.dataset.idx)-1
		else index = playlistItems.length-1;
		playAudio(index);
	}
}

function togglePlay(){
	if(audio){
		togglePlayButton.classList.toggle('playing');
		if(togglePlayButton.classList.contains('playing')) audio.play()
		else audio.pause();
	}
}

function closePopUps(e){
	popUps.forEach(popUp=>!e.path.includes(popUp.el) && popUp.el.classList.remove(popUp.class));
}

const handleMouseUp =  (e) => {	
	togglePlaylist(e);
	Object.assign(tempStorage, {durationClicked: false, volumeClicked: false, playlistClicked: false});

}

function handleDurationClicked (e){
	tempStorage.durationClicked = true;
	changeDurationProgress(e)
}

function handleVolumeClicked (e){
	tempStorage.volumeClicked = true;
	changeVolumeProgress(e)
}


function handleMouseMove (e){
	if(tempStorage.durationClicked){
		changeDurationProgress(e)
	}
	else if(tempStorage.volumeClicked){
		changeVolumeProgress(e)
	}
	else if(tempStorage.playlistClicked){
		const percent = getPlaylistPercentage(e, contentDiv)
		tempStorage.lastPlaylistPercentage = percent;
		changeProgress(percent, 'top', playlistEl);
	}
}

function getPlaylistPercentage(e, el){
	const br = el.getBoundingClientRect();
	const {height} = br;
	if(['touchstart', 'touchmove'].includes(e.type)){
		e = e.touches[0];
	}
	const y = e.clientY - br.top;
	const percent = 100*y/height || tempStorage.lastPlaylistPercentage;
	return percent ;
}

function changeDurationProgress(e){
	if(audio){
		const percent = getDurationPercentage(e, durationDiv);
		changeProgress(percent, "width", durationBar);
		const duration = percent*audio.duration/100;
		audio.currentTime = duration;
	}
}

function changeVolumeProgress(e){
	const percent = getVolumePercentage(e, volumeDiv);
	if(percent<=100 && percent>=0){	
		volumeInfo.textContent = Math.round(percent);
		changeProgress(percent, "height", volumeBar)
		const volume = percent/100;
		tempStorage.volume = volume;
		if(audio){
			audio.volume = volume;
		}
	}
}

function getDurationPercentage(e, el){
	if(['touchstart', 'touchmove'].includes(e.type)){
		e = e.touches[0];
	}
	const x = e.clientX - el.offsetLeft;
	const {offsetWidth: width} = el;
	const percent = (x/width)*100;
	return percent
}

function getVolumePercentage(e, el){
	const br = el.getBoundingClientRect();
	const {height} = br;
	if(['touchstart', 'touchmove'].includes(e.type)){
		e = e.touches[0];
	}
	let y = br.bottom - e.clientY;
	percent = (y/height)*100;
	return percent;
}

function changeProgress(percent, orientation,targetEl){
	if(percent>=0 && percent<=100){
		targetEl.style.setProperty(orientation, `${percent}%`)
	}
}



// Event listeners

playlistHeader.onmousedown = handlePlaylistClicked;
playlistHeader.addEventListener('touchstart', handlePlaylistClicked);
playlistToggleButton.onclick = ()=>playlistEl.classList.toggle('showing');

audioSelect.onchange = function(){
	const files = Array.from(this.files).filter(file=>/^audio\/.*$/.test(file.type)).filter(file=>playlistItems.findIndex(item=>item.name===file.name)===-1)
	let playlistItemsLength = playlistItems.length;
	files.forEach(file=>{
		let playlistItem = document.createElement('div');
		playlistItem.classList.add('playlist-item');
		playlistItem.setAttribute("data-idx", playlistItemsLength++);
		playlistItem.innerHTML = `<p>${file.name}</p><div class="playlist-item-animation">
			<div></div><div></div><div></div>
				</div>`;
		playlistItemsEl.appendChild(playlistItem);
	})
	playlistItems = [...playlistItems, ...files];
	playlistItemElArr = app.querySelectorAll(".playlist-item");
	playlistItemElArr.forEach(item=>item.onclick = function(){
	playAudio(this.dataset.idx);
	})
								
}

durationDiv.onmousedown = handleDurationClicked; 
durationDiv.addEventListener('touchstart', handleDurationClicked)
durationDiv.onmousemove = (e)=>{			
	if(tempStorage.durationEntered && audio){
		const percent = getDurationPercentage(e, durationDiv);
		const duration = percent*audio.duration/100
		const time = getTime(duration)
		hoverDuration.textContent = time;
		const {offsetWidth: width} = hoverDuration;
		hoverDuration.style.setProperty("left", `calc(${percent}% - ${width/2}px)`)
	}
}
durationDiv.onmouseenter = ()=> (tempStorage.durationEntered = true) && (hoverDuration.classList.add('show'));
durationDiv.onmouseleave = ()=> !(tempStorage.durationEntered = false) && (hoverDuration.classList.remove('show'));


volumeDiv.onmousedown = handleVolumeClicked; 
volumeDiv.addEventListener('touchstart', handleVolumeClicked)

document.onclick = closePopUps;
document.onmouseup = handleMouseUp
document.addEventListener('touchend', handleMouseUp)

document.onmousemove = handleMouseMove;
document.addEventListener('touchmove', handleMouseMove)

document.addEventListener('keydown', e=>e.code==='Space' && togglePlay())
togglePlayButton.onclick = togglePlay;


stopButton.onclick = stopAudio;
prevButton.onclick = playPrevious;
nextButton.onclick = playNext;

loop.onclick = function(){
	this.classList.toggle('loop')
	tempStorage.loop = !tempStorage.loop;					
}

shuffle.onclick = function(){
	this.classList.toggle('shuffle')
	tempStorage.shuffle = !tempStorage.shuffle
}

volumeButton.querySelector('i').onclick = ()=> volumeButton.classList.toggle('changing-volume')

speedControlButton.querySelector('p').onclick = ()=> speedControlButton.classList.toggle('changing-speed')
speedButtons.forEach(button=>button.onclick = changeSpeed)
					//window.onbeforeunload = ()=>"Do you really want to leave this page?"
