const imgInput = document.getElementById("imgInput");
const textInput = document.getElementById("textInput");
const panel = document.getElementById("panel");
const ghostIcon = document.getElementById("ghostIcon");
const ctx = panel.getContext("2d");
const gtx = ghostIcon.getContext("2d");
const textContainer = document.getElementById("textContainer");
const imgYOffset = document.getElementById("imgYOffset");
const imgScale = document.getElementById("imgScale");
const imgScaleValue = document.getElementById("imgScaleValue");
const backgroundCanvas = document.getElementById("background");
const bgCtx = backgroundCanvas.getContext("2d");
const styleSelect = document.getElementById("styleSelect");
const fontSelect = document.getElementById("fontSelect");

let maskImage = null;
let resultCanvas = null;
let scrollOffset = 0;
let ghostStarted = false;
let placeholder = null;
let backgroundTile = null;
let backgroundScrollOffset = 0;

// Define all available panels with their preset text and style
const panelPresets = {
  roots: {
    text: "根",
    style: "default",
    yOffset: 38,
  },
  gallery: {
    text: "画廊",
    style: "default",
    yOffset: 20,
  },
  "initial-1": {
    text: "预言，遁于暗影之间，\\n低语绵延。",
    style: "default",
    yOffset: 16,
  },
  "initial-2": {
    text: "预言，世间之传说，\\n名为<三角符文>的传说。",
    style: "default",
    yOffset: 52,
  },
  "main-1": {
    text: "世间普照，至纯之光。\\n下有永夜，日益滋长。",
    style: "default",
  },
  "main-2": {
    text: "若诸泉获释，呼啸降临人间。\\n遂泰坦成形，自那黑暗之眼。",
    style: "default",
    yOffset: 20,
  },
  "main-3": {
    text: "光暗两界，烈火正狂。\\n灾期已定，大地将亡。",
    style: "default",
    yOffset: 32,
  },
  "heroes-1": {
    text: "但请看，藉由希望梦想之信念，\\n三英雄，现身世界寰宇之边沿。",
    style: "default",
  },
  "heroes-4": {
    text: "第一位英雄，囚笼。\\n承载人之灵魂，驾驭人之躯形！",
    style: "susie",
    yOffset: 36,
  },
  "heroes-2": {
    text: "第二位英雄，少女。\\n她满怀希望，心中坚定。",
    style: "susie",
    yOffset: 25,
  },
  "heroes-3": {
    text: "第三位英雄，王子。\\n置身黑暗，孤苦伶仃",
    style: "susie",
    yOffset: 54,
  },
  "rude-buster": {
    text: "最后，是那少女。\\n终究，是那少女。",
    style: "susie",
  },
  "joke-1": {
    text: "JOCKINGTON蓄起胡须。",
    style: "default",
  },
  "joke-2": {
    text: "头顶尖尖之人，将言\\n“牙膏”，与“小子”。",
    style: "default",
    yOffset: 45,
  },
  "boss-1": {
    text: "女王战车，\\n势不可挡。",
    style: "default",
    yOffset: 65,
  },
  "boss-2": {
    text: "被刀刃割成红色。",
    style: "susie",
    yOffset: 42,
  },
  "boss-3": {
    text: "爱花之郎，\\n其身陷于庇护房。",
    style: "default",
    yOffset: 22,
  },
  knight: {
    text: "骑士来袭，\\n手执黑刃。",
    style: "default",
    yOffset: 20,
  },
  "heaven-hell-1": {
    text: "他们，将闻天国之钟，\\n猝然长鸣。",
    style: "default",
    yOffset: 20,
  },
  "heaven-hell-2": {
    text: "他们，将逢地狱之尾，\\n暗处潜行。",
    style: "default",
    yOffset: 32,
  },
  end: {
    text: "最终悲剧，也将揭开面纱。",
    style: "default",
    yOffset: 55,
  },
  hammer: {
    text: "龟之巨锤，经由雕刻，\\n铸成那斧。",
    style: "default",
  },
};

function getRandomPanel() {
  const panelNames = Object.keys(panelPresets);
  const randomIndex = Math.floor(Math.random() * panelNames.length);
  return panelNames[randomIndex];
}

