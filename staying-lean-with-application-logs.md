---
layout: default
title: Staying Lean with Application Logs
date: 2016-09-22 11:10:00 +0200

code:
  language: javascript
---

We're building a game for Xbox Two: <strong title="Which is definitely not related to &quot;Destiny&quot;.">Fate</strong>. One of the game modes is called the… um… <strong>Trials of Anubis</strong>.

<figure>
  <img alt="Fate cover art" src="staying-lean-with-application-logs/cover-art.png"/>
  <figcaption>Copyright me, 2016</figcaption>
</figure>

Here's how it works.

  * You have two teams, each of three players.
  * Each team is trying to defeat the other one.
  * If you take another player down, they don't revive in the same round.
  * Players *can* bring their teammates back up, but it's time-consuming.
  * If all the players on the team are taken down, that team loses.
  * The first team to win five rounds wins.

## About the infrastructure

It used to look like this:

![Monolith](staying-lean-with-application-logs/monolith.png)

I know, pretty, right.

As you can see, we have one application with five components. Unfortunately, it doesn't really scale past a couple of games.

We initially looked into re-working the application to be completely multi-threaded. That made a bit of sense, but there's an issue with threading: it's still on one machine. You can only get so far with this until you need to scale out anyway.

Next up: scale out the monolith. Sure, it works fairly well, but the problem is that you just need a lot more CPU time dedicated to gameplay; scoring and managing players is pretty lightweight, and matchmaking is intense but only for very short bursts. In addition, we still needed to federate the data across servers, because otherwise players are stuck on one single server.

So we rewrote it to use services. That went as well as you might expect.

![Services with a centralised database](staying-lean-with-application-logs/services-centralised-database.png)

Communication via the database. What an excellent plan. That worked for about twenty seconds before we ran into consistency problems.

So we moved to services communicating directly with each other. We looked at the literature and it appears that the conventional way is to make them talk over HTTP. So we did.

![Decentralised services](staying-lean-with-application-logs/services-decentralised.png)

Or rather, we tried to. But with all the additional infrastructure required to handle and debug service HTTP connections, it got real complicated real fast.

Let's blow up the Gameplay service.

![Decentralised services](staying-lean-with-application-logs/services-decentralised-gameplay.png)

Now, observe the components of this service. First of all, note that four out of six are just about handling the HTTP server and various clients. Of course, the game loop is huge, and could be broken down further, but that's our bread and butter. None of the HTTP stuff makes us money; it's just [*waste*][Muda].

And it's sprawling. Every service in our game needs the same components, designed slightly differently. Right now we're just looking at one game mode among many.

You see, the problem is that handling large amounts of computation and data like this is inherently complicated. Splitting it up into services just moves the complication into a shape that makes a little more sense to us, but it definitely doesn't make it go away.

What we need is a model that works *with* the <span title="sometimes known as &quot;microservices&quot; for some reason">service-oriented architecture</span> we have in place.

[Muda]: https://en.wikipedia.org/wiki/Muda_(Japanese_term)

## Event sourcing

What if, rather than *consuming* from other services, each service *published* every single event?

Each service would push events to some sort of event bus, which would then push those events out to other nodes which had subscribed to those kinds of events.

We still need the client, so we can talk to this event bus, but we don't need an HTTP server any more. In addition, we don't need the logging that goes along with it. We can let the event bus handle that, storing them somewhere so we can replay them later.

But we can be leaner.

The problem here is that our application doesn't talk to an event bus right now. Retrofitting that will be a huge undertaking. However, our application *does* publish events… to STDOUT.

### STDOUT?

Yup, it logs. A lot. We can consider those log lines to be events.

So, we're logging. All we need to do now is to push those events to a log collector such as [Fluentd][] or [Logstash][], and have it push them somewhere that can push them outwards again.

A log-powered event bus. Sounds crazy. Let's do it.

[Fluentd]: http://www.fluentd.org/
[Logstash]: https://www.elastic.co/products/logstash

## Let's see it work.

## In closing
