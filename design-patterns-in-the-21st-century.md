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

<section markdown="1">
## On to the Good Stuff
</section>

<section markdown="1">
### What is a Design Pattern, anyway?

*Design Patterns* was a book written by the "Gang of Four" very nearly 20 years ago (at the time of writing this essay), which attempted to canonicalise and formalise the tools that many experienced software developers and designers found themselves using over and over again.
{: .notes}

<p style="text-align: center;"><img src="/assets/images/design-patterns.jpg" alt="Design Patterns, by Gamma, Helm, Johnson and Vlissides" style="max-width: 50%;"/></p>

By naming these patterns and providing a good starting point, they hoped to provide a consistent *language* for developers, as well as providing these tools up front.
{: .notes}
</section>

<section markdown="1">
The originator of the concept was the architect Christopher Alexander.
{: .notes}

> The elements of this language are entities called patterns. Each pattern describes a problem that occurs over and over again in our environment, and then describes the core of the solution to that problem, in such a way that you can use this solution a million times over, without ever doing it the same way twice. <cite>— Christopher Alexander</cite>
</section>

<section markdown="1">
### Bad Design Patterns

Not all design patterns in the Gang of Four's book are treated equally by contemporary programmers. A number of them are seen as examples of bad design.
{: .notes}

<div class="fragment" markdown="1">
Here's my favourite:

```java
public class DumpingGround {
    private static DumpingGround instance = null;

    private DumpingGround() { }

    public static synchronized DumpingGround getInstance() {
        if (instance == null) {
            instance = new DumpingGround();
        }
        return instance;
    }
}
```
</div>

<div class="fragment" markdown="1">
Ew.
</div>

There's so much wrong with that code. This is an example of the *singleton pattern*, which is an idiom for sharing an object throughout your codebase with minimum effort. Assuming you want to write code that is unmaintainable. Singleton objects are pervasive—they get everywhere—and so your design becomes incredibly coupled to this one object. That means that replacing it, changing it or reworking it is practically impossible. It also makes it very hard to test your code, as the singleton has state, and so it, and everything that depends on it, becomes referentially opaque.
{: .notes}

There are more bad design patterns, which I will not dwell on further. Let's take a look at one I quite like.
{: .notes}
</section>

<section markdown="1">
### The Abstract Factory Pattern

This pattern is used *everywhere* in Java code, especially in more "enterprisey" code bases. It looks something like this:

```java
public interface Bakery {
    Pastry bakePastry();
    Cake bakeCake();
}

public class DanishBakery {
    @Override public Pastry bakePastry() {
        return new DanishPastry();
    }

    @Override public Cake bakeCake() {
        return new Aeblekage();
    }
}
```
</section>

<section markdown="1">
That's a fairly general example. In actual fact, most factories only have one "create" method.

```java
public interface Bakery extends Supplier<Pastry> {
    @Override
    Pastry get();
}
```

<div class="fragment" markdown="1">
And often comply with a very generic interface:

```java
package java.util.function;

@FunctionalInterface
public interface Supplier<T> {
    /**
     * Gets a result.
     *
     * @return a result
     */
    T get();
}
```
</div>

<div class="fragment" markdown="1">
Oh look, a function.
</div>

This denegerate case is pretty common in in the Abstract Factory pattern, as well as many others. While most of them provide for lots of discrete pieces of functionality, and so have lots of methods, we often tend to break them up into single-method types, either for flexibility or because we just don't need more than one thing at a time.
{: .notes}
</section>

<section markdown="1">
So what's the functional equivalent to this?

<div class="fragment" markdown="1">
```java
Bakery danishPastryBakery = () -> new DanishPastry();
```
</div>

<div class="fragment" markdown="1">
Or simply:

```java
Supplier<Pastry> danishPastryBakery = DanishPastry::new;
```
</div>

Voila. Our interface has gone. In this case, we might want to keep it, as it has a name relevant to our business, but often, `Factory`-like objects serve no real domain purpose except to help us decouple our code. This is brilliant, but we don't need explicit classes for it—Java 8 has a bunch of interfaces built in that suit our needs fairly well.
{: .notes}

That `::` syntax is called a *method reference*, by the way. We'll see more of those in a moment.
{: .notes}
</section>

<section markdown="1">
### The Adapter Pattern

The Adapter pattern bridges worlds. In one world, we have an interface for a concept; in another world, we have a different interface. These two interfaces serve different purposes, but sometimes we need to transfer things across. In a well-written universe, we can use *adapters* to make objects following one protocol adhere to the other.
{: .notes}

There are two kinds of Adapter pattern. We're not going to talk about this one:

```java
interface Fire {
    <T> Burnt<T> burn(T thing);
}

interface Oven {
    Food cook(Food food);
}

class MakeshiftOven extends WoodFire implements Oven {
    @Override public Food cook(Food food) {
        Burnt<Food> noms = burn(food);
        return noms.scrapeOffBurntBits();
    }
}
```

This form, the *class Adapter pattern*, freaks me out, because `extends` gives me the heebie jeebies. *Why* is out of the scope of this essay; feel free to ask me any time and I'll gladly talk your ears (and probably your nose) off about it.
{: .notes}
</section>

<section markdown="1">
Instead, let's talk about the *object Adapter pattern*, which is generally considered far more useful and flexible in all regards.

<div class="fragment" markdown="1">
Let's take a look at the same class, following this alternative:

```java
class MakeshiftOven implements Oven {
    private final Fire fire;

    public MakeshiftOven(Fire fire) {
        this.fire = fire;
    }

    @Override public Food cook(Food food) {
        Burnt<Food> noms = fire.burn(food);
        return noms.scrapeOffBurntBits();
    }
}
```
</div>

<div class="fragment" markdown="1">
And we'd use it like this:

```java
Oven oven = new MakeshiftOven(fire);
Food bakedPie = oven.cook(pie);
```
</div>

<div class="fragment" markdown="1">
That's nice, right?
</div>
</section>

<section markdown="1">
Yes. Sort of. We can do better.

We already have a reference to a `Fire`, so constructing another object just to play with it seems a bit… overkill. And that object implements `Oven`. Which has a *single abstract method*. I'm seeing a trend here.
{: .notes}

Instead, we can make a function that does the same thing.
{: .notes}

<div class="fragment" markdown="1">
```java
Oven oven = food -> fire.burn(food).scrapeOffBurntBits();
Food bakedPie = oven.cook(pie);
```
</div>

<div class="fragment" markdown="1">
We could go one further and compose method references, but it actually gets worse.

```java
Function<Food, Burnt<Food>> burn = fire::burn;
Function<Food, Food> cook = burn.andThen(Burnt::scrapeOffBurntBits);
Oven oven = cook::apply;
Food bakedPie = oven.cook(pie);
```

This is because Java can't convert between functional interfaces implicitly, so we need to give it lots of hints about what each phase of the operation is. Lambdas, on the other hand, are implicitly coercible to any functional interface with the right types, and the compiler does a pretty good job of figuring out how to do it.
{: .notes}
</div>
</section>

<section markdown="1">
Often, though, all we really need is a method reference.

```java
Future<Sandwich> sandwichFuture
    = sudo.makeMeA(Sandwich.class);

Supplier<Sandwich> sandwichSupplier
    = sandwichFuture::get;
```

Java 8 has made adapters so much simpler that I hesitate to call them a pattern any more. They're just functions.
</section>
