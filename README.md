# js-blocking-queue

This is a simple asynchronous queue with an unbounded buffer (puts never block, takes can block if the buffer is empty).

The implementation is quite simple, mostly because of the single-threaded nature of javascript which allowed me to make some assumptions on the execution of the code.