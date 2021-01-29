window.addEventListener("load", function () {
  initMapWithUserPosition = (latitude, longitude) => {
    const userPosition = { lat: latitude, lng: longitude };
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 15,
      center: userPosition,
    });
    const marker = new google.maps.Marker({
      position: userPosition,
      map: map,
    });
    refresh();
    return map;
  };

  initMap = () => {
    status.textContent = "";
    const start = { lat: 53.424569149896655, lng: 14.550481589456405 };
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 10,
      center: start,
    });
    refresh();
    return map;
  };

  refresh = () => {
    const puzzle = document.querySelector("#puzzle");
    if (puzzle) {
      actions.appendChild(exportMapBtn);
      actions.removeChild(puzzle);
    } else actions.appendChild(exportMapBtn);
  };

  exportMap = (lat, lng, zoom) => {
    const link = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=488x488&key=${API_KEY}`;
    const status = document.querySelector("#status");
    const mapArea = document.getElementById("map");
    mapArea.innerHTML = "<img src = " + link + ">";
    status.innerHTML = "";

    exportMapBtn.parentNode.removeChild(exportMapBtn);
    let puzzle = document.createElement("button");
    puzzle.id = "puzzle";
    puzzle.textContent = "Potnij i pomieszaj";
    puzzle.classList.add("btn-primary", "flex-item");
    puzzle.addEventListener("click", cutImageUp);
    actions.appendChild(puzzle);
    image.src = link;
    image.setAttribute("crossOrigin", "anonymous");
  };

  cutImageUp = () => {
    imagePieces = [];
    for (var x = 0; x < 4; ++x) {
      for (var y = 0; y < 4; ++y) {
        var canvas = document.createElement("canvas");
        canvas.width = 122;
        canvas.height = 122;
        var context = canvas.getContext("2d");
        context.drawImage(
          image,
          x * 122,
          y * 122,
          122,
          122,
          0,
          0,
          canvas.width,
          canvas.height
        );
        imagePieces.push(canvas.toDataURL());
      }
    }
    setTable();
  };

  getRandom = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  generateUniqueRandomValuesArray = () => {
    let indices = [];
    while (indices.length < 16) {
      do nextIndex = getRandom(0, 15);
      while (indices.find((element) => element == nextIndex) != null);
      indices.push(nextIndex);
    }
    return indices;
  };

  setTable = () => {
    const mapArea = document.getElementById("map");
    let indices = generateUniqueRandomValuesArray();
    let number = -1;
    let divs = imagePieces.map((piece) => {
      return `<div id=imagePiece${number++} class="piece" draggable="true"> <img src=${piece}></div>`;
    });
    let columns = `<div class="piecesColumn">${
      divs[indices[0]] + divs[indices[1]] + divs[indices[2]] + divs[indices[3]]
    }</div>
    
    <div class="piecesColumn">${
      divs[indices[4]] + divs[indices[5]] + divs[indices[6]] + divs[indices[7]]
    }</div>
    <div class="piecesColumn">${
      divs[indices[8]] +
      divs[indices[9]] +
      divs[indices[10]] +
      divs[indices[11]]
    }</div>
    <div class="piecesColumn">${
      divs[indices[12]] +
      divs[indices[13]] +
      divs[indices[14]] +
      divs[indices[15]]
    }</div>`;
    mapArea.innerHTML = "<div class='piecesColumnGroup'>" + columns + "</div>";

    number = -1;
    let placesToDrop = imagePieces.map(() => {
      return `<div id=placeToDrop${number++} class="placeToDrop"></div>`;
    });
    let dropColumns = `<div class="dropColumn">${
      placesToDrop[0] + placesToDrop[1] + placesToDrop[2] + placesToDrop[3]
    }</div>
    <div class="dropColumn">${
      placesToDrop[4] + placesToDrop[5] + placesToDrop[6] + placesToDrop[7]
    }</div>
    <div class="dropColumn">${
      placesToDrop[8] + placesToDrop[9] + placesToDrop[10] + placesToDrop[11]
    }</div>
    <div class="dropColumn">${
      placesToDrop[12] + placesToDrop[13] + placesToDrop[14] + placesToDrop[15]
    }</div>`;
    mapArea.innerHTML +=
      "<div class='dropColumnGroup'>" + dropColumns + "</div>";

    let items = document.querySelectorAll(".piece, .placeToDrop");
    items.forEach(function (item) {
      item.addEventListener("dragstart", handleDragStart, false);
      item.addEventListener("dragover", handleDragOver, false);
      item.addEventListener("dragenter", handleDragEnter, false);
      item.addEventListener("dragleave", handleDragLeave, false);
      item.addEventListener("dragend", handleDragEnd, false);
      item.addEventListener("drop", handleDrop, false);
    });
  };

  function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", this.innerHTML);
  }

  function handleDragEnd(e) {
    this.classList.remove("over");
  }

  function handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    return false;
  }

  function handleDragEnter(e) {
    this.classList.add("over");
  }

  function handleDragLeave(e) {
    this.classList.remove("over");
  }

  function handleDrop(e) {
    e.stopPropagation();
    this.classList.remove("over");
    if (dragSrcEl !== this) {
      dragSrcEl.innerHTML = this.innerHTML;
      this.innerHTML = e.dataTransfer.getData("text/html");
    }
    if (this.classList.contains("placeToDrop")) {
      this.classList.add("positioned");
    }
    dragSrcEl.classList.remove("positioned");
    if (isCompleted()) {
      console.log("Puzzle prawidłowo ułożone");
      var text = "Puzzle ułożone w 100% prawidłowo. Gratulacje.";
      setTimeout(() => new Notification("Wygrana!", { body: text }), 100);
    }
    return false;
  }

  isCompleted = () => {
    let divs = document.querySelectorAll(".positioned");
    if (divs.length >= 16) {
      let imgDOMelements = imagePieces.map((element) => {
        return `<img src="${element}">`;
      });
      for (var index = 0; index < divs.length; index++)
        if (imgDOMelements[index] != divs[index].innerHTML) return false;
      return true;
    }
    return false;
  };

  geoFindMe = () => {
    function success(position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      status.innerHTML =
        "Twoje współrzędne: </br>" + latitude + ", " + longitude;
      map = initMapWithUserPosition(latitude, longitude);
    }

    function error() {
      status.textContent = "Brak możliwości lokalizacji";
    }

    if (!navigator.geolocation) {
      status.textContent =
        "Geolokalizacja nie jest wspierana przez Twoją przeglądarkę";
    } else {
      status.textContent = "Lokalizuję…";
      navigator.geolocation.getCurrentPosition(success, error);
    }
  };

  Notification.requestPermission();

  const status = document.querySelector("#status");
  const actions = document.querySelector("#actions");
  const exportMapBtn = document.querySelector("#export-map");
  let map = initMap();
  let image = new Image();
  let imagePieces = [];

  document.querySelector("#find-me").addEventListener("click", geoFindMe);
  document
    .querySelector("#reset")
    .addEventListener("click", () => (map = initMap()));
  exportMapBtn.addEventListener("click", () => {
    let center = map.getCenter();
    let latitude = center.lat();
    let longitude = center.lng();
    let zoom = map.zoom;
    exportMap(latitude, longitude, zoom);
  });
});
