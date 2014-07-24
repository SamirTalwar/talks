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
