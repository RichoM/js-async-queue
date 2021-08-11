const Queue = require("./index");
const assert = require('assert');

function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

async function consumer(queue, iterations) {
  let values = [];
  for (let i = 0; i < iterations; i++) {
    values.push(await queue.take());
  }
  return values;
}

async function producer(queue, values, ms) {
  for (let i = 0; i < values.length; i++) {
    queue.put(values[i]);
    await sleep(ms || 0);
  }
}

it('sanity-check', function () {
  assert.equal(0, 0);
});

it("simple-put", async function () {
  let queue = new Queue();
  queue.put(1);
  assert.equal(1, queue.length);
});

it("simple-put-and-take", async function () {
  let queue = new Queue();
  queue.put(1);
  assert.equal(1, queue.length);
  assert.equal(1, await queue.take());
  assert.equal(0, queue.length);
});

it("take-before-put", function (done) {
  let queue = new Queue();
  queue.take().then(val => {
    assert.equal(1, val);
    done();
  });
  queue.put(1);
});

it("consumer-producer", async function () {
  let queue = new Queue();
  let expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  [actual, _] = await Promise.all([
    consumer(queue, 10),
    producer(queue, expected, 1)
  ]);
  assert.deepEqual(expected, actual);
});

it("single consumer, multiple producer", async function () {
  let queue = new Queue();
  let expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  [actual, _] = await Promise.all([
    consumer(queue, 10),
    producer(queue, expected.filter(n => n % 2 != 0)),
    producer(queue, expected.filter(n => n % 2 == 0)),
  ]);
  assert.deepEqual(expected, actual);
});
