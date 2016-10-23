---
layout: default
title: I've got 99 problems and asynchronous programming is 127 of them
date: 2016-10-24 16:30:00 +0200

code:
  language: javascript
---

<script src="https://assets.codepen.io/assets/embed/ei.js" async defer></script>

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

### Now, on to the meat.

So, JavaScript is most certainly a concurrent language. Nothing makes this clearer than *node.js*, a programming environment designed to make code as ugly as possible.

*/me waits for boos*

Seriously. This code, courtesy of [Callback Hell][], demonstrates the problem:

    fs.readdir(source, function (err, files) {
      if (err) {
        console.log('Error finding files: ' + err)
      } else {
        files.forEach(function (filename, fileIndex) {
          console.log(filename)
          gm(source + filename).size(function (err, values) {
            if (err) {
              console.log('Error identifying file size: ' + err)
            } else {
              console.log(filename + ' : ' + values)
              aspect = (values.width / values.height)
              widths.forEach(function (width, widthIndex) {
                height = Math.round(width / aspect)
                console.log('resizing ' + filename + 'to ' + height + 'x' + height)
                this.resize(width, height).write(dest + 'w' + width + '_' + filename, function(err) {
                  if (err) console.log('Error writing file: ' + err)
                })
              }.bind(this))
            }
          })
        })
      }
    })

Not a huge amount of fun.

[Callback Hell]: http://callbackhell.com/

Of course, callback hell isn't just reserved for the server—it happens on the client too. And it never starts like the mess you see above. Usually, it grows from just one or two callbacks, or even starts synchronous and is refactored for performance later.

## Part 1: introducing asynchronous JavaScript

Here's a simple synchronous application that sings the song, "99 Bottles Of Beer On The Wall".

<p data-height="600" data-theme-id="0" data-slug-hash="VKqJgk" data-default-tab="js,result" data-user="SamirTalwar" data-embed-version="2" class="codepen">See the Pen <a href="https://codepen.io/SamirTalwar/pen/VKqJgk/">99 bottles</a> by Samir Talwar (<a href="http://codepen.io/SamirTalwar">@SamirTalwar</a>) on <a href="http://codepen.io">CodePen</a>.</p>

Running it has some… surprising results. There's no timing, so it runs to completion and we only see the last verse. You've been spared. For now.

To introduce delays into JavaScript code, we can't just do what you'd do in your standard (badly-written) console application:

    while (int i = 0; i < 1000000000; i++)
      ;

Not only will that eat up way more CPU than your users would like, it'll block the browser and other JavaScript from running—hardly a great solution. Instead, we use the [`setTimeout`][setTimeout] function.

<p data-height="600" data-theme-id="0" data-slug-hash="YGdorP" data-default-tab="js,result" data-user="SamirTalwar" data-embed-version="2" class="codepen">See the Pen <a href="https://codepen.io/SamirTalwar/pen/YGdorP/">99 bottles, take 2</a> by Samir Talwar (<a href="http://codepen.io/SamirTalwar">@SamirTalwar</a>) on <a href="http://codepen.io">CodePen</a>.</p>

… and the same thing happens. Why?

`setTimeout` takes two parameters: a function to run and the time to wait before running it. In actual fact, it doesn't run it directly—it just adds it to the event loop's queue. This means that the following code is a bit broken:

      for (let i = count; i > 0; --i) {
        setTimeout(() => {
          lineOne.textContent = `${bottles(i)} of beer on the wall, ${bottles(i)} of beer.`
          lineTwo.textContent = `Take one down and pass it around, ${bottles(i - 1)} of beer on the wall.`
        }, 400)
      }

That loop runs pretty much instantly. 400 milliseconds later, 99 functions are added the event queue and then run in order. If you look at `setTimeout` here as emulating a long-running piece of work, it's as if we ran 99 operations in parallel and they all finished at the same time. Often, this is what we want, but sometimes it's a lot more sensible to do things one (or 5, or 10) at a time.

In order to prevent this, we need to stagger the operations.

OK, no problem. We can do that.

<p data-height="600" data-theme-id="0" data-slug-hash="kkzKmp" data-default-tab="js,result" data-user="SamirTalwar" data-embed-version="2" class="codepen">See the Pen <a href="https://codepen.io/SamirTalwar/pen/kkzKmp/">99 bottles, take 3</a> by Samir Talwar (<a href="http://codepen.io/SamirTalwar">@SamirTalwar</a>) on <a href="http://codepen.io">CodePen</a>.</p>

This snippet calls `setTimeout` at the end of each iteration. We've gone from a loop to a kind of recursion, triggering the next iteration as the last step of the current one.

Run it, and you'll see it tick down. Enjoy the song. I'll wait.

…

*/me whistles*

Back? Notice something odd?

It doesn't terminate. We never asked it to, after all. Let's add a separate event to trigger when everything should finish.

