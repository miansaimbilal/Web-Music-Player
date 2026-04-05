console.log("Script running...");
let currentSong = new Audio();
let songs;
let songs2;
let folders1;
let value;
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

async function get_songs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`);
  let b = folder.split("songs/")[1];
  let data = await a.text();
  let div = document.createElement("div");
  div.innerHTML = data;
  let as = div.querySelectorAll("a");
  songs = [];
  as.forEach((element) => {
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`${b}`)[1].replaceAll("%5C", ""));
    }
  });

  let songUL = document.getElementById("songs_list");
  songUL.innerHTML = "";
  for (const song of songs) {
    let c = await fetch(`/${folder}/${song.replaceAll("mp3", "json")}`);
    let songInfo = await c.json();
    songUL.innerHTML =
      songUL.innerHTML +
      `
      <li>
        <div class="songItem">
            <p class="songTitle">${songInfo.title.replaceAll("-", " ").replaceAll("_", " ")}</p>
            <div class="songItemInfo">
              <div class="itemInfoDiv">
                  <span class="popHover">Artist:</span> <p class="ps popHover">${songInfo.artist}</p>
                  <p class="popP popP"> ${songInfo.artist} </p>
              </div>
              <div class="itemInfoDiv">
                  <span class="popHover">Album:</span> <p class="ps popHover">${songInfo.album}</p>
                  <p class="popP popP"> ${songInfo.album} </p> 
              </div>
            </div>
            <img src="images/play1.svg" class="playButton1" onclick="playmusic('${song}')">
        </div>
      </li>`;

    let infodivs = document.querySelectorAll(".popHover");
    Array.from(infodivs).forEach((element) => {
      let popP = element.closest(".itemInfoDiv").querySelector(`.popP`);

      element.addEventListener("mouseover", () => {
        popP.style.display = "block";
      });
      element.addEventListener("mouseout", () => {
        popP.style.display = "none";
      });
    });
  }

  return songs;
}

async function getjson() {
  let a = await fetch(`${currentSong.src.replaceAll("mp3", "json")}`);
  let trackInfo = await a.json();
  return trackInfo;
}
// async function getjson(track) {
//   let a = await fetch(`${currFolder}/${track.replaceAll("mp3", "json")}`);
//   let trackInfo = await a.json();
//   return trackInfo;
// }

let play = document.querySelector(".playPause")
const playmusic = async (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  let trackInfo = await getjson();
  if (!pause) {
    currentSong.play();

    play.src = "images/pause.svg";

    document.querySelector(".songName").innerHTML = decodeURI(trackInfo.title.replaceAll("-", " ").replaceAll("_", " "));
  }
};


window.playmusic2 = playmusic2;
function playmusic2(path, name) {
  currentSong.src = `/songs/${path}`;
  console.log(currentSong.src);
  currentSong.play();

  play.src = "images/pause.svg";

  document.querySelector(".songName").innerHTML = decodeURI(name.replaceAll("-", " ").replaceAll("_", " "));

}

async function playlistCards() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.querySelectorAll("a");
  let playlistDiv = document.querySelector(".albums");
  let folders = [];
  as.forEach((element) => {
    if (element.href.includes("songs")) {
      folders.push(
        element.href
          .split("songs")[1]
          .replaceAll("%5C", "")
          .replaceAll("/", ""),
      );
    }
  });

  for (const folder of folders) {
    let b = await fetch(`/songs/${folder}/info.json`);
    let info = await b.json();
    playlistDiv.innerHTML += `
      <div class="playlistCard">
        <div class="cardContent">
          <div class="playlistCover" style="background: url(/songs/${folder}/cover.png); background-size: cover;">
            <img id="playlistplay" class="playlistplay" data-folder="${folder}" width="24" src="images/play1.svg" alt="">
          </div>
          <h3 class="playlistTitle">${info.Name}</h3>
          <p class="playlistDesc">${info.Description}</p>
        </div>
      </div>
    `;
  }
  folders1 = [];
  Array.from(document.getElementsByClassName("playlistplay")).forEach(
    (card) => {
      folders1.push(card.dataset.folder);
      card.addEventListener("click", async (item) => {
        console.log("clicked");
        let songs = await get_songs(
          `songs/${item.currentTarget.dataset.folder}`,
        );
        playmusic(songs[0]);
      });
    },
  );
  return folders1;
}
// window.get_songs = get_songs;

async function main() {
  await get_songs("songs/album-1");
  await playlistCards();
  currentSong.src = `${currFolder}/${songs[0]}`;
  let seekbar = document.querySelector(".seekbar");
  let circle = document.querySelector(".seekbarCircle");

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".duration").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
    circle.style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    document.querySelector(".seekbarLayer").style.width = (100 - ((currentSong.currentTime / currentSong.duration) * 100)) + "%";
    if (currentSong.currentTime === currentSong.duration) {
      let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
      if ((index + 1) < songs.length) {
        currentSong.pause();
        playmusic(songs[index + 1]);
      }
    }
  });

  function updateSeekbar(e) {
    let rect = e.target.getBoundingClientRect();
    let percent = ((e.clientX - rect.left) / rect.width) * 100;
    percent = Math.max(0, Math.min(100, percent))
    circle.style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  }

  seekbar.addEventListener("click", updateSeekbar);
  seekbar.addEventListener("mousemove", (e) => {
    if (e.buttons === 1) {
      updateSeekbar(e);
    }
  });

  async function playPause() {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "images/pause.svg";
      let songTitle = await getjson();
      document.querySelector(".songName").innerHTML = decodeURI(songTitle.title.replaceAll("-", " ").replaceAll("_", " "));
    } else {
      currentSong.pause();
      play.src = "images/play1.svg";
    }
  }

  play.addEventListener("click", playPause);
  document.addEventListener("keydown", (e) => {
    const tag = e.target.tagName;

    if (tag === "INPUT" || tag === "TEXTAREA") {
      return; // do nothing if user is typing
    }


    if (e.key === " ") {
      playPause();
    }
  });

  function prevSong() {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if ((index - 1) >= 0) {
      currentSong.pause();
      playmusic(songs[index - 1]);
    }
  }

  document.querySelector(".prev").addEventListener("click", prevSong);
  document.addEventListener("keydown", (e) => {
    if (e.shiftKey && e.key.toLocaleLowerCase() === "p") { prevSong(); }
  });

  function nextSong() {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if ((index + 1) < songs.length) {
      currentSong.pause();
      playmusic(songs[index + 1]);
    }
  };

  document.querySelector(".next").addEventListener("click", nextSong);
  document.addEventListener("keydown", (e) => {
    if (e.shiftKey && e.key.toLocaleLowerCase() === "n") { nextSong() }
  });

  volumeBtn = document.querySelector(".volumeimg");
  document.getElementById("volumeRange").addEventListener("change", (e) => {
    console.log(e.target.value)
    currentSong.volume = +e.target.value / 100;
    if (+e.target.value === 0) {
      volumeBtn.src = "images/mute.svg";
    } else if (+e.target.value <= 50) {
      volumeBtn.src = "images/volumelow.svg";
    } else {
      volumeBtn.src = "images/volumehigh.svg";
    }
  });

  volumeBtn.addEventListener("click", (e) => {
    if (e.target.src.includes("high") || e.target.src.includes("low")) {
      volumeBtn.src = "images/mute.svg";
      currentSong.volume = 0;
      document.getElementById("volumeRange").value = 0;
    } else {
      volumeBtn.src = "images/volumelow.svg";
      currentSong.volume = 0.2;
      document.getElementById("volumeRange").value = 20;
    }
  })
  document.querySelector(".volume").addEventListener("mouseover", () => {
    document.getElementById("volumeRange").style.top = "-40px";
    document.getElementById("volumeRange").style.opacity = "1";
  })
  document.querySelector(".volume").addEventListener("mouseout", () => {
    document.getElementById("volumeRange").style.top = "-20px";
    document.getElementById("volumeRange").style.opacity = "0";
  })


  const input = document.getElementById("search");
  input.addEventListener("input", async () => {
    value = input.value.trim();
    console.log(value);
    if (value !== null && value !== undefined && value !== "") {
      console.log("Input is not empty");
      let placeholder = document.getElementById("placeholder");
      placeholder.style.display = "none";
      let playlists = document.querySelector(".playlists");
      let searches = document.querySelector(".searches");
      let results = document.querySelector(".results");
      let playlisH2 = document.querySelector(".searches h2");
      playlisH2.innerHTML = `Search Results For "${value}"`

      playlists.style.display = "none";
      searches.style.display = "block";
      results.innerHTML = "";
      results.innerHTML = "";
      results.innerHTML = "";
      // console.log(folders1)
      for (const folder of folders1) {
        let word = input.value;
        let a = await fetch(`songs/${folder}/`);
        let b = folder.split("songs/")[1];
        let data = await a.text();
        let div = document.createElement("div");
        div.innerHTML = data;
        let as = div.querySelectorAll("a");
        songs2 = [];
        as.forEach(async (element) => {
          if (element.href.endsWith(".json")) {
            if (!element.href.includes("info")) {
              let jsonName = element.href.split(`%5C`).slice(-1)[0];
              songs2.push(jsonName);
              let c = await fetch(`songs/${folder}/${jsonName}`);
              let jsonInfo = await c.json();
              let songTitle = jsonInfo.title.replaceAll("-", " ").replaceAll("_", " ");
              if (songTitle.toLocaleLowerCase().includes(`${word}`)) {
                console.log(jsonInfo.title)
                results.innerHTML += await `
                
      <div class="searchLi">
        <div class="searchItem">
            <p class="songTitle">${songTitle}</p>
            <div class="songItemInfo">
              <div class="itemInfoDiv">
                  <span class="popHover">Artist:</span> <p class="ps popHover">${jsonInfo.artist}</p>
                  <p class="popP"> ${jsonInfo.artist} </p>
              </div>
              <div class="itemInfoDiv">
                  <span class="popHover">Album:</span> <p class="ps popHover">${jsonInfo.album}</p>
                  <p class="popP"> ${jsonInfo.album} </p> 
              </div>
            </div>
            <img src="images/play1.svg" class="playButton0" onclick="playmusic2('${folder}/${jsonInfo.file}', '${jsonInfo.title}')">
        </div>
      </div>
                `;

                let infodivs1 = document.querySelectorAll(".popHover");
                Array.from(infodivs1).forEach(async (element) => {
                  let popP0 = element.closest(".itemInfoDiv").querySelector(".popP");

                  element.addEventListener("mouseover", () => {
                    popP0.style.display = "block";
                    console.log("mouse in")
                  });
                  element.addEventListener("mouseout", () => {
                    popP0.style.display = "none";
                    console.log("mouse out")
                  });
                });
              }
              // else{
              //   results.innerHTML = `
              //   <div class="noresults"> No Matching Results Found </div>
              //   `
              // }
            }


          }
        });
      }
      if (results.innerHTML === "") {
        results.innerHTML = `
                <div class="noresults"> No Matching Results Found </div>
                `
      }
      // console.log(songs2)
    } else {
      console.log("Input is empty");
      let placeholder = document.getElementById("placeholder");
      placeholder.style.display = "block";
      document.querySelector(".playlists").style.display = "block";
      document.querySelector(".searches").style.display = "none";
    }
  });

}
main();

// Add 'scrollable' class to body
document.body.classList.add("scrollable");

// Get all scrollable elements on page
const scrollableElements = document.querySelectorAll(".scrollable");

scrollableElements.forEach((el) => {
  let scrollTimeout;

  el.addEventListener("scroll", () => {
    el.classList.add("scrolling"); // show scrollbar

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      el.classList.remove("scrolling"); // hide scrollbar after 1s of no scroll
    }, 500);
  });
});
