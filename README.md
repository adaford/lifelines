# Lifelines

A small, generational life simulator about how you spend your years and what you leave behind.

**Play:** https://adaford.github.io/lifelines/

You start at age 0 and advance exactly one year per turn. As a baby you choose how much to cry; as a toddler, how to split your play; from school onward, where your focus goes. Those choices shape your ratings, your relationships and the odds of what happens next, without ever guaranteeing it. Careers, college, dating, marriage, children, fame and misfortune all arrive through events and decisions. When you retire or die, the story continues with an heir.

The game is designed for phones and saves automatically in your browser. Nothing is stored on a server; use **Export save** and **Import save** in the menu to back up a life or move it between devices.

## Run it locally

Install Node.js 24, then:

```sh
npm start
```

Open http://127.0.0.1:4173. There is no build step and nothing to install for playing; the Node server exists only because ES modules cannot load from `file://`.

## Run the tests

```sh
npm ci
npm test
```

`npm ci` installs the one development dependency (linkedom, used by the interface tests). The suite covers the simulation, save compatibility and the interface.

## How it is built

Plain HTML, CSS and JavaScript modules in the repository root, with no framework and no runtime dependencies. GitHub Pages serves the root of `main`, so every push to `main` redeploys the live game.

## Documentation

- [CLAUDE.md](CLAUDE.md) is the working guide: commands, a map of the code, the rules every change must keep, and the release procedure.
- [docs/design-log/](docs/design-log/README.md) holds one dated record for every design change, grouped by area.
- [docs/original-spec/](docs/original-spec/) keeps the original rules and development notes that the design log builds on.
