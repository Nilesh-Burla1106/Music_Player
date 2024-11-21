let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    try {
        currFolder = folder;
        const response = await fetch(`/${folder}/`);
        const text = await response.text();
        const div = document.createElement("div");
        div.innerHTML = text;
        const as = div.getElementsByTagName("a");
        songs = Array.from(as)
            .filter(element => element.href.endsWith(".mp3"))
            .map(element => element.href.split(`/${folder}/`)[1]);

        const songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
        songUL.innerHTML = songs.map(song => `<li> <img class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")} </div>
                                <div>Nilesh</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="play.svg" alt="">
                            </div></li>`).join('');

        Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", () => playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim()));
        });

        return songs;
    } catch (error) {
        console.error('Error fetching songs:', error);
    }
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    try {
        const response = await fetch(`/songs/`);
        const text = await response.text();
        const div = document.createElement("div");
        div.innerHTML = text;
        const anchors = div.getElementsByTagName("a");
        const cardContainer = document.querySelector(".cardContainer");
        const array = Array.from(anchors);

        for (let index = 0; index < array.length; index++) {
            const e = array[index];

            if (e.href.includes("/songs")) {
                const folder = e.href.split("/").slice(-2)[0];
                const infoResponse = await fetch(`/songs/${folder}/info.json`);
                const info = await infoResponse.json();

                cardContainer.innerHTML += ` <div data-folder="${folder}" class="card ">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
                        color="#000000" fill="#000">
                        <path
                            d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                            stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                    </svg>
                </div>
                <img src="/songs/${folder}/cover.jpeg" alt="">
                <h2>${info.title}</h2>
                <p>${info.description}</p>
            </div>`;
            }
        }

        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                playMusic(songs[0]);
            });
        });
    } catch (error) {
        console.error('Error displaying albums:', error);
    }
}

async function main() {
    try {
        await getSongs("songs/ncs");
        playMusic(songs[0], true);
        displayAlbums();

        play.addEventListener("click", () => {
            if (currentSong.paused) {
                currentSong.play();
                play.src = "pause.svg";
            } else {
                currentSong.pause();
                play.src = "play.svg";
            }
        });

        currentSong.addEventListener("timeupdate", () => {
            document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}:${secondsToMinutesSeconds(currentSong.duration)}`;
            document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        });

        document.querySelector(".seekbar").addEventListener("click", e => {
            const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            currentSong.currentTime = ((currentSong.duration) * percent) / 100;
        });

        document.querySelector(".hamburger").addEventListener("click", () => {
            document.querySelector(".left").style.left = "0";
        });

        document.querySelector(".close").addEventListener("click", () => {
            document.querySelector(".left").style.left = "-120%";
        });

        previous.addEventListener("click", () => {
            const index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if ((index - 1) >= 0) {
                playMusic(songs[index - 1]);
            }
        });

        next.addEventListener("click", () => {
            const index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1]);
            }
        });

        document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
            currentSong.volume = parseInt(e.target.value) / 100;
            if (currentSong.volume) {
                document.querySelector(".volume >img").src = document.querySelector(".volume >img").src.replace("mute.svg", "volume.svg");
            }
        });

        document.querySelector(".volume >img").addEventListener("click", e => {
            if (e.target.src.includes("volume.svg")) {
                e.target.src = e.target.src.replace("volume.svg", "mute.svg");
                currentSong.volume = 0;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            } else {
                e.target.src = e.target.src.replace("mute.svg", "volume.svg");
                currentSong.volume = .1;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
            }
        });
    } catch (error) {
        console.error('Error in main function:', error);
    }
}

main();
