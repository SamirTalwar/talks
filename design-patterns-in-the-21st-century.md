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
