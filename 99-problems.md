---
layout: default
title: I've got 99 problems and asynchronous programming is 127 of them
date: 2016-10-24 16:30:00 +0200

code:
  language: javascript
---

Concurrency is hard, am I right?

Or, at least, it was, before JavaScript came along. It solved this problem by not allowing concurrency.

Wait. That's not right.

JavaScript runtimes don't (normally) allow *parallelism*.

Wow, this is confusing. Let's slow it down.

## Definitions, and how JavaScript fits in to all of this

### Parallelism

**Parallelism** is pretty important. If two things run in *parallel*, they are literally happening at the exact same time. It's tremendously useful for working on problems that can be subdivided. For example, a machine with an eight-core CPU will be able to run up to 8 distinct programs at once, allowing one of those programs to respond to the user while the other 7 work on other things. Alternatively, you could run a single program on all eight cores, letting it calculate π to ten million decimal places (up to) eight times faster.

Because parallelism is about real-world characteristics of your computer, it's (usually) reliant on your processor and your operating system. We typically either run multiple programs or multiple *threads* within the same program to achieve parallel processing, as a single thread doesn't allow you to run across multiple cores.

### Concurrency

Whereas parallelising code is all about spreading the workload, **concurrency** is a bit more academic. It's also *much more* important. *Concurrent* software is software that is written so that work may be interleaved without causing any problems.

All modern desktop operating systems are concurrent, in that they allow you, the operator, to run multiple programs at once without having to explicitly close down one to open another. This works even if you only have a single core on the processor, by doing a little bit of work in program A, then a little bit in program B, and so on.

Having a concurrent ("multi-tasking") operating system is important, but you can also write concurrent software of your own. Anything with a user interface is an obvious candidate—by writing the code in such a way that it is safe to click buttons at the same time that it's processing something else, you can avoid blocking the UI during heavy computation. Imagine how annoying it would be for your browser to stop responding until a page has finished loading, or if tabs couldn't run in the background.

As you can imagine, writing concurrent software is hard. It's difficult enough to ensure that a variable has the correct value at the correct time when you only have one thread of operation; when you have many, it becomes much more so. There's an entire field of study around concurrency, and modelling concurrent systems, often formally with [communicating sequential processes][], is a discipline in its own right.

Concurrent code doesn't require a system that supports parallelism, but if you do want to run code in parallel, it's generally considered sensible to ensure that it's written with concurrency in mind.

[communicating sequential processes]: https://en.wikipedia.org/wiki/Communicating_sequential_processes

### The event loop

In a concurrent system, it's pretty typical to use an **event loop**.

They look like this:

    while (let event = eventQueue.next()) {
      process(event)
    }

Often, these systems are concurrent, but *not* parallel. This means that both the `next` method and the `process` function are *blocking*. This means that if there's nothing on the queue yet, `next` will wait until one shows up before returning. Similarly, `process` won't return until processing has finished.

JavaScript runtimes (and browsers themselves) are modelled around an event loop just like this one. As a result, when developers started writing JavaScript, it was common for a web page to freeze up entirely until computation had finished. We quickly realised that this was a suboptimal user experience, and found new ways to ensure that events finished quickly, allowing user interaction to remain responsive.

### Asynchronous programming

If you've been writing client-side JavaScript code for a while, you'll remember `XMLHttpRequest`, which is how we used to do HTTP requests in the browser before jQuery, and then approximately seventeen billion other libraries, came along.

XMLHttpRequest is a JavaScript class (of sorts) that triggers an HTTP request and lets you inspect the response. [The very first iteration][The story of XMLHTTP] was *synchronous*: it blocked execution until it had a response.

You can still do this today:

    var request = new XMLHttpRequest()
    request.open('GET', 'something.json', false); // the "false" tells it to make a synchronous request
    request.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
    request.send(null); // No data needs to be sent along with the request
    // execution pauses here until we get a response
    alert('Response:\n' + this.responseText)

Blocking the browser from responding to input isn't very friendly, so it was quickly transformed to an asynchronous style. Asynchronous requests look something like this ([taken from Wikipedia][Wikipedia / XMLHttpRequest] and modified):

    var request = new XMLHttpRequest()
    request.onreadystatechange = function () {
      if (this.readyState === 4) {
        alert('Response:\n' + this.responseText)
      }
    }
    request.open('GET', 'something.json', true); // the third parameter is the "async" flag
    request.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
    request.send(null); // No data needs to be sent along with the request

Pleasant. The important thing is the function declared on lines 2–7:

    request.onreadystatechange = function () {
      var DONE = this.DONE || 4
      if (this.readyState === DONE) {
        alert('Response:\n' + this.responseText)
      }
    }

This function is executed whenever the *state* of the response changes. I can't remember what the various states were, but I do remember that when the `readyState` hit `4`, the response was complete, and could be determined to be successful or a failure.

Except that's not quite right. The function doesn't get triggered *immediately*, because that would require pausing your current execution if anything else was going on. Instead, an event is put on the queue, and when it gets to the front, the function is invoked.

This model of execution means that we can write functions that finish quickly and only queue up new work when it's time, allowing the website to stay responsive and allow the user to remain in control.

[The story of XMLHTTP]: http://www.alexhopmann.com/xmlhttp.htm
[Wikipedia / XMLHttpRequest]: https://en.wikipedia.org/wiki/XMLHttpRequest
