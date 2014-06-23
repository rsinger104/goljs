// Verify that the dom objects exist
QUnit.test("Validating GoL Grid...", function( assert ) {
	domok = document.getElementById("grid") != null ? true : false;
	assert.ok( domok, "GoL Grid Initialized Successfully");
});

QUnit.test("Validating GoL Counter...", function( assert ) {
	domok = document.getElementById("counter") != null ? true : false;
	assert.ok( domok, "GoL Counter Initialized Successfully");
});

QUnit.test("Validating GoL Links...", function( assert ) {
	domok = document.getElementById("controlLink") != null ? true : false;
	domok = ((document.getElementById("clearLink") != null) && (domok != false)) ? true : false;
	assert.ok( domok, "GoL Links Initialized Successfully");
});

// verify we can generate random set of cells
QUnit.test( "Random GoL Cells", function( assert ) {
	cells = goljs.cells;
  assert.ok( cells >= 25, "Passed! " + cells + " randomnly generated.  Here we go...." );
});