function loadImageFromFile(imagePath) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const tileSize = 256;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = tileSize;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(img, 0, 0, tileSize, tileSize);
      resolve(canvas);
    };
    img.onerror = (e) => {
      console.error("Failed to load image from ./assets/depth.png:", e);

      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 256;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(128, 0, 128, 128);
      ctx.fillStyle = "#0000ff";
      ctx.fillRect(0, 128, 128, 128);
      ctx.fillStyle = "#ffff00";
      ctx.fillRect(128, 128, 128, 128);
      resolve(canvas);
    };
    img.src = imagePath;
  });
}

function drawPanel() {
  if (!maskImage || !placeholder) return;

  scrollOffset = (scrollOffset + 1) % placeholder.width;
  ctx.clearRect(0, 0, 512, 512);
  ctx.imageSmoothingEnabled = false;

  const useOriginalRes = false;
  const canvasSize = useOriginalRes
    ? Math.max(maskImage.width, maskImage.height, 256)
    : 256;

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = tempCanvas.height = canvasSize;
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.imageSmoothingEnabled = false;

  const offset = scrollOffset % placeholder.width;

  for (
    let y = -offset;
    y < canvasSize + placeholder.height;
    y += placeholder.height
  ) {
    for (
      let x = -offset;
      x < canvasSize + placeholder.width;
      x += placeholder.width
    ) {
      tempCtx.drawImage(placeholder, x, y);
    }
  }

  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = maskCanvas.height = canvasSize;
  const maskCtx = maskCanvas.getContext("2d");
  maskCtx.clearRect(0, 0, canvasSize, canvasSize);
  maskCtx.imageSmoothingEnabled = false;

  let dx, dy, dw, dh;

  if (useOriginalRes) {
    dw = maskImage.width;
    dh = maskImage.height;
    dx = (canvasSize - dw) / 2;
    dy = (canvasSize - dh) / 2;
  } else {
    const scale = Math.min(
      canvasSize / maskImage.width,
      canvasSize / maskImage.height
    );
    dw = maskImage.width * scale;
    dh = maskImage.height * scale;
    dx = (canvasSize - dw) / 2;
    dy = (canvasSize - dh) / 2;
  }

  maskCtx.drawImage(maskImage, dx, dy, dw, dh);

  const maskData = maskCtx.getImageData(0, 0, canvasSize, canvasSize);
  const texData = tempCtx.getImageData(0, 0, canvasSize, canvasSize);
  const result = tempCtx.createImageData(canvasSize, canvasSize);

  for (let i = 0; i < maskData.data.length; i += 4) {
    const r = maskData.data[i];
    const g = maskData.data[i + 1];
    const b = maskData.data[i + 2];
    const a = maskData.data[i + 3];
    const brightness = (r + g + b) / 3;

    if (brightness > 200 && a > 0) {
      result.data[i] = texData.data[i];
      result.data[i + 1] = texData.data[i + 1];
      result.data[i + 2] = texData.data[i + 2];
      result.data[i + 3] = 255;
    } else {
      result.data[i + 3] = 0;
    }
  }

  resultCanvas = document.createElement("canvas");
  resultCanvas.width = resultCanvas.height = canvasSize;
  resultCanvas.getContext("2d").putImageData(result, 0, 0);

  let scale = parseFloat(imgScale.value);

  const scaledW = resultCanvas.width * scale;
  const scaledH = resultCanvas.height * scale;
  const scaledX = (512 - scaledW) / 2;
  const scaledY = (256 - scaledH) / 2 - parseInt(imgYOffset.value, 10);

  ctx.drawImage(
    resultCanvas,
    0,
    0,
    resultCanvas.width,
    resultCanvas.height,
    scaledX,
    scaledY,
    scaledW,
    scaledH
  );
}

