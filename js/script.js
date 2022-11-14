import mapboxItems from "./mapboxItems.js";

// get a random integer between min and max inclusive, but also greater than zero and less than numColumns
function getRandomInt(min, max, type) {
  min = Math.ceil(min);
  max = Math.floor(max + 1);
  let randomValue = Math.floor(Math.random() * (max - min) + min);

  if (randomValue < 0) return 0;
  if (type === "x") {
    if (randomValue > numColumns - 1) return numColumns - 1;
  }
  return randomValue;
}

let grid = (window.grid = GridStack.initAll({
  staticGrid: true,
  margin: 1,
  oneColumnSize: 400,
}));

const calculateNumColumns = () => {
  // add a column for every 112 px of width past 560
  const MINWIDTH = 560;
  const PIXELS_PER_COLUMN = 112;

  let width = document.body.clientWidth;
  let numColumns = 4;

  const additionalColumns =
    Math.floor((width - MINWIDTH) / PIXELS_PER_COLUMN) + 1;

  return (numColumns += additionalColumns);
};

function resizeGrid() {
  const newNumColumns = calculateNumColumns();

  if (newNumColumns !== numColumns) {
    numColumns = newNumColumns;

    const cellHeight = `${100 / numColumns}vw`;

    // use the second grid to generate a new layout

    grid[0].column(numColumns, "none");
    grid[1].column(numColumns, "none");

    layoutTiles(1, () => {
      const layout = grid[1].save();
      grid[0].load(layout).cellHeight(cellHeight);
      grid[1].removeAll();
    });
  }
}

// build a gridstack widget based on type
const getWidget = (item) => {
  const { type, category, title, subTitle, link, iconClass, x, y } = item;
  const position = { x, y };
  const id = slugify(`${category}-${title}`, { lower: true });

  let content = `
  <div class="flip-card grid-stack-item-content-inner tile category-${category}">
    <div class="flip-card-inner">
      <div class="flip-card-front category-${category}">
          ${title}
          <div class='absolute left-2 bottom-4 text-xs flex items-center'>
          ${iconClass ? `<i class="fa-lg ${iconClass}"></i>` : ""}
          </div>
      </div>
      <div class="flip-card-back category-${category}">
        <a href = '${link}' target='_blank' noopener noreferrer>
          <div class="flip-card-back-inner">
              ${subTitle}
          </div>
        </a>
      </div>
    </div>
  </div>
`;

  let size = {
    minW: 1,
    maxW: 1,
    minH: 1,
    maxH: 1,
  };

  if (type === "category") {
    content = `
          <div class='wiggle-card cursor-pointer grid-stack-item-content-inner category-tile category-${category} group' data-category=${category}>
              <img src = './img/${category}.svg'>
              <div class='title'>${title}</div>
              <div class='subtitle'>${subTitle}</div>
              <div class='absolute bottom-3 invisible group-hover:visible text-xs'>Click to see tile descriptions</div>
          </div>
      `;

    size = {
      minW: 2,
      maxW: 2,
      minH: 2,
      maxH: 2,
    };
  }

  return {
    id,
    ...position,
    ...size,
    content,
  };
};

// scan the grid to find the first available 2x2 position
const getFreeNearbyPositionForCategory = (gridId) => {
  const node = { w: 2, h: 2}
  grid[gridId].engine.findEmptyPosition(node)
  const { x, y } = node
  return [x, y]
};

// find a nearby 1x1 adjacent to this tile's category tile
// if one cannot be found immediately adjacent to the category tile,
// go one row/column further out
const getFreeNearbyPosition = (categoryTilePosition, gridId) => {
  let attempts = 0;
  let depth = 1;

  const [categoryTileX, categoryTileY] = categoryTilePosition;

  while (true) {
    let x = getRandomInt(categoryTileX - 1, categoryTileX + depth + 1, "x");
    let y = getRandomInt(categoryTileY - 1, categoryTileY + depth + 1, "y");

    if (attempts > 15) {
      attempts = 0;
      depth += 1;
    }

    const isEmpty = grid[gridId].isAreaEmpty(x, y, 1, 1);

    if (isEmpty) {
      return [x, y];
    } else {
      attempts += 1;
    }
  }
};

const layoutTiles = (gridId, cb) => {
  var categoryTilePositions = {};

  var i = 0;
  function placeTile() {
    let x = 0;
    let y = 0;

    setTimeout(() => {
      const item = mapboxItems[i];

      if (item.type === "category") {
        [x, y] = getFreeNearbyPositionForCategory(gridId);
        categoryTilePositions[item.category] = [x, y];
      } else {
        [x, y] = getFreeNearbyPosition(
          categoryTilePositions[item.category],
          gridId
        );
      }

      grid[gridId].addWidget(
        getWidget({
          ...item,
          x,
          y,
        })
      ); //  your code here
      i++;
      if (i < mapboxItems.length) {
        placeTile();
      } else {
        cb();
      }
    }, 0);
  }

  placeTile();
};

let numColumns = calculateNumColumns();
grid[0].column(numColumns, "none");

layoutTiles(0, () => {
  // category click handlers
  const categoryTiles = document.querySelectorAll(".category-tile");
  categoryTiles.forEach((categoryTile) => {
    categoryTile.addEventListener("click", function handleClick(event) {
      const { category } = event.currentTarget.dataset;

      var list = document.querySelectorAll(`.tile.category-${category}`);
      const isFlipped = list[0].classList.contains(
        "flip-card-category-flipped"
      );

      for (var i = 0; i < list.length; ++i) {
        if (isFlipped) {
          list[i].classList.add("flip-card-category-default");
          list[i].classList.remove("flip-card-category-flipped");
        } else {
          list[i].classList.remove("flip-card-category-default");
          list[i].classList.add("flip-card-category-flipped");
        }
      }
    });
  });
});

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

window.addEventListener(
  "resize",
  debounce(function () {
    resizeGrid();
  })
);
