import test from 'tape';
import deepClone from '.';

test('work with objects', (t) => {
  var input = {
    'hello': 'world',
    'test': 'bla'
  }
  var output = deepClone(input);
  var expected = {
    'hello': 'world',
    'test': 'bla'
  }
  t.deepEqual(output, expected);
  t.equal(Object.is(input, output), false);
  t.end();
});

test('work with arrays', (t) => {
  var input = [1, 2, 3];
  var output = deepClone(input);
  var expected = [1, 2, 3];
  t.deepEqual(output, expected);
  t.equal(Object.is(input, output), false);
  t.end();
});

test('work with dates', (t) => {
  var input = new Date('July 9, 1986 08:32:00');
  var output = deepClone(input);
  var expected = new Date('July 9, 1986 08:32:00');
  t.equal(output.toISOString(), expected.toISOString());
  t.equal(Object.is(input, output), false);
  t.end();
});

test('work with numbers', (t) => {
  var output = deepClone(5);
  var expected = 5;
  t.deepEqual(output, expected);
  t.end();
});

test('work with strings', (t) => {
  var output = deepClone("beer");
  var expected = "beer";
  t.equal(output, expected);
  t.end();
});

test('work with null', (t) => {
  var output = deepClone(null);
  var expected = null;
  t.equal(output, expected);
  t.end();
});

test('work with booleans', (t) => {
  var output = deepClone(true);
  var expected = true;
  t.equal(output, expected);
  t.end();
});

test('work with functions', (t) => {
  var input = {
    bla: function() {}
  }
  var output = deepClone(input);
  t.equal(Object.is(input.bla, output.bla), true);
  t.end();
});

test('works with nested arrays', (t) => {
  var input = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  var output = deepClone(input);
  var expected = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  t.deepEqual(output, expected);
  t.equal(Object.is(input, output), false);
  t.equal(Object.is(input[0], output[0]), false);
  t.equal(Object.is(input[1], output[1]), false);
  t.equal(Object.is(input[2], output[2]), false);
  t.end()
});

test('works with nested objects', (t) => {
  var input = {
    "first": { "first": "object"},
    "second": { "second": "also object" },
    "third": { "third": "object" }
  };
  var output = deepClone(input);
  var expected = {
    "first": { "first": "object"},
    "second": { "second": "also object" },
    "third": { "third": "object" }
  };
  t.deepEqual(output, expected);
  t.equal(Object.is(output, expected), false);
  t.equal(Object.is(input.first, expected.first), false);
  t.equal(Object.is(input.second, expected.second), false);
  t.equal(Object.is(input.third, expected.third), false);
  t.end()
});
