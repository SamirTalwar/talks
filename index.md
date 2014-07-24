---
layout: default
---

# Highly Strung

## Introduction

### Who are you?

*TODO: INSERT EXPLANATORY TWEET*

### What is the point of this talk?

Strings are bad, m'kay.

### Explain, fool.

Strings are actually a Good Thing™.

But first…

### What exactly *is* a string?

A string (or `string`, `String`, `str`, `char*`… you name it) is a sequence of bytes or characters. In most high-level programming languages, including Java and C#, a string consists of an immutable array of characters.

They tend to look something like this.

<table class="byte-array">
    <tr>
        <td>00</td>
        <td>18</td>
        <td>F</td>
        <td>o</td>
        <td>r</td>
        <td>&nbsp;</td>
        <td>e</td>
        <td>v</td>
        <td>e</td>
        <td>r</td>
        <td>&nbsp;</td>
        <td>a</td>
        <td>n</td>
        <td>d</td>
        <td>&nbsp;</td>
        <td>a</td>
        <td>&nbsp;</td>
        <td>d</td>
        <td>a</td>
        <td>y</td>
    </tr>
</table>

That's the length of the string, which itself takes up a fixed number of bytes (four in Java), and then a series of characters, which each take one or more bytes. Java uses UTF-16, in which most characters are two bytes, but some are three.

#### Strings are for humans

> All the world's a stage, and all the men and women merely players. They have their exits and their entrances; And one man in his time plays many parts.

You can put quite literally anything into a string (assuming infinite memory). They can accept any valid character, and as many of them as you want. The entire works of Shakespeare will happily sit in a string in a program on your computer, and take up a grand total of six whole megabytes of memory.

#### And strings are for computers

```xml
<?xml version="1.0"?>
<catalog>
   <book id="bk101">
      <author>Shakespeare, William</author>
      <title>As You Like It</title>
      <genre>Comedy</genre>
      <price>£4.95</price>
      <publish_date>1599-02-20</publish_date>
      <isbn>978-0141012278</isbn>
      <description>William Shakespeare's exuberant comedy
      As You Like It is his playful take on the Renaissance
      tradition of pastoral romance</description>
   </book>
</catalog>
```

We often use strings to store arbitrary, human-written text, but it's even more common to store computer-generated streams of characters. There's a hell of a lot of XML and JSON out there in the world, and humans are simply not capable of typing it all. Most of the time, the majority of a string is infrastructure to help a computer, not a human, read the important bits.

### So what's the problem?

It turns out strings themselves are very useful. Having the ability to move around arbitrary amounts of data encoded in a fashion anything can understand has served software developers very well. Unfortunately, there's one thing you can do with strings which undermines everything.

```java
a + b
```

Yup, concatenation. That beast.

Hold your arguments for now. All will become clear.

## Case Studies

### Single Responsibility

There's a piece of code everyone has written at least once. You've done it. I've done it. Your old computer science lecturer does it all the time.

It looks like this:

```java
public String serialize() {
    String output = "";
    boolean first = true;
    for (Whatnot thingamabob : values) {
        if (first) {
            first = false;
        } else {
            output += ", ";
        }
        output += String.valueOf(thingamabob);
    }
    return output;
}
```

There's some serious problems with this. And I don't mean that it's not using a `StringBuilder`. It's unreadable. It doesn't tell you what it's doing or why it's doing it.

This piece of code is really doing two things. First of all, it's converting everything into a string. Secondly, it's sticking them together with `", "` interspersed.

Let's do that as two operations.

```java
private final String SEPARATOR = ", ";

public String serialize() {
    List<String> stringValues = new ArrayList<>();
    for (Whatnot thingamabob : values) {
        stringValues.add(thingamabob);
    }

    String output = "";
    boolean first = true;
    for (String value : stringValues) {
        if (first) {
            first = false;
        } else {
            output += SEPARATOR;
        }
        output += value;
    }
    return output;
}
```

Not much better, is it? But now we can break it apart:

```java
public String serialize() {
    return join(SEPARATOR, stringify(values));
}

private List<String> stringify(Iterable<Object> values) {
    List<String> stringValues = new ArrayList<>();
    for (Whatnot thingamabob : values) {
        stringValues.add(thingamabob);
    }
    return stringValues;
}

private String join(String separator, Iterable<String> values) {
    String output = "";
    boolean first = true;
    for (String value : values) {
        if (first) {
            first = false;
        } else {
            output += separator;
        }
        output += value;
    }
    return output;
}
```

And then ship it out:

```java
public String serialize() {
    return Joiner.on(SEPARATOR).join(values);
}
```

This is a clear example of how separating our concerns and focusing on one thing at a time can really improve our code quality. If we were worried about the performance of creating a second list, we could easily optimise the `join` method, and every caller would benefit for free.
