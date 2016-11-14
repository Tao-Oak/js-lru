// Test which will run in nodejs
// $ node test.js
// (Might work with other CommonJS-compatible environments)
const assert = require('assert');
const LRUCache = require('./lru').LRUCache;
const tests = {

basics() {
  let c = new LRUCache(4);
  assert(c.size == 0);
  assert(c.limit == 4);
  assert(!c.head);
  assert(!c.tail);

  c.put('adam', 29);
  c.put('john', 26);
  c.put('angela', 24);
  c.put('bob', 48);
  assert.equal(c.toString(), 'adam:29 < john:26 < angela:24 < bob:48');
  assert.equal(c.size, 4);

  assert.equal(c.get('adam'), 29);
  assert.equal(c.get('john'), 26);
  assert.equal(c.get('angela'), 24);
  assert.equal(c.get('bob'), 48);
  assert.equal(c.toString(), 'adam:29 < john:26 < angela:24 < bob:48');

  assert.equal(c.get('angela'), 24);
  assert.equal(c.toString(), 'adam:29 < john:26 < bob:48 < angela:24');

  c.put('ygwie', 81);
  assert.equal(c.toString(), 'john:26 < bob:48 < angela:24 < ygwie:81');
  assert.equal(c.size, 4);
  assert.equal(c.get('adam'), undefined);

  c.set('john', 11);
  assert.equal(c.toString(), 'bob:48 < angela:24 < ygwie:81 < john:11');
  assert.equal(c.get('john'), 11);

  let expectedKeys = ['bob', 'angela', 'ygwie', 'john'];
  c.forEach(function(k, v) {
    //sys.puts(k+': '+v);
    assert.equal(k, expectedKeys.shift());
  })

  // removing one item decrements size by one
  let currentSize = c.size;
  assert(c.remove('john') !== undefined);
  assert.equal(currentSize - 1, c.size);
},

remove() {
  let c = new LRUCache(4);
  c.put('adam', 29);
  c.put('john', 26);
  c.remove('adam');
  c.remove('john');
  assert.equal(c.size, 0);
  assert.equal(c.head, undefined);
  assert.equal(c.tail, undefined);
},

shift() {
  let c2 = new LRUCache(4);
  assert(c2.size == 0);
  c2.put('a', 1)
  c2.put('b', 2)
  c2.put('c', 3)
  assert.equal(c2.size, 3);

  let e = c2.shift();
  assert.equal(e.key, 'a');
  assert.equal(e.value, 1);
  
  e = c2.shift();
  assert.equal(e.key, 'b');
  assert.equal(e.value, 2);
  
  e = c2.shift();
  assert.equal(e.key, 'c');
  assert.equal(e.value, 3);

  // c2 should be empty
  c2.forEach(function () { assert(false); }, true);
  assert.equal(c2.size, 0);
},

// v0.1 allows putting same key multiple times. v0.2 does not.
put() {
  // [version=0.1]
  c = new LRUCache(4);
  c.put(0, 1);
  c.put(0, 2);
  c.put(0, 3);
  c.put(0, 4);
  assert.equal(c.size, 4);
  assert.deepEqual(c.shift(), {key:0, value:1, newer: undefined, older: undefined });
  assert.deepEqual(c.shift(), {key:0, value:2, newer: undefined, older: undefined });
  assert.deepEqual(c.shift(), {key:0, value:3, newer: undefined, older: undefined });
  assert.deepEqual(c.shift(), {key:0, value:4, newer: undefined, older: undefined });
  assert.equal(c.size, 0); // check .size correct
  c.forEach(function(){assert(false)}, undefined, true);  // check .tail correct

  // [version=0.2]
  // c = new LRUCache(4);
  // c.put(0, 1);
  // c.put(0, 2);
  // c.put(0, 3);
  // c.put(0, 4);
  // assert.equal(c.size, 4);
  // assert.deepEqual(c.shift(), {key:0, value:1, newer: undefined, older: undefined });
  // assert.deepEqual(c.shift(), {key:0, value:2, newer: undefined, older: undefined });
  // assert.deepEqual(c.shift(), {key:0, value:3, newer: undefined, older: undefined });
  // assert.deepEqual(c.shift(), {key:0, value:4, newer: undefined, older: undefined });
  // assert.equal(c.size, 0); // check .size correct
  // c.forEach(function(){assert(false)}, undefined, true);  // check .tail correct
},


toJSON() {
  let c = new LRUCache(4);
  c.put('adam', 29);
  c.put('john', 26);
  c.put('angela', 24);
  c.put('bob', 48);
  let json = c.toJSON();
  assert(json.length == 4);
  assert.deepEqual(json, [
    {key:'adam', value:29},
    {key:'john', value:26},
    {key:'angela', value:24},
    {key:'bob', value:48},
  ]);
},


}; // tests


function fmttime(t) {
  return (Math.round((t)*10)/10)+'ms';
}

function die(err) {
  console.error('\n' + (err.stack || err));
  process.exit(1);
}

function runNextTest(tests, testNames, allDoneCallback) {
  let testName = testNames[0];
  if (!testName) {
    return allDoneCallback();
  }
  process.stdout.write(testName+' ... ');
  let t1 = Date.now();
  let next = function() {
    t1 = Date.now() - t1;
    process.stdout.write('ok ('+fmttime(t1)+')\n');
    runNextTest(tests, testNames.slice(1), allDoneCallback);
  };
  try {
    let p = tests[testName]();
    if (p && p instanceof Promise) {
      p.then(next).catch(die);
    } else {
      next();
    }
  } catch (err) {
    die(err);
  }
}

runNextTest(tests, Object.keys(tests), function() {
  console.log(Object.keys(tests).length+' tests passed');
});
