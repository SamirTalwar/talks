---
layout: default
---

# Highly Strung

## Introduction

### Who are you?

<blockquote class="twitter-tweet" lang="en"><p>I really have only myself to blame for my five hours of sleep, but I&#39;m still gonna blame the world.</p>&mdash; ow. (@SamirTalwar) <a href="https://twitter.com/SamirTalwar/statuses/462126458220343296">May 2, 2014</a></blockquote>

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

It turns out strings themselves are very useful. Having the ability to move around arbitrary amounts of data encoded in a fashion anything can understand has served software developers very well. Unfortunately, there's a few things you can do with strings which undermine everything.

The first:

```java
a + b
```

Yup, concatenation. That beast. Now the second:

```java
c.split(";")
```

Oh, splitting. You devil, you.

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

### Strings are complicated

Often, our data isn't quite as structured as we'd like. You know when this happens when you receive a CSV file with instructions to pull the relevant bits out. Finding those relevant bits can sometimes be harder than you think.

```java
public class Toolboxen {
    public List<Toolbox> readToolboxen(File file) {
        try (Stream<String> lines = Files.lines(file)) {
            return lines
                .map(line -> asList(line.split(",")))
                .map(fields -> new Toolbox(fields.get(0),
                                           fields.get(2),
                                           Integer.valueOf(fields.get(1))))
                .filter(toolbox -> toolbox.hasSpanner())
                .collect(toList());
        }
    }
}
```

That's way nicer than the same behaviour in Java 7, but it's still got more than a few problems. First of all, it's common for text to have commas (`,`) in it, and it's common for CSV files to have a bit of free text. So what do we do when we have a comma? We put quotes around the entire text, of course.

Suddenly this got a lot more complicated.

```java
public class Toolboxen {
    private static final char SEPARATOR = ",";
    private static final char QUOTE = "\"";

    public List<Toolbox> readToolboxen(File file) {
        try (Stream<String> lines = Files.lines(file)) {
            return lines
                .map(line -> splitLine(line))
                .map(fields -> new Toolbox(fields.get(0),
                                           fields.get(2),
                                           Integer.valueOf(fields.get(1))))
                .filter(toolbox -> toolbox.hasSpanner())
                .collect(toList());
        }
    }

    private static List<String> splitLine(String line) {
        List<String> fields = new ArrayList<>();
        StringBuilder currentField;
        String rest = line.trim();
        while (!rest.isEmpty()) {
            boolean quoted = rest.charAt(0) == QUOTE;
            boolean ended = false;
            for (int i = 0; i < rest.length(); i++) {
                char c = rest.charAt(i);
                if (quoted && c == QUOTE) {
                    ended = true;
                } else if (ended && c == SEPARATOR) {
                    break;
                } else if (ended) {
                    throw new IncorrectlyQuotedFieldException();
                } else {
                    currentField.append(c);
                }
            }

            if (quoted && !ended) {
                throw new IncorrectlyQuotedFieldException();
            }

            fields.add(currentField.toString());
            rest = rest.substr(i + 1).trim();
        }
        return fields;
    }
}
```

UGH.

Now, we're still missing a lot.

  * You need to be able to escape the quote character, because sometimes you'll need it inside a string.
  * Quoted fields can span multiple lines.
  * Every row should contain the same number of comma-separated fields.

But here's the real problem. There's tight coupling between reading the file and creating our `Toolbox` objects. We can remedy that by returning a stream and letting the caller construct the object:

```java
public class CsvReader {
    public Stream<List<String>> openCsvFile(File csvFile) {
        return Files.lines(csvFile)
            .map(line -> splitLine(line));
    }
}
```

The caller is now also responsible for closing the file, but hopefully we've made that clear in the method name. Now we can move our `CsvReader` to another package, or perhaps an entirely different module, and work on it separate from the business logic.

CSV-reading, among many other things, is infrastructure-level code. It should not be intermingled with application-level concerns. Decoupling these two will make the real purpose of the application much clearer.

### A perennial favourite

Pop quiz: what's wrong with this code?

```java
public boolean authenticate(String username, String password) {
    String encryptedPassword = encrypt(password);

    Statement statement = connection.createStatement();
    ResultSet resultSet = statement.executeQuery(
        "SELECT COUNT(*) count FROM users" +
        " WHERE username = '" + username + "'" +
        "   AND password = '" + encryptedPassword + "'");

    resultSet.next();
    return resultSet.getInt("count") == 1;
}
```

If you said that it's not using `String.format`, you get a demerit. Stay after class.

I think most of you will know this one already. It's subject to an SQL injection attack. Sure, calling it with something like `authenticate("steve", "open-sesame")` is totally fine, but what about this?

```java
authenticate("hacker", "' OR '' = '");
```

The resulting SQL will look like this:

```sql
SELECT COUNT(*) count FROM users
 WHERE username = 'hacker'
   AND password = '' OR '' = ''
```

Boolean operator precedence plays a role here, so let's reformat and put the parentheses in:

```sql
SELECT COUNT(*) count FROM users
 WHERE (username = 'hacker' AND password = '')
    OR '' = ''
```

