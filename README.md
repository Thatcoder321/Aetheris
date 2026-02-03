# Aetheris
**A new web**

## What is this?
The web gets messy fast. Tabs are everywhere and tools are scattered.

Aetheris is a personal dashboard that runs in your browser. It feels more like a desktop environment than a website. You can drag widgets around, resize them, and everything has a bit of weight and motion to it. It is built entirely in plain HTML, CSS, and JavaScript.

## Why build it?
I had two simple reasons.

First, I wanted it to feel like my own space. I wanted to put things exactly where I need them, switch themes, or resize a window without fighting the layout. I even added a feature where you can tell it to "make a productivity layout" and it will arrange the grid for you automatically.

Second, I wanted everything in one place. I hated hopping between tabs just to check the weather, write a quick note, or set a timer. Now I just open Aetheris and get to work.

## What it does
It comes with 16 widgets ready to go. I included the things I actually use, like an AI chat, weather with decent detail, live stock tracking, and productivity tools like a Pomodoro timer and to-do lists. There are also basic utilities like a calculator and unit converter.

The cool part is the layout engine. It uses a 12-column grid so things snap into place easily, and it saves your setup to the cloud so you can use it across devices.

## The build
This was not a quick weekend hack. It represents over 145 commits and honestly, a fair amount of suffering. I decided to build the frontend in Vanilla JS to keep it lightweight, but that meant handling state management without any help. That part was brutal. There were moments where I really regretted not just using a framework while chasing down UI bugs that kept popping up out of nowhere. I stuck with it though. The result is a Node.js backend and Gridstack layout that feels snappy, even if getting there cost me a lot of sleep.

## Try it
You can launch it right now on Vercel:
https://aetheris-sigma.vercel.app/#

## Coming soon
I am working on version 1.2 which will let widgets talk to each other. For example, the Pomodoro timer will be able to automatically log your sessions into the notepad.

## Thanks
I hope Aetheris works well for you.

Aetheris Dev
