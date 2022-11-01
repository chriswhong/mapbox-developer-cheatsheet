import mapboxItems from "./mapboxItems.js";

// get a random integer between min and max inclusive, but also greater than zero and less than numColumns
function getRandomInt(min, max, type) {
  min = Math.ceil(min);
  max = Math.floor(max + 1);
  let randomValue = Math.floor(Math.random() * (max - min) + min);

  if (randomValue < 0) return 0;
  if (type === "x") {
    const numColumns = calculateNumColumns();
    if (randomValue > numColumns - 1) return numColumns - 1;
  }
  return randomValue;
}

let grid = GridStack.init({
  staticGrid: true,
  margin: 1,
});

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
  const numColumns = calculateNumColumns();

  const cellHeight = `${100 / numColumns}vw`;

  grid.column(numColumns, "moveScale").cellHeight(cellHeight);
}

// build a gridstack widget based on type
const getWidget = (item) => {
  const { type, category, title, subTitle, link, x, y } = item;
  const position = { x, y };
  if (type === "category") {
    return {
      ...position,
      minW: 2,
      maxW: 2,
      minH: 2,
      maxH: 2,
      content: `
            <div class='wiggle-card grid-stack-item-content-inner category-tile category-${category}'>
                <img src = './img/${category}.svg'>
                <div class='title'>${title}</div>
                <div class='subtitle'>${subTitle}</div>
            </div>
        `,
    };
  }

  return {
    ...position,
    minW: 1,
    maxW: 1,
    minH: 1,
    maxH: 1,
    content: `
        <div class="flip-card grid-stack-item-content-inner tile">
            <div class="flip-card-inner">
                <div class="flip-card-front category-${category}">
                    ${title}
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

        `,
  };
};

// scan the grid to find the first available 2x2 position
const getFreeNearbyPositionForCategory = () => {
  let x = 0;
  let y = 0;
  const numColumns = calculateNumColumns();
  while (true) {
    console.log("checking", x, y);
    const isEmpty = grid.isAreaEmpty(x, y, 2, 2);

    if (isEmpty) {
      return [x, y];
    } else if (x === numColumns - 1) {
      x = 0;
      y += 1;
    } else {
      x += 1;
    }
  }
};

// find a nearby 1x1 adjacent to this tile's category tile
// if one cannot be found immediately adjacent to the category tile,
// go one row/column further out
const getFreeNearbyPosition = (categoryTilePosition, category) => {
  let attempts = 0;
  let foundEmptyPosition = false;
  let depth = 1;

  const [categoryTileX, categoryTileY] = categoryTilePosition;

  while (true) {
    let x = getRandomInt(categoryTileX - 1, categoryTileX + depth + 1, "x");
    let y = getRandomInt(categoryTileY - 1, categoryTileY + depth + 1, "y");

    if (attempts > 15) {
      attempts = 0;
      depth += 1;
    }

    const isEmpty = grid.isAreaEmpty(x, y, 1, 1);

    if (isEmpty) {
      console.log(`${category} found and empty spot at ${x}, ${y} `);
      return [x, y];
    } else {
      attempts += 1;
    }
  }
};

const layoutTiles = () => {
  var categoryTilePositions = {};

  var i = 0;
  function placeTile() {
    let x = 0;
    let y = 0;

    setTimeout(() => {
      const item = mapboxItems[i];

      if (item.type === "category") {
        [x, y] = getFreeNearbyPositionForCategory();
        categoryTilePositions[item.category] = [x, y];
      } else {
        [x, y] = getFreeNearbyPosition(
          categoryTilePositions[item.category],
          item.category
        );
      }

      grid.addWidget(
        getWidget({
          ...item,
          x,
          y,
        })
      ); //  your code here
      i++;
      if (i < mapboxItems.length) {
        placeTile();
      }
    }, 0);
  }

  placeTile();
};

layoutTiles();
resizeGrid(); // finally size to actual window

window.addEventListener("resize", function () {
  resizeGrid();
});
