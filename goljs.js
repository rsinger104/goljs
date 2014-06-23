// Overload array with matrix function
Array.matrix = function (m, n, initial) {
  var a, i, j, mat = [];
  for (i = 0; i < m; i += 1) {
    a = [];
    for (j = 0; j < n; j += 1) {
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
  this.DEAD = 0;
  this.ALIVE = 1;
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
  this.cells = 0; // peak cell count
  this.minCells = 0; // min live cell count
  this.counter = 0; // Generation count
/**
 * name - updateState 
 * desc - find alive/dead cells for nextgen and copy to grid for next pass
 * arguments - none
 * return - none
 */
  this.updateState = function() {
    var neighbors;
    var nextGenGrid = Array.matrix(gol.HEIGHT, gol.WIDTH, 0);
    var alivecount = 0;

    for (var h = 0; h < gol.HEIGHT; h++) {
      for (var w = 0; w < gol.WIDTH; w++) {
        neighbors = gol.calculateNeighbors(h, w);
        if (gol.grid[h][w] !== gol.DEAD) {
          if ((neighbors >= gol.minimum) &&
            (neighbors <= gol.maximum)) {
              nextGenGrid[h][w] = gol.ALIVE;
              alivecount++;
          }
        } else {
          if (neighbors === gol.spawn) {
            nextGenGrid[h][w] = gol.ALIVE;
            alivecount++;
          }
        }
      }
    }
    gol.copyGrid(nextGenGrid, gol.grid);
    gol.counter++;
    if(alivecount > gol.cells) {
      gol.cells = alivecount;
    }
    if(alivecount < gol.minCells) {
      gol.minCells = alivecount;
    }
  };

/**
 * name - calculateNeighbors  
 * desc - count living neighbors for cell-n
 * arguments - x & y coordinates of cell-n
 * return - number of living neighbors for cell-n
 */
  this.calculateNeighbors = function(y, x) {
    var total = (gol.grid[y][x] !== gol.DEAD) ? -1 : 0;

    for (var h = -1; h <= 1; h++) {
      for (var w = -1; w <= 1; w++) {
        if (gol.grid
          [(gol.HEIGHT + (y + h)) % gol.HEIGHT]
          [(gol.WIDTH + (x + w)) % gol.WIDTH] !== gol.DEAD) {
              total++;
        }
      }
    }
    return total;
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
    gol.updateState();
    gol.updateAnimations();
  };

/**
 * name - updateAnimations  
 * desc - loops through current grid and updates cell colors/animations
 * arguments - none, uses current object instance grid & DOM objects
 * return - none
 */
  this.updateAnimations = function() {
    for (var h = 0; h < gol.HEIGHT; h++) {
      for (var w = 0; w < gol.WIDTH; w++) {
        if (gol.grid[h][w] === gol.ALIVE) {
          gol.context.fillStyle = "#000";
        } else {
          gol.context.fillStyle = "#00F4FF";
          //context.clearRect();
        }
        gol.context.fillRect(
          w * gol.CELL_SIZE +1,
          h * gol.CELL_SIZE +1,
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
    gol.updateAnimations();
    gol.randomStart();
    gol.update();
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

  this.setOptions = function() {
    gol.CELL_SIZE = 8;
    gol.X = 320;
    gol.Y = 320;
    gol.WIDTH = Math.floor(gol.X / gol.CELL_SIZE);
    gol.HEIGHT = Math.floor(gol.Y / gol.CELL_SIZE);
    gol.DEAD = 0;
    gol.ALIVE = 1;
    gol.DELAY = 500; // delay in ms
    
    // State variables
    gol.STOPPED = 0; 
    gol.RUNNING = 1;
    gol.state = gol.STOPPED; // current state
    gol.interval = null;
    
    gol.minimum = 2;
    gol.maximum = 3;
    gol.spawn = 3;

    gol.grid = Array.matrix(gol.HEIGHT, gol.WIDTH, 0);
    
    gol.counter = 0;
  };

  this.randomStart = function(seed) {
    seed = typeof seed !== 'undefined' ? seed : Math.floor((Math.random() * 1000) + 1);
    // Determine max # of cells, we can't generate more than that...
   var max = gol.WIDTH * gol.HEIGHT;
   var count = 0;
    // Generate random # of cells based on max & seed
    gol.cells = Math.floor((Math.random() * max + 1));

    // Loop through array and populate random number of cells up to max
    for (var h = 0; h < gol.HEIGHT; h++) {
      for (var w = 0; w < gol.WIDTH; w++) {
        if((Math.round(Math.random()) == 1) && (count <= gol.cells)) {
          gol.grid[h][w] = gol.ALIVE;
          count++;
        } 
      }
    }
    gol.cells = count;
    gol.minCells = count;
    return gol.cells;
  };

/****************************************************************************************************
**
 * Initialize html5 canvas object along with DOM events
 * 
 *************************************************************************************************
 */



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
        var state = gol.grid[cell.row][cell.column]
          == gol.ALIVE ? gol.DEAD : gol.ALIVE;
        gol.grid[cell.row][cell.column] = state;
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
      this.grid = Array.matrix(this.HEIGHT, this.WIDTH, 0);
      this.counter = 0;
      clearInterval(this.interval);
      this.state = this.STOPPED;
      this.randomStart();
      gol.update();
      gol.controlLink.innerHTML ="START";

    } else {
      alert("HTML5 Canvas is required to run The Game of Life - Rally Code Test. Please enable HTML5 capabilities or use another browser, such as Safari or Chrome.");
    }

};


