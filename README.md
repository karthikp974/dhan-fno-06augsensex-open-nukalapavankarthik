# Dhan Positions UI Replica

A pixel-accurate recreation of the Dhan trading app **Positions** screen, built for portfolio showcase.

![Dhan Positions Screen](./public/preview.png)

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the replica inside a phone mockup frame.

## Project Structure

```
src/
├── App.jsx                          # Portfolio wrapper with phone frame
├── components/
│   ├── DhanPositionsReplica.jsx     # Main UI component
│   └── DhanPositionsReplica.css     # Pixel-accurate styles
```

## Using in Your Portfolio

Import the component directly:

```jsx
import DhanPositionsReplica from './components/DhanPositionsReplica'

export default function Projects() {
  return (
    <div className="project-showcase">
      <DhanPositionsReplica />
    </div>
  )
}
```

Or embed the entire phone-framed demo from `App.jsx`.

## Build for Production

```bash
npm run build
npm run preview
```

## Tech Stack

- React 18
- Vite 6
- Pure CSS (no UI libraries)
