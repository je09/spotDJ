// NAME: spotDJ
// AUTHOR: je09
// VERSION: 9.8.1
// DESCRIPTION: Provides additional info (Key/Tempo) for your tracks. Has built in pitch change calculator.

var spotdj = (() => {
  // src/misc.tsx
  var keyMap = /* @__PURE__ */ new Map([
    [-1, "\xAF_(\u30C4)_/\xAF "],
    [0, "C"],
    [1, "Db"],
    [2, "D"],
    [3, "Eb"],
    [4, "E"],
    [5, "F"],
    [6, "Gb"],
    [7, "G"],
    [8, "Ab"],
    [9, "A"],
    [10, "Bb"],
    [11, "B"]
  ]);
  var keyMapReverse = /* @__PURE__ */ new Map([
    ["C", 0],
    ["Db", 1],
    ["D", 2],
    ["Eb", 3],
    ["E", 4],
    ["F", 5],
    ["Gb", 6],
    ["G", 7],
    ["Ab", 8],
    ["A", 9],
    ["Bb", 10],
    ["B", 11]
  ]);
  var camelotWheel = /* @__PURE__ */ new Map([
    ["Abm", "1A"],
    ["B", "1B"],
    ["Ebm", "2A"],
    ["Gb", "2B"],
    ["Bbm", "3A"],
    ["Db", "3B"],
    ["Fm", "4A"],
    ["Ab", "4B"],
    ["Cm", "5A"],
    ["Eb", "5B"],
    ["Gm", "6A"],
    ["Bb", "6B"],
    ["Dm", "7A"],
    ["F", "7B"],
    ["Am", "8A"],
    ["C", "8B"],
    ["Em", "9A"],
    ["G", "9B"],
    ["Bm", "10A"],
    ["D", "10B"],
    ["Gbm", "11A"],
    ["A", "11B"],
    ["Dbm", "12A"],
    ["E", "12B"]
  ]);
  var modeArr = ["m", ""];

  // src/trackinfo.tsx
  var TrackInfo = class {
    constructor(res) {
      this.tempo = this.tempoRound(res.tempo);
      this.key = this.keyAssign(res.key, res.mode);
      this.camelot = "(" + camelotWheel.get(this.key) + ")";
      this.mode = res.mode;
      this.date = new Date();
    }
    tempoRound(tempo) {
      return Math.round(tempo);
    }
    keyAssign(key, mode) {
      return keyMap.get(key) + modeArr[mode];
    }
  };
  async function getSongStats(id) {
    const res = await Spicetify.CosmosAsync.get("https://api.spotify.com/v1/audio-features/" + id);
    return res;
  }
  async function getTrackFeatures(id) {
    const localFeature = localStorage.getItem("spotdj-" + id);
    if (localFeature != null) {
      return JSON.parse(localFeature);
    }
    var res = await getSongStats(id);
    var info = new TrackInfo(res);
    localStorage.setItem("spotdj-" + id, JSON.stringify(info));
    return info;
  }

  // src/injectNowPlay.tsx
  var trackInfoContainer;
  var infoContainer = document.querySelector("div.main-trackInfo-name");
  var playback = null;
  async function updateNowPlaying() {
    if (!(Spicetify.CosmosAsync && Spicetify.URI)) {
      setTimeout(updateNowPlaying, 300);
      return;
    }
    injectTrackInfo();
  }
  async function clean() {
    if (trackInfoContainer == null) {
      return;
    }
    try {
      infoContainer == null ? void 0 : infoContainer.removeChild(trackInfoContainer);
    } catch (e) {
    }
  }
  function addInfoContainer(info) {
    trackInfoContainer = document.createElement("div");
    trackInfoContainer.className = "main-trackInfo-spotdj ellipsis-one-line main-type-finale";
    trackInfoContainer.style.color = "var(--spice-extratext)";
    var element = document.createElement("p");
    element.innerHTML = info.key + info.camelot + "/" + info.tempo;
    trackInfoContainer.append(element);
  }
  async function injectTrackInfo() {
    Spicetify.Player.addEventListener("onprogress", async () => {
      var _a, _b, _c;
      if (!((_b = (_a = Spicetify.Player.data.track) == null ? void 0 : _a.metadata) == null ? void 0 : _b.hasOwnProperty("artist_uri"))) {
        clean();
      }
      if (playback === Spicetify.Player.data.playback_id) {
        return;
      }
      playback = Spicetify.Player.data.playback_id;
      var trackID = (_c = Spicetify.Player.data.track) == null ? void 0 : _c.uri.split(":")[2];
      const features = await getTrackFeatures(trackID);
      clean();
      addInfoContainer(features);
      infoContainer = document.querySelector("div.main-trackInfo-name");
      if (!infoContainer)
        clean();
      infoContainer == null ? void 0 : infoContainer.appendChild(trackInfoContainer);
    });
  }

  // src/injectTrackList.tsx
  var fiveColumnGridCss = "[index] 16px [first] 4fr [var1] 2fr [var2] 1fr [last] minmax(120px,1fr)";
  var sixColumnGridCss = "[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] 2fr [last] minmax(120px,1fr)";
  var sevenColumnGridCss = "[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] minmax(120px,2fr) [var3] 2fr [last] minmax(120px,1fr)";
  function getTracklistTrackUri(tracklistElement) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t;
    let values = Object.values(tracklistElement);
    if (!values)
      return null;
    return ((_f = (_e = (_d = (_c = (_b = (_a = values[0]) == null ? void 0 : _a.pendingProps) == null ? void 0 : _b.children[0]) == null ? void 0 : _c.props) == null ? void 0 : _d.children) == null ? void 0 : _e.props) == null ? void 0 : _f.uri) || ((_n = (_m = (_l = (_k = (_j = (_i = (_h = (_g = values[0]) == null ? void 0 : _g.pendingProps) == null ? void 0 : _h.children[0]) == null ? void 0 : _i.props) == null ? void 0 : _j.children) == null ? void 0 : _k.props) == null ? void 0 : _l.children) == null ? void 0 : _m.props) == null ? void 0 : _n.uri) || ((_t = (_s = (_r = (_q = (_p = (_o = values[0]) == null ? void 0 : _o.pendingProps) == null ? void 0 : _p.children[0]) == null ? void 0 : _q.props) == null ? void 0 : _r.children[0]) == null ? void 0 : _s.props) == null ? void 0 : _t.uri);
  }
  async function injectTrackList(page) {
    if (page == Other) {
      return;
    }
    const tracklist = document.querySelector(".main-trackList-indexable");
    if (!tracklist) {
      return;
    }
    const tracks = tracklist.getElementsByClassName("main-trackList-trackListRow");
    const tracklistHeader = document.querySelector(".main-trackList-trackListHeaderRow");
    if (tracklistHeader) {
      let lastColumn = tracklistHeader.querySelector(".main-trackList-rowSectionEnd");
      let colIndexInt = parseInt(lastColumn.getAttribute("aria-colindex"));
      switch (colIndexInt) {
        case 4:
          tracklistHeader.style["grid-template-columns"] = fiveColumnGridCss;
          break;
        case 5:
          tracklistHeader.style["grid-template-columns"] = sixColumnGridCss;
          break;
        case 6:
          tracklistHeader.style["grid-template-columns"] = sevenColumnGridCss;
          break;
        default:
          break;
      }
    }
    for (const track of tracks) {
      const isMarked = track.querySelector(".main-playlisttrackInfo-spotdj") != null;
      if (isMarked) {
        continue;
      }
      const trackID = getTracklistTrackUri(track).split(":")[2];
      const features = await getTrackFeatures(trackID);
      addTracklistInfoContainer(features, track);
      const heart = track.getElementsByClassName("main-addButton-button")[0];
    }
  }
  function addTracklistInfoContainer(info, list) {
    const lastColumn = list.querySelector(".main-trackList-rowSectionEnd");
    let colIndexInt = parseInt(lastColumn.getAttribute("aria-colindex"));
    lastColumn.setAttribute("aria-colindex", (colIndexInt + 1).toString());
    var container = document.createElement("div");
    container.setAttribute("aria-colindex", colIndexInt.toString());
    container.style.color = "var(--text-subdued,#6a6a6a)";
    container.style.fontSize = "0.875rem";
    container.style.textAlign = "left";
    container.role = "gridcell";
    container.style.display = "flex";
    container.classList.add("main-trackList-rowSectionVariable");
    container.classList.add("main-playlisttrackInfo-spotdj");
    var keyElement = document.createElement("p");
    var tempoElement = document.createElement("p");
    keyElement.innerHTML = "<strong>" + info.key + "</strong>" + info.camelot;
    keyElement.style.marginBottom = "0.175rem";
    tempoElement.innerHTML = "<strong>" + info.tempo + "</strong> BPM";
    tempoElement.style.fontSize = "0.820rem";
    container.style.display = "block";
    container.appendChild(keyElement);
    container.appendChild(tempoElement);
    if (list.querySelector(".main-playlisttrackInfo-spotdj") != null) {
      return;
    }
    list.insertBefore(container, lastColumn);
    switch (colIndexInt) {
      case 4:
        list.style["grid-template-columns"] = fiveColumnGridCss;
        break;
      case 5:
        list.style["grid-template-columns"] = sixColumnGridCss;
        break;
      case 6:
        list.style["grid-template-columns"] = sevenColumnGridCss;
        break;
      default:
        break;
    }
  }

  // src/cleaner.tsx
  function injectCleaner() {
    const settings = document.querySelector("div.x-settings-container");
    if ((settings == null ? void 0 : settings.querySelector(".spotdj")) != null) {
      return;
    }
    var container = document.createElement("div");
    container.className = "x-settings-section spotdj";
    container.innerHTML = '<h2 class="Type__TypeElement-goli3j-0 dMODvo">SpotDJ</h2>';
    var subContainer = document.createElement("div");
    subContainer.className = "x-settings-row";
    var subContainerFirst = document.createElement("div");
    subContainerFirst.className = "x-settings-firstColumn";
    subContainerFirst.innerHTML = '<label class="Type__TypeElement-goli3j-0 htIQcs"><span>Clean up SpotDJ cache parsed more than 1 month ago. There are ' + getOldData() + " old entries.</span></label>";
    var subContainerSecond = document.createElement("div");
    subContainerSecond.className = "x-settings-secondColumn";
    subContainerSecond.innerHTML = '<button class="Button-y0gtbx-0 cuhCvm rFFJg1UIumqUUFDgo6n7">Clean</button>';
    subContainerSecond.addEventListener("click", cleanOld);
    subContainer.appendChild(subContainerFirst);
    subContainer.appendChild(subContainerSecond);
    container.appendChild(subContainer);
    settings == null ? void 0 : settings.appendChild(container);
  }
  function getOldData() {
    var counter = 0;
    for (var key in localStorage) {
      if (!key.includes("spotdj")) {
        continue;
      }
      const localFeature = localStorage.getItem(key);
      const feature = JSON.parse(String(localFeature));
      var date = new Date();
      date.setMonth(date.getMonth() - 1);
      var oldDate = new Date(feature.date);
      if (oldDate < date) {
        counter++;
      }
    }
    return counter;
  }
  function cleanOld() {
    var _a;
    for (var key in localStorage) {
      if (!key.includes("spotdj")) {
        continue;
      }
      const localFeature = localStorage.getItem(key);
      const feature = JSON.parse(String(localFeature));
      var date = new Date();
      date.setMonth(date.getMonth() - 1);
      var oldDate = new Date(feature.date);
      if (oldDate < date) {
        localStorage.removeItem(key);
      }
    }
    (_a = document.querySelector("div.spotdj")) == null ? void 0 : _a.remove();
  }

  // src/page.tsx
  var LikedSongs = "LIKED_SONGS";
  var Plyalist = "PLAYLIST";
  var Album = "ALBUM";
  var Artist = "ARTIST";
  var ArtistLiked = "ARTIST_LIKED";
  var Other = "OTHER";
  var Preferences = "PREFERENCES";
  async function checkPagePath() {
    window.setInterval(pageCheker, 300);
  }
  async function pageCheker() {
    if (!Spicetify.Platform && !Spicetify.Platform.History) {
      return;
    }
    const path = getPageType();
    if (path == Preferences) {
      injectCleaner();
      return;
    }
    injectTrackList(path);
  }
  function getPageType() {
    const pathname = Spicetify.Platform.History.location.pathname;
    let matches = null;
    if (pathname === "/preferences") {
      return Preferences;
    }
    if (pathname === "/collection/tracks") {
      return LikedSongs;
    }
    if (matches = pathname.match(/playlist\/(.*)/)) {
      return Plyalist;
    }
    if (matches = pathname.match(/album\/(.*)/)) {
      return Album;
    }
    if (matches = pathname.match(/artist\/([^/]*)$/)) {
      return Artist;
    }
    if (matches = pathname.match(/artist\/([^/]*)\/saved/)) {
      return ArtistLiked;
    }
    return Other;
  }

  // src/tempochange.tsx
  var label = document.createElement("label");
  var changeTrack;
  var keyChange;
  var tempoChange;
  var semitonesChange;
  function registerCtxMenuItem() {
    const cntxMenu = new Spicetify.ContextMenu.Item(
      "Tempo calculator",
      calculationWindow,
      isCalculationAvaliable
    );
    cntxMenu.register();
  }
  async function calculationWindow(uris) {
    var trackID = uris[0].split(":")[2];
    var info = await getTrackFeatures(trackID);
    changeTrack = info;
    semitonesChange = 0;
    tempoChange = info.tempo;
    keyChange = info.key.split("m")[0];
    labelUpdate(info.tempo, keyChange);
    const buttonUp = document.createElement("button");
    const buttonDown = document.createElement("button");
    buttonUp.textContent = "\u2B06";
    buttonUp.style.color = "black";
    buttonUp.style.width = "50px";
    buttonUp.name = "up";
    buttonUp.addEventListener("click", tempoChangeListener, false);
    buttonDown.textContent = "\u2B07";
    buttonDown.style.color = "black";
    buttonDown.style.width = "50px";
    buttonDown.name = "down";
    buttonDown.addEventListener("click", tempoChangeListener, false);
    Spicetify.PopupModal.display({
      title: "Tempo calculator",
      content: "<br> Change tempo: "
    });
    var modal = document.querySelector(".main-trackCreditsModal-originalCredits");
    modal == null ? void 0 : modal.prepend(label);
    modal == null ? void 0 : modal.append(buttonUp, buttonDown);
  }
  function labelUpdate(tempo, key) {
    var newKey = key + modeArr[changeTrack.mode];
    label.textContent = "Tempo: " + tempo + ", Key: " + newKey + "(" + camelotWheel.get(newKey) + "), Semitones: " + semitonesChange;
  }
  function isCalculationAvaliable(uris) {
    if (uris.length > 1) {
      return false;
    }
    const uri = uris[0];
    const uriObj = Spicetify.URI.fromString(uri);
    var trackID = uri.split(":")[2];
    const localFeature = localStorage.getItem("spotdj-" + trackID);
    if (uriObj.type !== Spicetify.URI.Type.TRACK || localFeature === null) {
      return false;
    }
    return true;
  }
  function tempoChangeListener(event) {
    var tempo = tempoChange;
    switch (event.currentTarget.name) {
      case "up": {
        tempo++;
        break;
      }
      case "down": {
        tempo--;
        break;
      }
    }
    let [key, semitones] = tempoChangeCalculator(changeTrack, tempo);
    semitonesChange = semitones;
    keyChange = key;
    tempoChange = tempo;
    labelUpdate(tempoChange, keyChange);
  }
  function tempoChangeCalculator(info, newTempo) {
    var bareKey = info.key.split("m")[0];
    var keyIndex = keyMapReverse.get(bareKey);
    const change = calculate(info.tempo, newTempo);
    const tone = Math.trunc(change);
    return [keyMap.get((keyIndex + tone) % 12), Number(change % 1).toFixed(2)];
  }
  function calculate(t1, t2) {
    return Math.round(Math.log(t2 / t1) / 0.05776227 * 100) / 100;
  }

  // src/app.tsx
  async function main() {
    await updateNowPlaying();
    await checkPagePath();
    registerCtxMenuItem();
  }
  var app_default = main;

  // node_modules/spicetify-creator/dist/temp/index.jsx
  (async () => {
    await app_default();
  })();
})();
