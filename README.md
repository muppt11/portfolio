# Tanvi's Portfolio Bakery

**Live site: https://muppt11.github.io/portfolio/**

An interactive portfolio built with Vite and Kaboom.js. Visitors customize a character, walk through eight bakery stations, and bake a cupcake. Each activity reveals part of my portfolio as you play: skills appear as ingredients go into the bowl, projects appear as each cup is filled, and experience comes out of the oven.

Prefer to skip the game? The quick links bar opens Projects, Skills, Experience, Awards, GitHub, and Contact directly, and the home screen links straight to my résumé.

## What's inside

- **Projects:** ClassScheduler, ezPark, Magic Mirror Monopoly, CrossTalk, and more, with links to live demos and code
- **Experience:** IBM, the UT Regional Security Operations Center, MAG CP, and others
- **Skills:** languages, frameworks, databases, and tools grouped by category
- **Contact:** email, phone, LinkedIn, and a downloadable résumé

## How it's built

- **Kaboom.js** renders the bakery scene, character movement, and stations on a canvas.
- **Plain HTML, CSS, and JavaScript** power the recipe cards, mini activities, and quick link popups. There is no UI framework.
- **Portfolio content lives in one file**, `src/constants.js`, so every station, popup, and quick link reads from the same data.
- **Vite** builds the site, and a GitHub Actions workflow deploys it to GitHub Pages on every push to `main`.
- Progress, cupcake choices, and sound settings are saved in `localStorage` so visitors can pick up where they left off.

## Development

```bash
npm install
npm run dev
```

Create or preview a production build with:

```bash
npm run build
npm run preview
```

## Structure

- `src/main.js` contains the bakery scene, interactions, state, and controls.
- `src/style.css` contains the interface and activity artwork.
- `src/constants.js` defines stations, quest steps, and the color palette.
- `src/kaboomCtx.js` configures Kaboom.
- `src/utils.js` contains shared scene helpers.

## Credits

The project structure was inspired by [2d-portfolio-kaboom](https://github.com/JSLegendDev/2d-portfolio-kaboom) by JSLegendDev.

| Use | Track | Creator |
| --- | --- | --- |
| Background music | Funny Cartoon Music | Maksym Malko |
| Placement | Water Splash | Freesound Community |
| Ingredient and option selection | Simple Whoosh | Dragon Studio |
| Character customization | Button Press | Dragon Studio |
| Interface controls | Mouse Click | Matthew Vakaliuk |
| Game start | 8-Bit Arcade Video Game Start Sound Effect | Freesound Community |
| Quick Links | Aww | Adhimahadi |
| Frosting and character completion | Shine | Faith Mulato |
| Sprinkles | Salt Shaking | Freesound Community |
| Packing | Placing Cardboard Box | Oxidvideos |
| Bow wrapping | Plastic Pop | Freesound Community |
| Customer delivery | Cartoon Eating Sound Effect | Betoelguapillo |
| Conveyor belt | Bicycle Wheel FX | Freesound Community |
| Batter dispenser | Bubble Pop 06 | Universfield |
| Batter mixing | Slimy | Freesound Community |
| Station completion | Level Up 05 | Universfield |
| Finish Quest | Button Pressed | Freesound Community |
| Baking | White Noise | Danevaer |
| Oven timer | Bell Ring | Dragon Studio |

Audio files are stored in `audio/`.
