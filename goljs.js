// Overload array with matrix function
Array.matrix = function (m, n, initial) {
  var a, i, j, mat = [];
  for (i = 0; i < m; i++) {
    a = [];
    for (j = 0; j < n; j++) {
      a[j] = 0;
    }
    mat[i] = a;
  }
  return mat;
};

var goljs = new function() {

  var gol = this;
  var args = Array.prototype.slice.call(arguments, 0);

  // Document elements
  this.gridCanvas = document.getElementById("grid");
  this.counterSpan = document.getElementById("counter");
  this.peakSpan = document.getElementById("peakCells");
  this.minSpan = document.getElementById("minCells");
  this.controlLink = document.getElementById("controlLink");
  this.clearLink = document.getElementById("clearLink");
  this.randLink = document.getElementById("randLink");
  this.minimumSelect = document.getElementById("minimumSelect");
  this.maximumSelect = document.getElementById("maximumSelect");
  this.spawnSelect = document.getElementById("spawnSelect");


  this.CELL_SIZE = 16;
  this.X = 480;
  this.Y = 320;
  this.WIDTH = Math.floor(this.X / this.CELL_SIZE);
  this.HEIGHT = Math.floor(this.Y / this.CELL_SIZE);
  console.log("W:" + this.WIDTH + "H:" + this.HEIGHT);
  //this.DEAD = 0;
  //this.ALIVE = 1;
  this.DELAY = 500; // delay in ms

  // State variables
  this.STOPPED = 0;
  this.RUNNING = 1;
  this.state = this.STOPPED; // current state
  this.interval = null;

  this.minimum = 2;
  this.maximum = 3;
  this.spawn = 3;

  this.grid = Array.matrix(this.HEIGHT, this.WIDTH, 0);
  this.nextGenGrid = Array.matrix(this.HEIGHT, this.WIDTH, 0);
  this.cells = 0; // peak cell count
  this.minCells = 0; // min live cell count
  this.counter = 0; // Generation count

/**
 * name - nextGenCells
 * desc - using bitwise operators find neighbor counts for each cell and determine whether it should
 *   be alive or dead.  Then copy the nextGenGrid back to the main Grid for display
 * arguments - none
 * return - none
 */
  this.nextGenCells = function() {
    var x, y, count;
    var alivecount = 0;
    gol.nextGenGrid = Array.matrix(gol.HEIGHT, gol.WIDTH, 0);
    gol.copyGrid(gol.grid,gol.nextGenGrid);

    cell_row:
    for(y = 0; y < gol.HEIGHT;y++) { // repeat for each row of cells
      console.log("Processing row: " + (y+1));
      x = 0;
      do {
        while(gol.grid[y][x] == 0) { // skip as many blank cells in this row as possible
          x++;
          if(x >= (gol.WIDTH - 1)) {
            continue cell_row;
          } // if the whole row is blank skip to the next
        }
        // Found first cell that's either on or has neighbors
        // See if state needs to be changed
        count = gol.grid[y][x] >> 1; // # of neighboring on-cells

        if(gol.grid[y][x] & 0x01) {
          // Cell is on: turn it off if it doesn't have 2/3 neighbors
          alivecount++;
          if((count < gol.minimum) || (count > gol.maximum)) {
            // Live cell that needs to die
            console.log("Cell Off: " + (y+1) + ":" + (x+1) + ">" + count);
            gol.clearCell(y, x);
            alivecount--;
          }
        } else {
          // Cell is off: turn it on if it has 3 neighbors
          if(count == gol.spawn) {
            gol.setCell(y, x);
            alivecount++;
          }
        }
        x++;
      } while (x < gol.WIDTH);
    }
    // Update grid with nextGenGrid
    gol.copyGrid(gol.nextGenGrid, gol.grid);
    gol.counter++; // Update generation
    if(alivecount > gol.cells) {
      gol.cells = alivecount;
    }
    if(alivecount < gol.minCells) {
      gol.minCells = alivecount;
    }
  };

/**
 * name - clearCell
 * desc - using bitwise operators set cell to dead and decrement counter for all neighbor cells
 * arguments - y (height index of cell); x (width index of cell) in grid matrix
 * return - none
 */
  this.clearCell = function(y, x) {
    var xoleft, xoright, yoabove, yobelow;
    if(x == 0) {
      xoleft = gol.WIDTH - 1;
    } else {
      xoleft = -1;
    }
    if(y == 0) {
      yoabove = gol.HEIGHT-1;
    } else {
      yoabove = -1;
    }
    if (x == (gol.WIDTH - 1)) {
      xoright = 0;
    } else {
      xoright = 1;
    }
    if (y == (gol.HEIGHT-1)) {
      yobelow = 0;
    } else {
      yobelow = 1;
    }

    gol.nextGenGrid[y][x] &= ~0x01;
    gol.nextGenGrid[y + yoabove][x + xoleft] -= 2;
    gol.nextGenGrid[y + yoabove][x] -= 2;
    gol.nextGenGrid[y + yoabove][x + xoright] -= 2;
    gol.nextGenGrid[y][x + xoleft] -= 2;
    gol.nextGenGrid[y][x + xoright] -= 2;
    gol.nextGenGrid[y + yobelow][x + xoright] -= 2;
    gol.nextGenGrid[y + yobelow][x] -= 2;
    gol.nextGenGrid[y + yobelow][x + xoleft] -= 2;

  };

/**
 * name - setCell
 * desc - using bitwise operators set cell to alive and increment counter for all neighbor cells
 * arguments - y (height index of cell); x (width index of cell) in grid matrix
 * return - none
 */
  this.setCell = function(y, x) {
    var xoleft, xoright, yoabove, yobelow;
    if(x == 0) {
      xoleft = gol.WIDTH-1;
    } else {
      xoleft = -1;
    }
    if(y == 0) {
      yoabove = gol.HEIGHT-1;
    } else {
      yoabove = -1;
    }
    if (x == (gol.WIDTH-1)) {
      xoright = 0;
    } else {
      xoright = 1;
    }
    if (y == (gol.HEIGHT-1)) {
      yobelow = 0;
    } else {
      yobelow = 1;
    }

    gol.nextGenGrid[y][x] |= 0x01;
    gol.nextGenGrid[y + yoabove][x + xoleft] += 2;
    gol.nextGenGrid[y + yoabove][x] += 2;
    gol.nextGenGrid[y + yoabove][x + xoright] += 2;
    gol.nextGenGrid[y][x + xoleft] += 2;
    gol.nextGenGrid[y][x + xoright] += 2;
    gol.nextGenGrid[y + yobelow][x + xoright] += 2;
    gol.nextGenGrid[y + yobelow][x] += 2;
    gol.nextGenGrid[y + yobelow][x + xoleft] += 2;

  };

/**
 * name - copyGrid
 * desc - copy source grid array to destination grid array
 * arguments - source and destination grids
 * return - none
 */
  this.copyGrid = function(source, destination) {
    for (var h = 0; h < gol.HEIGHT; h++) {
      destination[h] = source[h].slice(0);
    }
  };

/**
 * name - update
 * desc - primary function to update goljs grid and cells
 * arguments - none, uses current object instance variables
 * return - none
 */
  this.update = function() {
    gol.nextGenCells();
    gol.updateAnimations();
  };

/**
 * name - updateAnimations
 * desc - loops through current grid and updates cell colors/animations
 * arguments - none, uses current object instance grid & DOM objects
 * return - none
 */
  this.updateAnimations = function() {
    for (var y = 0; y < gol.HEIGHT; y++) {
      for (var x = 0; x < gol.WIDTH; x++) {
        if (gol.grid[y][x] & 0x01) {
          gol.context.fillStyle = "#000";
        } else {
          gol.context.fillStyle = "#00F4FF";
        }
        gol.context.fillRect(
          x * gol.CELL_SIZE +1,
          y * gol.CELL_SIZE +1,
          gol.CELL_SIZE -1,
          gol.CELL_SIZE -1);
      }
    }
    gol.counterSpan.innerHTML = gol.counter;
    gol.peakSpan.innerHTML = gol.cells;
    gol.minSpan.innerHTML = gol.minCells;
  };

/**
 * name - Cell
 * desc - generate a cell on the matrix
 * arguments - row and column number to reference the cell
 * return - object
 */
  this.Cell = function(row, column) {
    this.row = row;
    this.column = column;
  };

/**
 * name - randomStart
 * desc - generate random number of cells in the matrix, at least the max cell count rule
 * arguments - seed is an optional variable (and currently unused)
 * return - int number of cells generated
 */
  this.randomStart = function(seed) {
  seed = typeof seed !== 'undefined' ? seed : Math.floor((Math.random() * 1000) + 1);
    // Determine max # of cells, we can't generate more than that...
   var max = gol.WIDTH * gol.HEIGHT;
   var count = 0;
   var neighbors = 0;
   gol.nextGenGrid = Array.matrix(gol.HEIGHT, gol.WIDTH, 0);
    // Generate random # of cells based on max & seed
   gol.cells = Math.floor((Math.random() * max + 1));

    // Loop through array and populate random number of cells up to max
    for (var y = 0; y < gol.HEIGHT; y++) {
      for (var x = 0; x < gol.WIDTH; x++) {
        if((Math.round(Math.random()) == 1) && (count <= gol.cells)) {
          neighbors = gol.nextGenGrid[y][x] >> 1; // # of neighboring on-cells
          if(neighbors <= gol.maximum) {
              gol.setCell(y,x);
              count++;
          }
        }
      }
    }
    gol.copyGrid(gol.nextGenGrid, gol.grid);
    gol.cells = count;
    gol.minCells = count;
    return gol.cells;
  };

/*********************************************************************
*
* DOM ELEMENT JS EVENTS
*
* ******************************************************************
* **/

/**
 * name - controlLink.onclick
 * desc - starts or stops the running state of the goljs instance
 * arguments - none
 * return - none
 */
  controlLink.onclick = function() {
    switch (gol.state) {
    case gol.STOPPED:
      gol.interval = setInterval(function() {
        gol.update();
      }, gol.DELAY);
      gol.state = gol.RUNNING;
      gol.controlLink.innerHTML = "STOP";
      break;
    default:
      clearInterval(gol.interval);
    gol.state = gol.STOPPED;
    gol.controlLink.innerHTML = "START";
    }
  };

/**
 * name - clearLink.onclick
 * desc - clears current state of the grid and stops the goljs instance
 * arguments - none
 * return - none
 */
  clearLink.onclick = function() {
    gol.grid = Array.matrix(gol.HEIGHT, gol.WIDTH, 0);
    gol.counter = 0;
    clearInterval(gol.interval);
    gol.state = gol.STOPPED;
    gol.updateAnimations();
    gol.controlLink.innerHTML = "START";
  };

/**
 * name - randLink.onclick
 * desc - generates random number of points on the grid
 * arguments - none
 * return - none
 */
  randLink.onclick = function() {
    gol.grid = Array.matrix(gol.HEIGHT, gol.WIDTH, 0);
    gol.counter = 0;
    clearInterval(gol.interval);
    gol.state = gol.STOPPED;
    gol.randomStart();
    gol.updateAnimations();
    gol.controlLink.innerHTML ="START";
  };
/**
 * name - minimumSelect.onchange
 * desc - sets the minimum required neighbors to stay alive, also resets the goljs state
 * arguments - none
 * return - none
 */
  minimumSelect.onchange = function() {
    clearInterval(gol.interval);
    gol.state = gol.STOPPED;
    gol.minimum = gol.minimumSelect.value;
  };

/**
 * name - minimumSelect.onchange
 * desc - sets the maximum required neighbors to stay alive, also resets the goljs state
 * arguments - none
 * return - none
 */
  maximumSelect.onchange = function() {
    clearInterval(gol.interval);
    gol.state = gol.STOPPED;
    gol.maximum = gol.maximumSelect.value;
  };

/**
 * name - minimumSelect.onchange
 * desc - sets the minimum required neighbors to spawn a cell, also resets the goljs state
 * arguments - none
 * return - none
 */
  spawnSelect.onchange = function() {
    clearInterval(gol.interval);
    gol.state = gol.STOPPED;
    gol.spawn = gol.spawnSelect.value;
  };

/****************************************************************************************************
**
 * Initialize html5 canvas object along with DOM events
 *
 *************************************************************************************************
 */


  this.initialize = function() {
    if (this.gridCanvas.getContext) {

      this.context = this.gridCanvas.getContext('2d');
      this.offset = this.CELL_SIZE;

      for (var x = 0; x <= this.X; x += this.CELL_SIZE) {
        this.context.moveTo(0.5 + x, 0);
        this.context.lineTo(0.5 + x, this.Y);
      }
      for (var y = 0; y <= this.Y; y += this.CELL_SIZE) {
        this.context.moveTo(0, 0.5 + y);
        this.context.lineTo(this.X, 0.5 + y);
      }
      this.context.strokeStyle = "#fff";
      this.context.stroke();

      this.canvasOnClickHandler = function(event) {
        var cell = gol.getCursorPosition(event);
        gol.copyGrid(gol.grid,gol.nextGenGrid);
        if(gol.grid[cell.row][cell.column] & 0x01) {
          gol.clearCell(cell.row,cell.column);
        }  else {
          gol.setCell(cell.row,cell.column);
        }
        gol.copyGrid(gol.nextGenGrid,gol.grid);
        gol.updateAnimations();
      };

      this.getCursorPosition = function(event) {
        var x;
        var y;
        if (event.pageX || event.pageY) {
          x = event.pageX;
          y = event.pageY;
        } else {
          x = event.clientX
            + document.body.scrollLeft
            + document.documentElement.scrollLeft;
          y = event.clientY
            + document.body.scrollTop
            + document.documentElement.scrollTop;
        }

        x -= gol.gridCanvas.offsetLeft;
        y -= gol.gridCanvas.offsetTop;

        var cell = new gol.Cell(Math.floor((y - 4) / gol.CELL_SIZE),
          Math.floor((x - 2) / gol.CELL_SIZE));
        return cell;
      };


      this.gridCanvas.addEventListener("click", this.canvasOnClickHandler, false);
      // Start it up with a random number of cells
      clearInterval(this.interval);
      this.state = this.STOPPED;
      this.randomStart();
      this.updateAnimations();
      this.controlLink.innerHTML ="START";

    } else {
      alert("HTML5 Canvas is required to run The Game of Life - Rally Code Test. Please enable HTML5 capabilities or use another browser, such as Safari or Chrome.");
    }
  };

};
goljs.initialize();