<p data-height="600" data-theme-id="0" data-slug-hash="BLvXok" data-default-tab="js,result" data-user="SamirTalwar" data-embed-version="2" class="codepen">See the Pen <a href="https://codepen.io/SamirTalwar/pen/BLvXok/">99 bottles, take 4</a> by Samir Talwar (<a href="http://codepen.io/SamirTalwar">@SamirTalwar</a>) on <a href="http://codepen.io">CodePen</a>.</p>

You probably noticed that the song goes faster the more beer is drunk. That's always my experience singing it. I'm not sure if it's due to the alcohol or if people just really, really want to get to the end.

By my calculations, each iteration takes 200 milliseconds on average. We've scheduled the first to take 400ms and the last to take 4ms. So let's multiply 200 by the count + 1 and wait that long to stop.

      setTimeout(() => {
        clearTimeout(currentDelay)
      }, 200 * (count + 2))

That'll stop it in its tracks. If you ran it when you saw it, it's probably stopped by now. How'd it go?

On my machine, here's what I see:

> 17 bottles of beer on the wall, 17 bottles of beer.

> Take one down and pass it around, 16 bottles of beer on the wall.

\17. Convenient. What if we wait another 200ms? If you click the Edit link, you can add one to the multiplier yourself and find out.

Give it a try.

Oh. It's gone negative, you say. Wonderful.

There's got to be a better way than this. And I'm sure you've already spotted it yourself, you astute banana. You were probably shaking your head this whole time.

Right. On we go.

<p data-height="600" data-theme-id="0" data-slug-hash="PGVpgQ" data-default-tab="js,result" data-user="SamirTalwar" data-embed-version="2" class="codepen">See the Pen <a href="https://codepen.io/SamirTalwar/pen/PGVpgQ/">99 bottles, take 5</a> by Samir Talwar (<a href="http://codepen.io/SamirTalwar">@SamirTalwar</a>) on <a href="http://codepen.io">CodePen</a>.</p>

We took a leaf out of the functional programming handbook and used recursion to solve the last problem, and we all know recursion has to have a base case. Here's ours:

        if (i === 0) {
          return
        }

Easy peasy. Well done, you. Top banana indeed.

[setTimeout]: https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setTimeout

#### A chapter you weren't expecting

This is quite elegant, but not the easiest thing to read. Perhaps you'd like to see something much closer to the original `for` loop.

You might be aware that there's a library called [*async*][async] that often does a lot of the heavy lifting for you. Often it can handle this kind of asynchronous problem by doing the recursion under the hood. In doing so, you can write code that's a lot closer to the kind of synchronous code that's so easy to read, while still taking advantage of asynchronous semantics.

<p data-height="600" data-theme-id="0" data-slug-hash="rroXrq" data-default-tab="js,result" data-user="SamirTalwar" data-embed-version="2" class="codepen">See the Pen <a href="https://codepen.io/SamirTalwar/pen/rroXrq/">99 bottles, take 6</a> by Samir Talwar (<a href="http://codepen.io/SamirTalwar">@SamirTalwar</a>) on <a href="http://codepen.io">CodePen</a>.</p>

First, we create an array of all the numbers we care about, in order. Creating an array of all the work up front can be prohibitive, but in this case it works. (I'm hoping *async* will support JavaScript's new iterators soon, but it doesn't as of the time of writing.)

Then we use the `async.eachSeries` function. This invokes a function on each element of our array, one at a time. It passes a callback to our function, then waits for it to be invoked before moving on to the next item in the array. By invoking that callback using `setTimeout`, we can make each iteration take as long as we like.

Incidentally, if you want to run all the operations in parallel, you can just use `async.each`. There's also `async.map`, which invokes a callback at the end with a new array based on the values passed to the callback, and many other functions designed to make asynchronous code look more like synchronous code. Go have fun.

[async]: https://caolan.github.io/async/

#### Oh, wait, another one

We're not done yet. This one's just for fun—I don't expect you to use this technique directly, but you'll enjoy it.

<p data-height="600" data-theme-id="0" data-slug-hash="ozmBLa" data-default-tab="js,result" data-user="SamirTalwar" data-embed-version="2" class="codepen">See the Pen <a href="https://codepen.io/SamirTalwar/pen/ozmBLa/">99 bottles, take 7</a> by Samir Talwar (<a href="http://codepen.io/SamirTalwar">@SamirTalwar</a>) on <a href="http://codepen.io">CodePen</a>.</p>

This one makes use of a brand new JavaScript (ES6) language feature: [*generators*][Iterators and Generators]. A generator is essentially a function that can *yield* many values before terminating. The return value of the function is an iterator, and only by iterating over it does the function actually run. Each time we ask for the next value of the iterator, the function runs a little more, until it finally terminates.

Iterators are beyond the scope of this article, but I'd recommend [reading about them][Iterators and Generators]. What's interesting here is that we have two functions, `song` and `display`, which are effectively *co-routines*. Each one triggers the other, until they finally stop. Using generators, we can use language constructs like our beloved `for` loop but still maintain the asynchronous behaviour we need.

If you want to explore this further, I'd also recommend looking into the [*co*][co] library, which is designed to use generators to help you write synchronous-looking code that's asynchronous all the way through.

[Iterators and Generators]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
[co]: https://github.com/tj/co
