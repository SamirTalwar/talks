---
layout: default
title: Design Patterns in the 21st Century
date: 2014-10-15 11:00:00 +0100

redirect_from: /
---

## Introduction
{: .notes}

<section markdown="1">
### Who are you?

<!-- <script src="https://gist.github.com/SamirTalwar/04cb9dfdaac3ecda97b5.js"></script> -->
</section>

<section markdown="1">
### What do you want from me?

I want you to stop using design patterns.
</section>

<section markdown="1">
### Um…

OK, let me rephrase that.
{: .notes}

I want you to stop using design patterns like it's *1999*.
</section>

<section class="slides-only" markdown="1">
## Let's Talk About Functional Programming

Functional programming is all about *functions*.
</section>

<section markdown="1">
## Let's Talk About Functional Programming

Functional programming is all about <em><del>functions</del> <ins>values</ins></em>.

<div class="fragment" markdown="1">
Values like this:

```java
int courses = 3;
```
</div>

<div class="fragment" markdown="1">
But also like this:

```java
Course dessert = prepareCake.using(eggs, butter, sugar, chocolate);
```
</div>
</section>

<section markdown="1">
And like this:

```java
Preparation prepareCake =
    (eggs, butter, sugar, special)
        -> new CakeMix(eggs, butter, sugar).with(special);
```

<div class="fragment" markdown="1">
Which of course, is the same as this:

```java
Preparation prepareCake = new Preparation() {
    @Override
    public Course using(Ingredient eggs, Ingredient butter, Ingredient sugar, Ingredient special) {
        return new CakeMix(eggs, butter, sugar).with(special);
    }
}
```
</div>
</section>

<section markdown="1">
But if we break apart that constructor…

```java
interface Preparation {
    Mix using(Ingredient eggs, Ingredient butter, Ingredient sugar);
}

interface Mix {
    Course with(Ingredient special);
}
```

<div class="fragment" markdown="1">
We can do something like this:

```java
Preparation prepareCake =
    (eggs, butter, sugar)
        -> special
            -> new CakeMix(eggs, butter, sugar).with(special);
```
</div>

<div class="fragment" markdown="1">
Which is the same as this:

```java
Preparation prepareCake =
    CakeMix::new;
```
</div>
</section>

<section markdown="1">
### Well.

<div class="fragment" markdown="1">
Yes. It's weird, but it works out.

The type of `CakeMix::new` is this:

```java
(Ingredient, Ingredient, Ingredient) -> CakeMix
```
</div>

<div class="fragment" markdown="1">
And `Preparation` looks like this:

```java
interface Preparation {
    Mix using(Ingredient eggs, Ingredient butter, Ingredient sugar);
}
```
</div>

The function is coercible to the type of the *functional interface*, `Preparation`. Functionally, they're equivalent, and from version 1.8 and up, the JVM knows how to turn lambdas into anything matching the types with a *Single Abstract Method*.
{: .notes}
</section>

<section markdown="1">
### Functions aren't everything, though.

Take this, for example:

```java
Preparation prepareSouffle = (eggs, butter, sugar) -> special -> {
    Recipe recipe = googleSouffleRecipeFor(special).first();
    return recipe.apply(eggs, butter, sugar, special);
}
```

Wait, *Google*?

<div class="notes">
This is no longer what we can call a **pure** function. It has a *side effect*, namely, that it connects to Google. That's not cool. Sure, it'll do the job… unless the network's down, or Google's down, or we're in China…

And sure, it's <del>a function</del> <ins>an object</ins>, but it's not one I can just pass around anywhere. It might get stored and run later, or run a hundred times, or any number of things that mean that its results are non-deterministic, slow and unreliable.

Which brings us to something called *referential transparency*.
</div>
</section>

<section markdown="1">
### Referential Transparency

Take a function:

```java
Predicate<Integer> isEven = x -> x % 2 == 0;
```

<div class="fragment" markdown="1">
Now apply it to a value:

```java
assert isEven.test(8);
assert !isEven.test(17);
```
</div>

<div class="fragment" markdown="1">
Logically, we can replace the function application with the result of the function.

```java
assert true;
assert !false;
```
</div>
</section>

<section markdown="1">
The expression can be said to be *referentially transparent*, because it is completely interchangeable with its value.

<div class="fragment" markdown="1">
This enables a few things:
</div>

<ul markdown="1">
<li class="fragment"><em>Correctness.</em> <span class="notes">We can easily verify, through automated testing or formal methods, that the function does as expected.</span></li>
<li class="fragment"><em>Simplification.</em> <span class="notes" markdown="1">When a function always has the same output for a given input, we can often use this knowledge to simplify our code, just like we did with the `CakeMix` above.</span></li>
<li class="fragment"><em>Optimization.</em> <span class="notes" markdown="1">This can take many forms, but most often the real wins are from [memoisation](http://en.wikipedia.org/wiki/Memoization), [lazy evaluation](http://en.wikipedia.org/wiki/Lazy_evaluation) and [parallelisation](http://en.wikipedia.org/wiki/Parallelization).</span></li>
</ul>
</section>

<section markdown="1">
### Immutability

In order for a function to be *pure*, like the one above, it has to follow one golden rule:

*For any given input, the function must always yield the same output.*

This sounds fairly simple, but lots of things can affect this. Any I/O operation at all means that can't happen. Even if you *know* that file's always there, you can still get an `IOException` for so many reasons, including low disk space, network connectivity problems, flaky USB drivers… the list is endless.
{: .notes}

In fact, the function can't deal with any outside state at all. It must have *no side effects*. That means no mutation of external variables or other state. Many functional languages don't allow *any* mutation at all in pure functions.
{: .notes}
</section>

<section markdown="1">
All this means that life will be much easier if we stop mutating values.

<div class="fragment" markdown="1">
Instead of:

```java
void withExtras(List<Thing> things) {
    things.add(extra);
}
```
</div>

<div class="fragment" markdown="1">
Why not:

```java
PList<Thing> withExtras(PList<Thing> things) {
    return things.plus(extra);
}
```
</div>

<div class="fragment" markdown="1">
We can call that second one as many times as we like.<br/>Same input, same output.
</div>
</section>
