# Mantra Jaap

A mindful mantra chanting web app inspired by traditional mala practice.  
The app helps you chant with focus, track progress, and build consistency.

## Features

- 108-count chanting flow (mala-style)
- Built-in mantras:
  - Gayatri Mantra
  - Krishna Mahamantra
- Custom mantra support with local save
- Circular progress ring + counter pulse animation
- Completion message at 108 chants
- Daily streak tracking
- Daily goal tracker (27/54/108) with progress bar
- Session analytics:
  - Session chant count
  - Chant pace (chants/min)
- Focus Mode:
  - 5/10/15 minute presets
  - Start/Pause
  - Reset
  - +1m / -1m quick controls (while running)
  - Meditation alarm selector (Soft Bell / Temple Bell / Chime)
- Responsive UI:
  - Settings and Practice Tools auto-collapse on smaller screens
  - Accordion behavior for compact layouts
- Dark mode (maroon + gold theme)
- Optional mobile haptic feedback
- All key state persisted via `localStorage`

## Tech Stack

- HTML
- CSS
- JavaScript (Vanilla)

## Run Locally

Open `index.html` in any modern browser.

Optional (VS Code):
- Use Live Server and open the generated local URL.

## Project Structure

- `index.html` - app layout and sections
- `style.css` - theme, layout, responsive styling, animations
- `script.js` - app state, chanting logic, focus timer, persistence, interactions

## Notes

- No backend is required.
- Works fully client-side.

## Author

Built with ❤️ by Nidhi Rani
