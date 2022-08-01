import mapboxItems from "./mapboxItems.js";

let grid = GridStack.init({
  staticGrid: true,
  margin: 1,
});

// add a column for every 112 px of width past 560
const MINWIDTH = 560;
const PIXELS_PER_COLUMN = 112;
function resizeGrid() {
  let width = document.body.clientWidth;

  let numColumns = 4;

  const additionalColumns =
    Math.floor((width - MINWIDTH) / PIXELS_PER_COLUMN) + 1;
  numColumns += additionalColumns;

  const cellHeight = `${100 / numColumns}vw`;

  grid.column(numColumns, "moveScale").cellHeight(cellHeight);
  grid.compact();
}

const items = mapboxItems.map((mapboxItem) => {
  const { type, category, title, subTitle } = mapboxItem;
  if (type === "category") {
    return {
        minW: 3,
        maxW: 3,
        minH: 3,
        maxH: 3,
        content: `
            <div class='grid-stack-item-content-inner category-tile category-${category}'>
                <div class='title'>${title}</div>
                <div class='subtitle'>${subTitle}</div>
            </div>
        `,
    };
  }

  return {
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
                    <div class="flip-card-back-inner">
                        ${subTitle}
                    </div>
                </div>
            </div>
        </div>

        `,
  };
});
grid.load(items);
resizeGrid(); // finally size to actual window

window.addEventListener("resize", function () {
  resizeGrid();
});
