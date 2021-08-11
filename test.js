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

it("simple put", async function () {
  let queue = new Queue();
  queue.put(1);
  assert.equal(queue.length, 1);
});

it("simple put and take", async function () {
  let queue = new Queue();
  queue.put(1);
  assert.equal(queue.length, 1);
  assert.equal(await queue.take(), 1);
  assert.equal(queue.length, 0);
});

it("take before put", function (done) {
  let queue = new Queue();
  queue.take().then(val => {
    assert.equal(val, 1);
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
  assert.deepEqual(actual, expected);
});

it("single consumer, multiple producers", async function () {
  let queue = new Queue();
  let expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  [actual, _] = await Promise.all([
    consumer(queue, 10),
    producer(queue, expected.filter(n => n % 2 != 0)),
    producer(queue, expected.filter(n => n % 2 == 0)),
  ]);
  assert.deepEqual(actual, expected);
});

it("single producer, multiple consumers", async function () {
  let queue = new Queue();
  producer(queue, [1, 2, 3, 4, 5, 6, 7, 8, 9], 1);
  await sleep(5);
  [a, b, c] = await Promise.all([
    consumer(queue, 3),
    consumer(queue, 3),
    consumer(queue, 3),
  ]);
  assert.deepEqual(a, [1, 4, 7]);
  assert.deepEqual(b, [2, 5, 8]);
  assert.deepEqual(c, [3, 6, 9]);
});

it("multiple producers, multiple consumers", async function () {
  let queue = new Queue();
  producer(queue, [1, 2, 3], 1);
  producer(queue, [4, 5, 6], 1);
  producer(queue, [7, 8, 9], 1);
  await sleep(5);
  [a, b, c] = await Promise.all([
    consumer(queue, 3),
    consumer(queue, 3),
    consumer(queue, 3),
  ]);
  assert.deepEqual(a, [1, 2, 3]);
  assert.deepEqual(b, [4, 5, 6]);
  assert.deepEqual(c, [7, 8, 9]);
});

it("FIFO", async function () {
  let queue = new Queue();
  let promises = [];
  take = () => promises.push(queue.take());
  queue.put(1);
  queue.put(2);
  take();
  queue.put(3);
  take();
  take();
  let actual = await Promise.all(promises);
  assert.deepEqual(actual, [1, 2, 3]);
});

it("FIFO 2", async function () {
  let queue = new Queue();
  let promises = [];
  take = () => promises.push(queue.take());
  take();
  take();
  queue.put(1);
  queue.put(2);
  queue.put(3);
  take();
  queue.put(4);
  take();
  let actual = await Promise.all(promises);
  assert.deepEqual(actual, [1, 2, 3, 4]);
});
