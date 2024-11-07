// Function to delete element from the array
function removeFromArray(arr, ele) {
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == ele) {
      arr.splice(i, 1);
    }
  }
}

// an educated guess of how far it is between two points
function heuristic(a, b) {
  var d = dist(a.i, a.j, b.i, b.j);
  return d;
}

// number of columns and rows
var cols = 45;
var rows = 45;

// 2D
var grid = new Array(cols);

// Open and closed set
var openSet = [];
var closedSet = [];

// Start and end
var start;
var end;

// width and height of each cell of grid
var w, h;

// path taken
var path = [];

// flag to check if simulation has started
var simulationStarted = false;

function setup() {
  createCanvas(630, 630);
  randomSeed(3);
  console.log('A*');

  // "Start Algorithm" button
  let startButton = createButton('Start Algorithm');
  startButton.mousePressed(startAlgorithm);
  startButton.class('start-button');

  // "Change Layout" button
  let changeLayoutButton = createButton('Change Layout');
  changeLayoutButton.mousePressed(changeLayout);
  changeLayoutButton.class('change-button');

  // "Open Modal" button
  let modalButton = createButton('Open Info');
  modalButton.mousePressed(openModal);
  modalButton.class('modal-button');

  // opening info at start
  openModal();
  
  // grid cell size
  w = width / cols;
  h = height / rows;

  // initialize the grid
  initGrid();

  // draw the initial grid
  background(62, 143, 215);
  drawGrid(); // calling it to draw the grid initially

  // initialize the message as empty
  updateMessage("");
}

// Function to initialize the grid
function initGrid() {
  for (var i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
  }

  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j] = new Cell(i, j);
    }
  }

  // add all the neighbours
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j].addNeighbors(grid);
    }
  }

  // Start and End
  start = grid[0][0];
  end = grid[rows - 1][cols - 1];
  // Start and end cell should never be a wall
  start.wall = false;
  end.wall = false;
}

// function to change layout
function changeLayout() {
  // changing random seed to a new value
  randomSeed(floor(random(1, 100))); // generating a random seed between 1 and 100

  // reinitialize grid with new layout
  initGrid();

  // clearing background and redraw grid
  background(62, 143, 215);
  drawGrid();

  // update message
  updateMessage("Layout changed!");
}

// function to start algorithm
function startAlgorithm() {
  // Reset the open and closed sets and path
  openSet = [];
  closedSet = [];
  path = [];

  openSet.push(start);

  // clear background and redraw the grid
  background(62, 143, 215);
  drawGrid();

  // simulation starting message
  updateMessage("Finding optimal path...");

  // setting the simulation started flag to true
  simulationStarted = true;

  loop(); // start draw loop
}

// Function to open the modal
function openModal() {
  // Create modal background
  let modalBackground = createDiv('');
  modalBackground.id('modal-background');
  modalBackground.style('position', 'fixed');
  modalBackground.style('top', '0');
  modalBackground.style('left', '0');
  modalBackground.style('width', '100%');
  modalBackground.style('height', '100%');
  modalBackground.style('background-color', 'rgba(0, 0, 0, 0.15)');
  modalBackground.style('opacity', '0.8');
  modalBackground.style('display', 'flex');
  modalBackground.style('justify-content', 'center');
  modalBackground.style('align-items', 'center');

  // Create modal content
  let modalContent = createDiv(`
    <h2>A* Algorithm Simulation</h2>
    <p>The leftmost top corner is the starting point, and the rightmost bottom corner is the ending point.</p>
    <p>This simulation uses the A* search algorithm to find the shortest path between the start and end points in a grid.</p>
    <strong>How A* Works:</strong>
    <ul>
      <li>A* searches through a space of possibilities to find a solution.</li>
      <li>It uses heuristics (educated guesses) to avoid checking every possible path.</li>
      <li>Cost function: <strong>f(n) = g(n) + h(n)</strong></li>
      <li><strong>h(n)</strong>: Estimated cost to reach the end.</li>
      <li><strong>g(n)</strong>: Actual cost from the start to the current node.</li>
      <li><strong>f(n)</strong>: Total cost for each node.</li>
    </ul>
    <strong>Sets Used in Code:</strong>
    <ul>
      <li><strong>Open Set</strong>: Nodes that need evaluation.</li>
      <li><strong>Closed Set</strong>: Nodes that have been evaluated.</li>
    </ul>
    <p>The algorithm completes when the open set is empty, indicating either a path has been found or it's unsolvable.</p>
    <p>For detailed explanation, check the <a href="http://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html" target="_blank">A* Algorithm Guide</a>.</p>

    <div style="text-align: center;">
      <button id="close-modal">Close</button>
    </div>
  `);

  modalContent.style('text-align', 'left'); // Align text to the left
  modalContent.style('background-color', 'white');
  modalContent.style('padding', '20px');
  modalContent.style('border-radius', '8px');
  modalContent.style('max-width', '600px');
  modalContent.style('overflow', 'auto');

  modalBackground.child(modalContent);
  document.body.appendChild(modalBackground.elt); // Append modal to the body

  // close functionality
  select('#close-modal').mousePressed(() => {
    modalBackground.remove(); // Remove the modal background
  });
}

// Function to draw the grid
function drawGrid() {
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j].show();
    }
  }
}

function draw() {
  // main algorithm
  if (openSet.length > 0) { // keep searching
    // lowest cost index
    var winner = 0;
    for (var i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[winner].f) {
        winner = i;
      }
    }
    var current = openSet[winner];

    // found the end state?
    if (current === end) {
      noLoop();
      updateMessage("Path found!"); // Update to show the path is found
      console.log("DONE!");
    }

    // best option moves from openSet to closedSet
    removeFromArray(openSet, current);
    closedSet.push(current);

    // check all the neighbors
    var neighbors = current.neighbors;
    for (var i = 0; i < neighbors.length; i++) {
      var neighbor = neighbors[i];

      // valid next cell?
      if (!closedSet.includes(neighbor) && !neighbor.wall) {
        var tempG = current.g + heuristic(neighbor, current);
        var newPath = false;

        if (openSet.includes(neighbor)) { // if neighbor already exist in open set use the minimal g
          if (tempG < neighbor.g) {
            neighbor.g = tempG;
            newPath = true;
          }
        } else {
          neighbor.g = tempG;
          newPath = true;
          openSet.push(neighbor);
        }

        // Yes, it's a better path
        if (newPath) {
          neighbor.h = heuristic(neighbor, end);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.previous = current;
        }
      }
    }
  } else {                  // show "No path!"
    if (simulationStarted) {
      updateMessage("No path!"); // Update to show no path found
      console.log('no solution');
    }
    noLoop();
    return;
  }

  // current state of everything
  background(62, 143, 215, 1);
  drawGrid(); // redraw the grid for the current state

  for (var i = 0; i < closedSet.length; i++) {
    closedSet[i].show(color(252, 238, 33, 3));
  }

  for (var i = 0; i < openSet.length; i++) {
    openSet[i].show(color(130, 255, 92, 3));
  }

  // finding the path by working backwards (backtraking the path)
  path = [];
  var temp = current;
  path.push(temp);
  while (temp.previous) {
    path.push(temp.previous);
    temp = temp.previous;
  }

  // drawing path as continuous line
  noFill();
  stroke(255, 125, 65);
  strokeWeight(w / 2);
  beginShape();
  for (var i = 0; i < path.length; i++) {
    vertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
  }
  endShape();
}

function updateMessage(msg) {
  select('#message').html(msg);
}