Yup. Turns out that password will get you into a lot of badly-written websites. And it's easy to test for. On the *really* broken ones, using `'` in your password will crash the website.

The correct way to do things is to, of course, use parameterised SQL:

```java
public boolean authenticate(String username, String password) {
    String encryptedPassword = encrypt(password);

    Statement statement = connection.prepareStatement(
        "SELECT COUNT(*) count FROM users" +
        " WHERE username = ?"
        "   AND password = ?");
    statement.setString(1, username);
    statement.setString(2, encryptedPassword);
    ResultSet resultSet = statement.executeQuery();

    resultSet.next();
    return resultSet.getInt("count") == 1;
}
```

This way, the database will handle the user-supplied input separately from the SQL itself, which means (assuming the database driver has been written well) any SQL in the user input will be treated as text, not code.

A number of threats to security involve convincing a program to treat data as executable instructions. Most of the attacks on Microsoft and Oracle which mean you have to update Windows and Java every seventeen minutes buffer overflow attacks. Because arrays aren't really a thing in C, you can *overflow* the array by simply writing past the end of it; there are no checks to ensure user input fits inside the array. If you are familiar with the memory layout of the application, you can write enough that you overwrite machine instructions with your own, giving you complete control of the application execution simply by providing more text than was expected.

### Spit it out

Earlier, we pulled some data in from a CSV file. Now we're going to send out some HTML.

We won't make the same mistake we made with the SQL. No concatenation, this time. We're going to use a templating library. Our template will look something like this:

```html
<section id="catalog">
    <#list books as book>
        <div class="book" id="${book.id}">
            <h1><span class="title">${book.title}</span>,
                by <span class="author">${book.author}</span></h1>
            <p class="description">${book.description}</p>

            <ol class="reviews">
                <#list book.reviews as review>
                    <li>${review.text} -- #{review.reviewerName}</li>
                </#list>
            </ol>
        </div>
    </#list>
</section>
```

Easy. Sorted. Cushty.

Except no. What if one of the reviews looks something like this?

```html
I thought this was one of Shakespeare's best plays.
<script>
document.location = 'http://install.malware.com/';
</script>
```

Lovely. Everyone will be redirected to an evil website, and no one will read the other marvellous reviews. Sad faces all around.

We could escape the text by using the `?html` post-processor (`${review.text?html}`), but then we'd have to do that for everything, and you know you'd forget one.

How about we write code that really does separate the instructions from the text instead?

```java
section(id("catalog"),
    many(books.map(book ->
        div(className("book"), id(book.id()),
            h1(
                span(className("title"), book.title()),
                ", by ",
                span(className("author"), book.author())),
            p(className("description"), book.description())),
        ol(className("reviews"),
            many(books.reviews().map(review ->
                li(review.text(), " -- ", review.reviewerName())))))))
```

It's pretty much as easy to read, am I right? And it has the added bonus of no cross-site scripting (XSS) vulnerabilities.

I should probably add that this HTML-building library doesn't actually exist. However, if you promise me you'll use it, I will build it for you.

#### And now, another language

In June of 2014, this tweet became very famous:

<blockquote class="twitter-tweet" lang="en">
    <p>&lt;script class=&quot;xss&quot;&gt;$(&#39;.xss&#39;).parents().eq(1).find(&#39;a&#39;).eq(1).click();$(&#39;[data-action=retweet]&#39;).click();alert(&#39;XSS in Tweetdeck&#39;)&lt;/script&gt;♥</p>
    &mdash; *andy (@derGeruhn) <a href="https://twitter.com/derGeruhn/statuses/476764918763749376">June 11, 2014</a>
</blockquote>

Take a look at the number of retweets. This one is pretty special, but not for the reasons you might think. It exploited a bug in TweetDeck to perform an XSS attack. Fortunately, it was benign: it just popped up an alert box and retweeted itself to make everyone aware of the issue; not every attack is so friendly.

That heart at the end isn't for fun, though. This attack only works when the closing script tag is followed by a multi-byte UTF-8 character; simple ASCII doesn't trigger it, but when there's emoji, that code path gets hit.

The problem?

```javascript
for (   t = e[r],
        w.innerHTML = TD.emoji.parse(t.nodeValue),
        i = document.createDocumentFragment();
    w.hasChildNodes();
) {
    i.appendChild(w.firstChild);
```

The relevant bit:

```javascript
w.innerHTML = TD.emoji.parse(t.nodeValue)
```

`innerHTML` is the problem here. Any time you end up setting the HTML of an element directly, just like in the template above, you have to escape it. Failure to do so often causes bugs of this seriousness (though not normally of this scale).

Sure, we can escape when necessary and hope we've covered all the bases, but there's a better way: just don't do it. Setting the `textContent` field instead, and constructing elements using the provided functions rather than concatenating HTML together, avoids problems like this.

## This is awful. So what do I do?

Strings are the most powerful tool we have in our programming languages. Like all things powerful, they should be used responsibly.

### The Problems, in a Nutshell

Misuse of strings can lead to bad software design, such as *coupling* infrastructure to business logic, which can make your code hard to extend, maintain, support and test. I'd argue that strings are actually an infrastructure-level concern, and that any code related to your core logic shouldn't touch them at all.

Perhaps more importantly, strings stop us from guaranteeing *correctness*. Types are scary to some people, but strong wrappers for your data are important, because they stop us from creating massive security vulnerabilities. Munging HTML or SQL together by concatenating strings is convenient, but offers nothing in the way of security. Only by dealing with data as data and code as code can we avoid this.

### The Solution

There's a solution to both of these: use your type system properly. Create classes that wrap strings, and only expose the string itself (or a transformed variation) at the infrastructure level. Only split strings when you're ingesting the data, and at no point after. Until you need to output anything, don't concatenate at all—just store the data in sensibly-named fields and do all the work at once at the end.

If you have a decent separation between your business logic and your infrastructure code, any code that munges strings belongs in the infrastructure layer, along with your HTTP endpoints, message queue adapters and database connections. You don't need them until you need to communicate with a third-party system, just like your adapters.

So, in summary:

  * Wrap your strings
    * Only pass strings to class constructors
    * Only expose strings at the last possible moment
  * Keep all string code in your infrastructure layer

Give it a try. I think you'll be pleasantly surprised.