function drawGhostIcon() {
  if (!resultCanvas) return;

  const t = performance.now() / 1000;
  const offset1 = Math.sin(t * 2) * 6;
  const offset2 = offset1 * 2;

  gtx.clearRect(0, 0, 512, 512);
  gtx.imageSmoothingEnabled = false;
  gtx.setTransform(1, 0, 0, 1, offset1, offset1);

  let scale = parseFloat(imgScale.value);
  const scaledW = resultCanvas.width * scale;
  const scaledH = resultCanvas.height * scale;
  const scaledX = (512 - scaledW) / 2;
  const scaledY = (256 - scaledH) / 2 - parseInt(imgYOffset.value, 10);

  gtx.drawImage(
    resultCanvas,
    0,
    0,
    resultCanvas.width,
    resultCanvas.height,
    scaledX,
    scaledY,
    scaledW,
    scaledH
  );
  gtx.setTransform(1, 0, 0, 1, 0, 0);

  const gtx2 = document.getElementById("ghostIcon2").getContext("2d");
  gtx2.clearRect(0, 0, 512, 512);
  gtx2.imageSmoothingEnabled = false;
  gtx2.setTransform(1, 0, 0, 1, offset2, offset2);
  gtx2.drawImage(
    resultCanvas,
    0,
    0,
    resultCanvas.width,
    resultCanvas.height,
    scaledX,
    scaledY,
    scaledW,
    scaledH
  );
  gtx2.setTransform(1, 0, 0, 1, 0, 0);

  requestAnimationFrame(drawGhostIcon);
}

function drawBackground() {
  if (!backgroundTile) return;

  backgroundScrollOffset =
    (backgroundScrollOffset + 0.5) % backgroundTile.width;
  bgCtx.clearRect(0, 0, 512, 256);
  bgCtx.imageSmoothingEnabled = false;

  const scale = parseFloat(imgScale.value);
  const yOffset = -parseInt(imgYOffset.value, 10);

  // Scale the background tile size
  const scaledTileWidth = backgroundTile.width * scale;
  const scaledTileHeight = backgroundTile.height * scale;

  const offset = (backgroundScrollOffset * scale) % scaledTileWidth;

  // Draw scaled background tiles
  for (
    let y = -offset + yOffset;
    y < 256 + scaledTileHeight + yOffset;
    y += scaledTileHeight
  ) {
    for (let x = -offset; x < 512 + scaledTileWidth; x += scaledTileWidth) {
      bgCtx.drawImage(backgroundTile, x, y, scaledTileWidth, scaledTileHeight);
    }
  }

  const canvasSize = 256;
  const scaledW = canvasSize * scale;
  const scaledH = canvasSize * scale;
  const imageX = (512 - scaledW) / 2;
  const imageY = 64 + yOffset;

  // Scale the gradient radii based on the scale factor
  const radiusX = 160 * scale;
  const radiusY = 100 * scale;

  bgCtx.save();

  bgCtx.translate(imageX + scaledW / 2, imageY);
  bgCtx.scale(radiusX / radiusY, 1);
  bgCtx.translate(-(imageX + scaledW / 2), -imageY);

  const gradient = bgCtx.createRadialGradient(
    imageX + scaledW / 2,
    imageY,
    0,
    imageX + scaledW / 2,
    imageY,
    radiusY
  );
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(0.6, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,1)");

  bgCtx.fillStyle = gradient;
  bgCtx.fillRect(0, 0, 512, 256);

  bgCtx.restore();
}

function tryStartGhost() {
  if (!ghostStarted && resultCanvas) {
    ghostStarted = true;
    requestAnimationFrame(drawGhostIcon);
  }
}

imgInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    maskImage = img;
    drawPanel();
    tryStartGhost();
  };
  img.src = URL.createObjectURL(file);
});

textInput.addEventListener("input", () => {
  const formattedText = (textInput.value || "Your prophecy here").replace(
    /\\n/g,
    "<br>"
  );
  textContainer.innerHTML = formattedText;
});

function getAssetPath(name) {
  const style = styleSelect.value;
  const font = fontSelect.value;
  const suffix = style === "susie" ? "-susie" : "";
  return `./assets/depth/${name}${suffix}.png`;
}

