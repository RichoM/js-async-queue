const Queue = require("./queue");

function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

function log(v) { console.log(v); }

async function producer(name, queue) {
  while (queue.length < 10) {
    await sleep(1000 + Math.random() * 2000);
    let item = `${name} -> ${queue.length}`;
    log(item);
    queue.put(item);
  }
  log(`>>>>>>>>>>>>>>>>>>>> Bye from ${name}`);
}

async function consumer(name, queue) {
  while (true) {
    log(`${name} sleeping...`);
    await sleep(1000 + Math.random() * 2000);
    log(`${name} attempting to retrieve item (remaining: ${queue.items.length})`);
    let item = await Promise.race([queue.take(), sleep(5000)]) // TODO(Richo): The other promise won't be canceled!
    if (!item) break;
    log(`${name} awake! Value: ${item}`);
  }
  log(`>>>>>>>>>>>>>>>>>>>> Bye from ${name}`);
}


async function main() {
  let queue = new Queue();

  consumer("C1", queue);
  consumer("C2", queue);

  await sleep(2000);

  producer("P1", queue);
  producer("P2", queue);
  producer("P3", queue);
  producer("P4", queue);

  await sleep(10000);

  log(">>>>>>>>>>>>>>>>>>>> Bye from main!");
}


main();
