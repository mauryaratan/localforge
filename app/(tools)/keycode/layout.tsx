import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JavaScript Keycode Finder - DevTools",
  description:
    "Find JavaScript keyboard event properties instantly. Press any key to get keyCode, event.key, event.code, location, and modifier states. Essential for building keyboard shortcuts and handling keyboard events.",
  keywords: [
    "keycode",
    "javascript keycode",
    "keyboard event",
    "event.key",
    "event.code",
    "event.keyCode",
    "key code finder",
    "keyboard shortcut",
    "javascript keyboard",
    "devtools",
    "developer tools",
  ],
  openGraph: {
    title: "JavaScript Keycode Finder - DevTools",
    description:
      "Press any key to get JavaScript keyboard event properties. keyCode, event.key, event.code and more.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JavaScript Keycode Finder - DevTools",
    description:
      "Find JavaScript keyboard event properties instantly by pressing any key",
  },
};

const KeycodeLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default KeycodeLayout;