function reloadAssetsAndRedraw() {
  Promise.all([
    loadImageFromFile(getAssetPath("depth-blue")),
    loadImageFromFile(getAssetPath("depth-text")),
    loadImageFromFile(getAssetPath("depth-darker-new")),
  ]).then(([tile, textBG, bgTile]) => {
    placeholder = tile;
    backgroundTile = bgTile;
    textContainer.style.backgroundImage = `url(${textBG.toDataURL()})`;
    if (maskImage) drawPanel();
    drawBackground();
    document.body.classList.toggle(
      "susie-theme",
      styleSelect.value === "susie"
    );
  });
}

// 添加事件监听器
fontSelect.addEventListener('change', function() {
    // 获取当前选中的值
    const selectedValue = this.value;

    // 根据选中的值设置不同的字体
    switch(selectedValue) {
        case 'default':
            textContainer.style.fontFamily =
              'PropheryType, "Prophecy-monica", "unifont", serif';
            textContainer.style.lineHeight = "1";
            break;
        case 'default-mzpx':
            textContainer.style.fontFamily =
              'PropheryType, "Prophecy-MZPX", serif';
            textContainer.style.lineHeight = "1";
            break;
        case 'default-kagurazaka':
            textContainer.style.fontFamily =
              'PropheryType, "Prophecy-Kagurazaka", "Prophecy-VonwaonBitmap", "Prophecy-Mingliu", serif';
            textContainer.style.lineHeight = "1.3";
            break;
        default:
            // 默认字体
            textContainer.style.fontFamily =
              'PropheryType, "Prophecy-monica", "unifont", serif';
            textContainer.style.lineHeight = "1";
    }
});

reloadAssetsAndRedraw();
setInterval(() => {
  drawPanel();
  drawBackground();
}, 1000 / 30);

imgYOffset.addEventListener("input", () => {
  imgYOffsetValue.textContent = imgYOffset.value + "px";
  if (maskImage) {
    drawPanel();
    drawBackground();
  }
});

imgScale.addEventListener("input", () => {
  imgScaleValue.textContent = parseFloat(imgScale.value).toFixed(2) + "×";
  if (maskImage) {
    drawPanel();
    drawBackground();
  }
});

window.addEventListener("load", () => {
  // Get random panel
  const randomPanelName = getRandomPanel();
  const randomPanel = panelPresets[randomPanelName];

  console.log(`Loading random panel: ${randomPanelName}`);

  // Set the style first
  styleSelect.value = randomPanel.style;
  document.body.classList.toggle("susie-theme", randomPanel.style === "susie");

  // Set the text
  textInput.value = randomPanel.text;
  const formattedText = randomPanel.text.replace(/\\n/g, "<br>");
  textContainer.innerHTML = formattedText;

  // Load the corresponding image
  const defaultImg = new Image();
  defaultImg.onload = () => {
    maskImage = defaultImg;
    // Reload assets with the correct style, then draw
    reloadAssetsAndRedraw();
    drawPanel();
    tryStartGhost();
  };
  defaultImg.onerror = () => {
    console.error(
      `Failed to load image: ./assets/base-panels/${randomPanelName}.png`
    );
    // Fallback to heroes-1 if the random image fails
    defaultImg.src = "./assets/base-panels/heroes-1.png";
  };
  defaultImg.src = `./assets/base-panels/${randomPanelName}.png`;

  // Set the Y offset if specified
  if (randomPanel.yOffset !== undefined) {
    imgYOffset.value = randomPanel.yOffset;
    document.getElementById("imgYOffsetValue").textContent =
      randomPanel.yOffset + "px";
  } else {
    // Reset to default if no custom offset
    imgYOffset.value = 0;
    document.getElementById("imgYOffsetValue").textContent = "0px";
  }
});

function animateSineWrapper() {
  const t = performance.now() / 1000;
  const offset = Math.sin(t * 1.5) * 10;
  const sineWrapper = document.getElementById("sineWrapper");
  if (sineWrapper) {
    sineWrapper.style.transform = `translateY(${offset}px)`;
  }
  requestAnimationFrame(animateSineWrapper);
}

requestAnimationFrame(animateSineWrapper);

styleSelect.addEventListener("change", reloadAssetsAndRedraw);
