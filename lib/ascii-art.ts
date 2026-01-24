// ASCII Art Generator
// Converts images and text to ASCII art

// ============================================
// TEXT TO ASCII (FIGlet-style) SECTION
// ============================================

export type TextFont =
  | "standard"
  | "banner"
  | "big"
  | "block"
  | "bubble"
  | "digital"
  | "lean"
  | "mini"
  | "script"
  | "shadow"
  | "slant"
  | "small";

export type TextOptions = {
  font: TextFont;
};

export const DEFAULT_TEXT_OPTIONS: TextOptions = {
  font: "standard",
};

export const TEXT_FONT_LABELS: Record<TextFont, string> = {
  standard: "Standard",
  banner: "Banner",
  big: "Big",
  block: "Block",
  bubble: "Bubble",
  digital: "Digital",
  lean: "Lean",
  mini: "Mini",
  script: "Script",
  shadow: "Shadow",
  slant: "Slant",
  small: "Small",
};

// Embedded FIGlet font definitions (subset of characters for performance)
// Each font has character maps for A-Z, a-z, 0-9, and common punctuation
type FontChar = string[];
type FontDef = {
  height: number;
  chars: Record<string, FontChar>;
};

// Standard FIGlet font
const FONT_STANDARD: FontDef = {
  height: 6,
  chars: {
    " ": ["     ", "     ", "     ", "     ", "     ", "     "],
    "!": ["  _  ", " | | ", " | | ", " |_| ", " (_) ", "     "],
    A: [
      "     _     ",
      "    / \\    ",
      "   / _ \\   ",
      "  / ___ \\  ",
      " /_/   \\_\\ ",
      "           ",
    ],
    B: [
      "  ____  ",
      " | __ ) ",
      " |  _ \\ ",
      " | |_) |",
      " |____/ ",
      "        ",
    ],
    C: [
      "   ____ ",
      "  / ___|",
      " | |    ",
      " | |___ ",
      "  \\____|",
      "        ",
    ],
    D: [
      "  ____  ",
      " |  _ \\ ",
      " | | | |",
      " | |_| |",
      " |____/ ",
      "        ",
    ],
    E: ["  _____ ", " | ____|", " |  _|  ", " | |___ ", " |_____|", "        "],
    F: ["  _____ ", " |  ___|", " | |_   ", " |  _|  ", " |_|    ", "        "],
    G: [
      "   ____ ",
      "  / ___|",
      " | |  _ ",
      " | |_| |",
      "  \\____|",
      "        ",
    ],
    H: ["  _   _ ", " | | | |", " | |_| |", " |  _  |", " |_| |_|", "        "],
    I: ["  ___ ", " |_ _|", "  | | ", "  | | ", " |___|", "      "],
    J: [
      "      _ ",
      "     | |",
      "  _  | |",
      " | |_| |",
      "  \\___/ ",
      "        ",
    ],
    K: ["  _  __", " | |/ /", " | ' / ", " | . \\ ", " |_|\\_\\", "       "],
    L: ["  _     ", " | |    ", " | |    ", " | |___ ", " |_____|", "        "],
    M: [
      "  __  __ ",
      " |  \\/  |",
      " | |\\/| |",
      " | |  | |",
      " |_|  |_|",
      "         ",
    ],
    N: [
      "  _   _ ",
      " | \\ | |",
      " |  \\| |",
      " | |\\  |",
      " |_| \\_|",
      "        ",
    ],
    O: [
      "   ___  ",
      "  / _ \\ ",
      " | | | |",
      " | |_| |",
      "  \\___/ ",
      "        ",
    ],
    P: [
      "  ____  ",
      " |  _ \\ ",
      " | |_) |",
      " |  __/ ",
      " |_|    ",
      "        ",
    ],
    Q: [
      "   ___  ",
      "  / _ \\ ",
      " | | | |",
      " | |_| |",
      "  \\__\\_\\",
      "        ",
    ],
    R: [
      "  ____  ",
      " |  _ \\ ",
      " | |_) |",
      " |  _ < ",
      " |_| \\_\\",
      "        ",
    ],
    S: [
      "  ____  ",
      " / ___| ",
      " \\___ \\ ",
      "  ___) |",
      " |____/ ",
      "        ",
    ],
    T: ["  _____ ", " |_   _|", "   | |  ", "   | |  ", "   |_|  ", "        "],
    U: [
      "  _   _ ",
      " | | | |",
      " | | | |",
      " | |_| |",
      "  \\___/ ",
      "        ",
    ],
    V: " __     __\n \\ \\   / /\n  \\ \\ / / \n   \\ V /  \n    \\_/   \n          ".split(
      "\n"
    ),
    W: " __        __\n \\ \\      / /\n  \\ \\ /\\ / / \n   \\ V  V /  \n    \\_/\\_/   \n             ".split(
      "\n"
    ),
    X: " __  __\n \\ \\/ /\n  \\  / \n  /  \\ \n /_/\\_\\\n       ".split("\n"),
    Y: " __   __\n \\ \\ / /\n  \\ V / \n   | |  \n   |_|  \n        ".split(
      "\n"
    ),
    Z: "  _____\n |__  /\n   / / \n  / /_ \n /____|\n       ".split("\n"),
    "0": ["  ___  ", " / _ \\ ", "| | | |", "| |_| |", " \\___/ ", "       "],
    "1": ["  _ ", " / |", " | |", " | |", " |_|", "    "],
    "2": [
      "  ____  ",
      " |___ \\ ",
      "   __) |",
      "  / __/ ",
      " |_____|",
      "        ",
    ],
    "3": [
      "  _____ ",
      " |___ / ",
      "   |_ \\ ",
      "  ___) |",
      " |____/ ",
      "        ",
    ],
    "4": [
      "  _  _   ",
      " | || |  ",
      " | || |_ ",
      " |__   _|",
      "    |_|  ",
      "         ",
    ],
    "5": [
      "  ____  ",
      " | ___| ",
      " |___ \\ ",
      "  ___) |",
      " |____/ ",
      "        ",
    ],
    "6": [
      "   __   ",
      "  / /_  ",
      " | '_ \\ ",
      " | (_) |",
      "  \\___/ ",
      "        ",
    ],
    "7": [
      "  _____ ",
      " |___  |",
      "    / / ",
      "   / /  ",
      "  /_/   ",
      "        ",
    ],
    "8": ["  ___  ", " ( _ ) ", " / _ \\ ", "| (_) |", " \\___/ ", "       "],
    "9": ["  ___  ", " / _ \\ ", "| (_) |", " \\__, |", "   /_/ ", "       "],
    ".": ["    ", "    ", "    ", "  _ ", " (_)", "    "],
    ",": ["    ", "    ", "    ", "  _ ", " ( )", "  / "],
    "-": [
      "        ",
      "        ",
      "  _____ ",
      " |_____|",
      "        ",
      "        ",
    ],
    _: ["        ", "        ", "        ", "        ", "  _____ ", " |_____|"],
    ":": ["    ", "  _ ", " (_)", "  _ ", " (_)", "    "],
    ";": ["    ", "  _ ", " (_)", "  _ ", " ( )", "  / "],
    "?": ["  ___ ", " |__ \\", "   / /", "  |_| ", "  (_) ", "      "],
    "@": [
      "   ____  ",
      "  / __ \\ ",
      " / / _` |",
      "| | (_| |",
      " \\ \\__,_|",
      "  \\____/ ",
    ],
    "#": [
      "    _  _   ",
      "  _| || |_ ",
      " |_  ..  _|",
      " |_      _|",
      "   |_||_|  ",
      "           ",
    ],
    $: ["   _  ", "  | | ", " / __)", " \\__ \\", " (   /", "  |_| "],
    "%": ["  _  __", " (_)/ /", "   / / ", "  / /_ ", " /_/(_)", "       "],
    "^": ["  /\\ ", " |/\\|", "     ", "     ", "     ", "     "],
    "&": [
      "   ___   ",
      "  ( _ )  ",
      "  / _ \\/\\",
      " | (_>  <",
      "  \\___/\\/",
      "         ",
    ],
    "*": ["       ", " __/\\__", " \\    /", " /_  _\\", "   \\/  ", "       "],
    "(": ["   __", "  / /", " | | ", " | | ", " | | ", "  \\_\\"],
    ")": [" __  ", " \\ \\ ", "  | |", "  | |", "  | |", " /_/ "],
    "+": [
      "        ",
      "    _   ",
      "  _| |_ ",
      " |_   _|",
      "   |_|  ",
      "        ",
    ],
    "=": [
      "        ",
      "  _____ ",
      " |_____|",
      "  _____ ",
      " |_____|",
      "        ",
    ],
    "[": ["  ___ ", " | __|", " | _| ", " | _| ", " |___|", "      "],
    "]": ["  ___ ", " |__ |", "  |_ |", "  |_ |", " |___|", "      "],
    "{": ["     __", "    / /", "   | | ", "  < <  ", "   | | ", "    \\_\\"],
    "}": [" __    ", " \\ \\   ", "  | |  ", "   > > ", "  | |  ", " /_/   "],
    "/": [
      "      __",
      "     / /",
      "    / / ",
      "   / /  ",
      "  /_/   ",
      "        ",
    ],
    "\\": [
      " __     ",
      " \\ \\    ",
      "  \\ \\   ",
      "   \\ \\  ",
      "    \\_\\ ",
      "        ",
    ],
    "|": ["  _ ", " | |", " | |", " | |", " | |", " |_|"],
    "'": ["  _ ", " ( )", "  \\|", "    ", "    ", "    "],
    '"': ["  _ _ ", " ( | )", "  V V ", "      ", "      ", "      "],
    "`": ["  _ ", " ( )", " |/ ", "    ", "    ", "    "],
    "~": ["  /\\/|", " |/\\/ ", "      ", "      ", "      ", "      "],
    "<": ["    __", "   / /", "  / / ", "  \\ \\ ", "   \\_\\", "      "],
    ">": [" __   ", " \\ \\  ", "  \\ \\ ", "  / / ", " /_/  ", "      "],
  },
};

// Banner font (big block letters)
const FONT_BANNER: FontDef = {
  height: 8,
  chars: {
    " ": [
      "        ",
      "        ",
      "        ",
      "        ",
      "        ",
      "        ",
      "        ",
      "        ",
    ],
    A: [
      "   #    ",
      "  # #   ",
      " #   #  ",
      "#     # ",
      "####### ",
      "#     # ",
      "#     # ",
      "        ",
    ],
    B: [
      "###### ",
      "#     #",
      "#     #",
      "###### ",
      "#     #",
      "#     #",
      "###### ",
      "       ",
    ],
    C: [
      " ##### ",
      "#     #",
      "#      ",
      "#      ",
      "#      ",
      "#     #",
      " ##### ",
      "       ",
    ],
    D: [
      "###### ",
      "#     #",
      "#     #",
      "#     #",
      "#     #",
      "#     #",
      "###### ",
      "       ",
    ],
    E: [
      "#######",
      "#      ",
      "#      ",
      "#####  ",
      "#      ",
      "#      ",
      "#######",
      "       ",
    ],
    F: [
      "#######",
      "#      ",
      "#      ",
      "#####  ",
      "#      ",
      "#      ",
      "#      ",
      "       ",
    ],
    G: [
      " ##### ",
      "#     #",
      "#      ",
      "#  ####",
      "#     #",
      "#     #",
      " ##### ",
      "       ",
    ],
    H: [
      "#     #",
      "#     #",
      "#     #",
      "#######",
      "#     #",
      "#     #",
      "#     #",
      "       ",
    ],
    I: ["###", " # ", " # ", " # ", " # ", " # ", "###", "   "],
    J: [
      "      #",
      "      #",
      "      #",
      "      #",
      "#     #",
      "#     #",
      " ##### ",
      "       ",
    ],
    K: [
      "#    # ",
      "#   #  ",
      "#  #   ",
      "###    ",
      "#  #   ",
      "#   #  ",
      "#    # ",
      "       ",
    ],
    L: [
      "#      ",
      "#      ",
      "#      ",
      "#      ",
      "#      ",
      "#      ",
      "#######",
      "       ",
    ],
    M: [
      "#     #",
      "##   ##",
      "# # # #",
      "#  #  #",
      "#     #",
      "#     #",
      "#     #",
      "       ",
    ],
    N: [
      "#     #",
      "##    #",
      "# #   #",
      "#  #  #",
      "#   # #",
      "#    ##",
      "#     #",
      "       ",
    ],
    O: [
      " ##### ",
      "#     #",
      "#     #",
      "#     #",
      "#     #",
      "#     #",
      " ##### ",
      "       ",
    ],
    P: [
      "###### ",
      "#     #",
      "#     #",
      "###### ",
      "#      ",
      "#      ",
      "#      ",
      "       ",
    ],
    Q: [
      " ##### ",
      "#     #",
      "#     #",
      "#     #",
      "#   # #",
      "#    # ",
      " #### #",
      "       ",
    ],
    R: [
      "###### ",
      "#     #",
      "#     #",
      "###### ",
      "#   #  ",
      "#    # ",
      "#     #",
      "       ",
    ],
    S: [
      " ##### ",
      "#     #",
      "#      ",
      " ##### ",
      "      #",
      "#     #",
      " ##### ",
      "       ",
    ],
    T: [
      "#######",
      "   #   ",
      "   #   ",
      "   #   ",
      "   #   ",
      "   #   ",
      "   #   ",
      "       ",
    ],
    U: [
      "#     #",
      "#     #",
      "#     #",
      "#     #",
      "#     #",
      "#     #",
      " ##### ",
      "       ",
    ],
    V: [
      "#     #",
      "#     #",
      "#     #",
      "#     #",
      " #   # ",
      "  # #  ",
      "   #   ",
      "       ",
    ],
    W: [
      "#     #",
      "#     #",
      "#     #",
      "#  #  #",
      "# # # #",
      "##   ##",
      "#     #",
      "       ",
    ],
    X: [
      "#     #",
      " #   # ",
      "  # #  ",
      "   #   ",
      "  # #  ",
      " #   # ",
      "#     #",
      "       ",
    ],
    Y: [
      "#     #",
      " #   # ",
      "  # #  ",
      "   #   ",
      "   #   ",
      "   #   ",
      "   #   ",
      "       ",
    ],
    Z: [
      "#######",
      "     # ",
      "    #  ",
      "   #   ",
      "  #    ",
      " #     ",
      "#######",
      "       ",
    ],
    "0": [
      " ##### ",
      "#     #",
      "#    ##",
      "#   # #",
      "#  #  #",
      "# #   #",
      " ##### ",
      "       ",
    ],
    "1": [
      "   #   ",
      "  ##   ",
      " # #   ",
      "   #   ",
      "   #   ",
      "   #   ",
      " ##### ",
      "       ",
    ],
    "2": [
      " ##### ",
      "#     #",
      "      #",
      " ##### ",
      "#      ",
      "#      ",
      "#######",
      "       ",
    ],
    "3": [
      " ##### ",
      "#     #",
      "      #",
      " ##### ",
      "      #",
      "#     #",
      " ##### ",
      "       ",
    ],
    "4": [
      "#      ",
      "#    # ",
      "#    # ",
      "#    # ",
      "#######",
      "     # ",
      "     # ",
      "       ",
    ],
    "5": [
      "#######",
      "#      ",
      "#      ",
      "###### ",
      "      #",
      "#     #",
      " ##### ",
      "       ",
    ],
    "6": [
      " ##### ",
      "#     #",
      "#      ",
      "###### ",
      "#     #",
      "#     #",
      " ##### ",
      "       ",
    ],
    "7": [
      "#######",
      "     # ",
      "    #  ",
      "   #   ",
      "  #    ",
      "  #    ",
      "  #    ",
      "       ",
    ],
    "8": [
      " ##### ",
      "#     #",
      "#     #",
      " ##### ",
      "#     #",
      "#     #",
      " ##### ",
      "       ",
    ],
    "9": [
      " ##### ",
      "#     #",
      "#     #",
      " ######",
      "      #",
      "#     #",
      " ##### ",
      "       ",
    ],
    ".": ["   ", "   ", "   ", "   ", "   ", " # ", " # ", "   "],
    "-": [
      "      ",
      "      ",
      "      ",
      "######",
      "      ",
      "      ",
      "      ",
      "      ",
    ],
    "!": [" # ", " # ", " # ", " # ", " # ", "   ", " # ", "   "],
  },
};

// Big font
const FONT_BIG: FontDef = {
  height: 8,
  chars: {
    " ": [
      "      ",
      "      ",
      "      ",
      "      ",
      "      ",
      "      ",
      "      ",
      "      ",
    ],
    A: [
      "  __  ",
      " /  \\ ",
      "/    \\",
      "| () |",
      "|    |",
      "|_||_|",
      "      ",
      "      ",
    ],
    B: [
      " ___ ",
      "| _ )",
      "| _ \\",
      "|___/",
      "      ",
      "      ",
      "      ",
      "      ",
    ],
    C: [
      "  ___ ",
      " / __|",
      "| (__ ",
      " \\___|",
      "      ",
      "      ",
      "      ",
      "      ",
    ],
    D: [
      " ___  ",
      "|   \\ ",
      "| |) |",
      "|___/ ",
      "      ",
      "      ",
      "      ",
      "      ",
    ],
    E: [
      " ___ ",
      "| __|",
      "| _| ",
      "|___|",
      "      ",
      "      ",
      "      ",
      "      ",
    ],
    F: [
      " ___ ",
      "| __|",
      "| _| ",
      "|_|  ",
      "      ",
      "      ",
      "      ",
      "      ",
    ],
    G: [
      "  ___ ",
      " / __|",
      "| (_ |",
      " \\___|",
      "      ",
      "      ",
      "      ",
      "      ",
    ],
    H: [
      " _  _ ",
      "| || |",
      "| __ |",
      "|_||_|",
      "      ",
      "      ",
      "      ",
      "      ",
    ],
    I: [
      " ___ ",
      "|_ _|",
      " | | ",
      "|___|",
      "      ",
      "      ",
      "      ",
      "      ",
    ],
    J: [
      "    _ ",
      " _ | |",
      "| || |",
      " \\__/ ",
      "      ",
      "      ",
      "      ",
      "      ",
    ],
    K: [
      " _  __",
      "| |/ /",
      "| ' < ",
      "|_|\\_\\",
      "      ",
      "      ",
      "      ",
      "      ",
    ],
    L: [
      " _    ",
      "| |   ",
      "| |__ ",
      "|____|",
      "      ",
      "      ",
      "      ",
      "      ",
    ],
    M: [
      " __  __ ",
      "|  \\/  |",
      "| |\\/| |",
      "|_|  |_|",
      "        ",
      "        ",
      "        ",
      "        ",
    ],
    N: [
      " _  _ ",
      "| \\| |",
      "| .` |",
      "|_|\\_|",
      "      ",
      "      ",
      "      ",
      "      ",
    ],
    O: [
      "  ___  ",
      " / _ \\ ",
      "| (_) |",
      " \\___/ ",
      "       ",
      "       ",
      "       ",
      "       ",
    ],
    P: [
      " ___ ",
      "| _ \\",
      "|  _/",
      "|_|  ",
      "     ",
      "     ",
      "     ",
      "     ",
    ],
    Q: [
      "  ___  ",
      " / _ \\ ",
      "| (_) |",
      " \\__\\_\\",
      "       ",
      "       ",
      "       ",
      "       ",
    ],
    R: [
      " ___ ",
      "| _ \\",
      "|   /",
      "|_|_\\",
      "     ",
      "     ",
      "     ",
      "     ",
    ],
    S: [
      " ___ ",
      "/ __|",
      "\\__ \\",
      "|___/",
      "     ",
      "     ",
      "     ",
      "     ",
    ],
    T: [
      " _____ ",
      "|_   _|",
      "  | |  ",
      "  |_|  ",
      "       ",
      "       ",
      "       ",
      "       ",
    ],
    U: [
      " _   _ ",
      "| | | |",
      "| |_| |",
      " \\___/ ",
      "       ",
      "       ",
      "       ",
      "       ",
    ],
    V: [
      "__   __",
      "\\ \\ / /",
      " \\ V / ",
      "  \\_/  ",
      "       ",
      "       ",
      "       ",
      "       ",
    ],
    W: [
      "__      __",
      "\\ \\    / /",
      " \\ \\/\\/ / ",
      "  \\_/\\_/  ",
      "          ",
      "          ",
      "          ",
      "          ",
    ],
    X: [
      "__  __",
      "\\ \\/ /",
      " >  < ",
      "/_/\\_\\",
      "      ",
      "      ",
      "      ",
      "      ",
    ],
    Y: [
      "__   __",
      "\\ \\ / /",
      " \\_  / ",
      "  |_|  ",
      "       ",
      "       ",
      "       ",
      "       ",
    ],
    Z: [" ____", "|_  /", " / / ", "/___|", "     ", "     ", "     ", "     "],
    "0": [
      " ___ ",
      "/ _ \\",
      "\\___/",
      "     ",
      "     ",
      "     ",
      "     ",
      "     ",
    ],
    "1": [" _ ", "/ |", "|_|", "   ", "   ", "   ", "   ", "   "],
    "2": [
      " ___ ",
      "|_  )",
      " / / ",
      "/___|",
      "     ",
      "     ",
      "     ",
      "     ",
    ],
    "3": [
      " ___ ",
      "|__ /",
      " |_ \\",
      "|___/",
      "     ",
      "     ",
      "     ",
      "     ",
    ],
    "4": [
      " _ _  ",
      "| | | ",
      "|_  _|",
      "  |_| ",
      "      ",
      "      ",
      "      ",
      "      ",
    ],
    "5": [
      " ___ ",
      "| __|",
      "|__ \\",
      "|___/",
      "     ",
      "     ",
      "     ",
      "     ",
    ],
    "6": [
      "  __ ",
      " / / ",
      "| _ \\",
      "|___/",
      "     ",
      "     ",
      "     ",
      "     ",
    ],
    "7": [
      " ___ ",
      "|__  |",
      "  / / ",
      " /_/  ",
      "      ",
      "      ",
      "      ",
      "      ",
    ],
    "8": [
      " ___ ",
      "( _ )",
      "/ _ \\",
      "\\___/",
      "     ",
      "     ",
      "     ",
      "     ",
    ],
    "9": [
      " ___ ",
      "/ _ \\",
      "\\_, /",
      " /_/ ",
      "     ",
      "     ",
      "     ",
      "     ",
    ],
    ".": ["   ", "   ", " _ ", "(_)", "   ", "   ", "   ", "   "],
    "-": [
      "     ",
      "     ",
      " ___ ",
      "|___|",
      "     ",
      "     ",
      "     ",
      "     ",
    ],
    "!": [" _ ", "| |", "|_|", "(_)", "   ", "   ", "   ", "   "],
  },
};

// Mini font (compact)
const FONT_MINI: FontDef = {
  height: 4,
  chars: {
    " ": ["   ", "   ", "   ", "   "],
    A: [" _ ", "/_\\", "   ", "   "],
    B: ["__ ", "|_)", "   ", "   "],
    C: [" _", "|_", "  ", "  "],
    D: ["_ ", "|\\", "  ", "  "],
    E: [" _", "|_", "  ", "  "],
    F: [" _", "|_", "| ", "  "],
    G: [" _ ", "(_|", "   ", "   "],
    H: ["   ", "|_|", "   ", "   "],
    I: ["o", "|", " ", " "],
    J: [" o", "_|", "  ", "  "],
    K: ["  ", "|/", "  ", "  "],
    L: ["  ", "|_", "  ", "  "],
    M: ["   ", "|\\/|", "    ", "    "],
    N: ["   ", "|\\ |", "    ", "    "],
    O: [" _ ", "(_)", "   ", "   "],
    P: [" _ ", "|_)", "   ", "   "],
    Q: [" _ ", "(_\\", "   ", "   "],
    R: ["  ", "|\\", "  ", "  "],
    S: [" _", "(_", "  ", "  "],
    T: ["___", " | ", "   ", "   "],
    U: ["   ", "|_|", "   ", "   "],
    V: ["   ", "\\/ ", "   ", "   "],
    W: ["    ", "\\^/ ", "    ", "    "],
    X: ["  ", "><", "  ", "  "],
    Y: ["  ", "\\/ ", "   ", "   "],
    Z: ["__", "/_", "  ", "  "],
    "0": [" _ ", "(_)", "   ", "   "],
    "1": [" ", "|", " ", " "],
    "2": ["_ ", "_)", "  ", "  "],
    "3": ["_", ")", " ", " "],
    "4": ["  ", "|_|", "  |", "   "],
    "5": [" _", "|_", "  ", "  "],
    "6": [" _ ", "(_)", "   ", "   "],
    "7": ["__", " /", "  ", "  "],
    "8": [" _ ", "(_)", "   ", "   "],
    "9": [" _ ", "(_|", "   ", "   "],
    ".": [" ", ".", " ", " "],
    "-": ["  ", "__", "  ", "  "],
    "!": ["!", ".", " ", " "],
  },
};

// Available fonts map
const FONTS: Partial<Record<TextFont, FontDef>> = {
  standard: FONT_STANDARD,
  banner: FONT_BANNER,
  big: FONT_BIG,
  mini: FONT_MINI,
};

/**
 * Convert a single line of text to ASCII art
 */
const textLineToAscii = (text: string, font: FontDef): string[] => {
  const lines: string[] = Array(font.height).fill("");
  const upperText = text.toUpperCase();

  for (const char of upperText) {
    const charDef =
      font.chars[char] || font.chars[" "] || Array(font.height).fill("   ");
    for (let i = 0; i < font.height; i++) {
      lines[i] += charDef[i] || "";
    }
  }

  return lines.map((line) => line.trimEnd());
};

/**
 * Convert text to ASCII art using FIGlet-style fonts
 * Supports multiline input - each line is converted separately
 */
export const textToAscii = (text: string, options: TextOptions): string => {
  const font = FONTS[options.font] || FONT_STANDARD;

  // Split input into lines and process each
  const inputLines = text.split("\n");
  const resultBlocks: string[][] = [];

  for (const inputLine of inputLines) {
    if (inputLine.trim() === "") {
      // Empty line - add spacing between blocks
      resultBlocks.push(Array(Math.ceil(font.height / 2)).fill(""));
    } else {
      resultBlocks.push(textLineToAscii(inputLine, font));
    }
  }

  // Flatten all blocks into final output
  return resultBlocks
    .flat()
    .map((line) => line.trimEnd())
    .join("\n")
    .trimEnd();
};

/**
 * Get list of available fonts
 */
export const getAvailableFonts = (): TextFont[] => {
  return Object.keys(FONTS) as TextFont[];
};

// ============================================
// IMAGE TO ASCII SECTION
// ============================================

export type CharacterSet =
  | "standard"
  | "detailed"
  | "blocks"
  | "binary"
  | "minimal"
  | "arrows"
  | "custom";

export type OutputFormat = "text" | "html";

export type ConversionOptions = {
  width: number;
  characterSet: CharacterSet;
  customCharacters?: string;
  invert: boolean;
  preserveAspectRatio: boolean;
  colorMode: "monochrome" | "grayscale" | "color";
};

export const DEFAULT_OPTIONS: ConversionOptions = {
  width: 100,
  characterSet: "standard",
  invert: false,
  preserveAspectRatio: true,
  colorMode: "monochrome",
};

// Character sets ordered from darkest to lightest (for dark backgrounds)
export const CHARACTER_SETS: Record<CharacterSet, string> = {
  // Standard ASCII ramp - most commonly used
  standard: "@%#*+=-:. ",
  // More detailed with more gradation
  detailed:
    "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
  // Block characters for more solid output
  blocks: "█▓▒░ ",
  // Binary style - just two characters
  binary: "01",
  // Minimal - clean look with fewer characters
  minimal: "@#=-. ",
  // Arrows and symbols
  arrows: "▼▽△▲►◄◁▷○●□■ ",
  // Custom will use user-provided string
  custom: "",
};

export const CHARACTER_SET_LABELS: Record<CharacterSet, string> = {
  standard: "Standard",
  detailed: "Detailed (70 chars)",
  blocks: "Blocks █▓▒░",
  binary: "Binary 01",
  minimal: "Minimal",
  arrows: "Arrows & Symbols",
  custom: "Custom",
};

export const WIDTH_PRESETS = [
  { label: "Small (50)", value: 50 },
  { label: "Medium (80)", value: 80 },
  { label: "Standard (100)", value: 100 },
  { label: "Large (120)", value: 120 },
  { label: "Wide (150)", value: 150 },
  { label: "Extra Wide (200)", value: 200 },
];

/**
 * Calculate the brightness of a pixel (0-255)
 * Uses standard luminance formula
 */
export const calculateBrightness = (
  r: number,
  g: number,
  b: number
): number => {
  return 0.299 * r + 0.587 * g + 0.114 * b;
};

/**
 * Map a brightness value to a character from the given set
 */
export const brightnessToChar = (
  brightness: number,
  charSet: string,
  invert: boolean
): string => {
  if (charSet.length === 0) return " ";

  // Normalize brightness to 0-1
  const normalizedBrightness = brightness / 255;

  // If inverted, flip the brightness
  const adjustedBrightness = invert
    ? normalizedBrightness
    : 1 - normalizedBrightness;

  // Map to character index
  const charIndex = Math.min(
    Math.floor(adjustedBrightness * charSet.length),
    charSet.length - 1
  );

  return charSet[charIndex];
};

/**
 * Convert RGB to ANSI 256 color code for terminal output
 */
export const rgbToAnsi256 = (r: number, g: number, b: number): number => {
  // Check for grayscale
  if (r === g && g === b) {
    if (r < 8) return 16;
    if (r > 248) return 231;
    return Math.round(((r - 8) / 247) * 24) + 232;
  }

  // Convert to 6x6x6 color cube
  const ri = Math.round((r / 255) * 5);
  const gi = Math.round((g / 255) * 5);
  const bi = Math.round((b / 255) * 5);

  return 16 + 36 * ri + 6 * gi + bi;
};

/**
 * Get character set string based on options
 */
export const getCharacterSet = (options: ConversionOptions): string => {
  if (options.characterSet === "custom" && options.customCharacters) {
    return options.customCharacters;
  }
  return CHARACTER_SETS[options.characterSet] || CHARACTER_SETS.standard;
};

/**
 * Load an image file and return ImageData
 */
export const loadImageFromFile = async (
  file: File
): Promise<{ imageData: ImageData; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);

      URL.revokeObjectURL(url);
      resolve({ imageData, width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
};

/**
 * Load image from a data URL
 */
export const loadImageFromDataUrl = async (
  dataUrl: string
): Promise<{ imageData: ImageData; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);

      resolve({ imageData, width: img.width, height: img.height });
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = dataUrl;
  });
};

/**
 * Scale image data to target dimensions
 */
export const scaleImageData = (
  imageData: ImageData,
  targetWidth: number,
  preserveAspectRatio: boolean
): { data: Uint8ClampedArray; width: number; height: number } => {
  const aspectRatio = imageData.width / imageData.height;
  // ASCII characters are roughly 2x taller than wide, so we adjust
  const charAspectRatio = 0.5;

  let scaledWidth = targetWidth;
  let scaledHeight: number;

  if (preserveAspectRatio) {
    scaledHeight = Math.round((targetWidth / aspectRatio) * charAspectRatio);
  } else {
    scaledHeight = Math.round(targetWidth * charAspectRatio);
  }

  // Ensure minimum dimensions
  scaledWidth = Math.max(1, scaledWidth);
  scaledHeight = Math.max(1, scaledHeight);

  // Create a canvas for scaling
  const canvas = document.createElement("canvas");
  canvas.width = scaledWidth;
  canvas.height = scaledHeight;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  // Create temp canvas with original image
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  const tempCtx = tempCanvas.getContext("2d");
  if (!tempCtx) {
    throw new Error("Could not get temp canvas context");
  }
  tempCtx.putImageData(imageData, 0, 0);

  // Scale with good quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(tempCanvas, 0, 0, scaledWidth, scaledHeight);

  const scaledData = ctx.getImageData(0, 0, scaledWidth, scaledHeight);

  return {
    data: scaledData.data,
    width: scaledWidth,
    height: scaledHeight,
  };
};

/**
 * Convert image data to ASCII art (plain text)
 */
export const imageDataToAscii = (
  imageData: ImageData,
  options: ConversionOptions
): string => {
  const charSet = getCharacterSet(options);
  const { data, width, height } = scaleImageData(
    imageData,
    options.width,
    options.preserveAspectRatio
  );

  const lines: string[] = [];

  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const brightness = calculateBrightness(r, g, b);
      const char = brightnessToChar(brightness, charSet, options.invert);
      line += char;
    }
    lines.push(line);
  }

  return lines.join("\n");
};

/**
 * Convert image data to colored HTML ASCII art
 */
export const imageDataToColoredHtml = (
  imageData: ImageData,
  options: ConversionOptions
): string => {
  const charSet = getCharacterSet(options);
  const { data, width, height } = scaleImageData(
    imageData,
    options.width,
    options.preserveAspectRatio
  );

  const lines: string[] = [];

  for (let y = 0; y < height; y++) {
    let line = "";
    let lastColor = "";

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const brightness = calculateBrightness(r, g, b);
      const char = brightnessToChar(brightness, charSet, options.invert);

      if (options.colorMode === "color") {
        const color = `rgb(${r},${g},${b})`;
        if (color !== lastColor) {
          if (lastColor) line += "</span>";
          line += `<span style="color:${color}">`;
          lastColor = color;
        }
        line += char === " " ? "&nbsp;" : escapeHtml(char);
      } else if (options.colorMode === "grayscale") {
        const gray = Math.round(brightness);
        const color = `rgb(${gray},${gray},${gray})`;
        if (color !== lastColor) {
          if (lastColor) line += "</span>";
          line += `<span style="color:${color}">`;
          lastColor = color;
        }
        line += char === " " ? "&nbsp;" : escapeHtml(char);
      } else {
        line += char === " " ? "&nbsp;" : escapeHtml(char);
      }
    }

    if (lastColor) line += "</span>";
    lines.push(line);
  }

  return lines.join("<br>");
};

/**
 * Escape HTML special characters
 */
const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m] || m);
};

/**
 * Convert image to ASCII art with full pipeline
 */
export const convertImageToAscii = async (
  file: File,
  options: ConversionOptions
): Promise<{
  ascii: string;
  html: string;
  dimensions: { width: number; height: number };
}> => {
  const { imageData, width, height } = await loadImageFromFile(file);
  const ascii = imageDataToAscii(imageData, options);

  let html = ascii;
  if (options.colorMode !== "monochrome") {
    html = imageDataToColoredHtml(imageData, options);
  }

  // Calculate actual output dimensions
  const aspectRatio = width / height;
  const charAspectRatio = 0.5;
  const outputHeight = Math.round(
    (options.width / aspectRatio) * charAspectRatio
  );

  return {
    ascii,
    html,
    dimensions: {
      width: options.width,
      height: outputHeight,
    },
  };
};

/**
 * Download ASCII art as a text file
 */
export const downloadAsciiArt = (
  ascii: string,
  filename = "ascii-art.txt"
): void => {
  const blob = new Blob([ascii], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Copy ASCII art to clipboard
 */
export const copyAsciiToClipboard = async (ascii: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(ascii);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = ascii;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  }
};

/**
 * Supported image MIME types
 */
export const SUPPORTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/bmp",
];

/**
 * Check if a file is a supported image type
 */
export const isImageSupported = (file: File): boolean => {
  return SUPPORTED_IMAGE_TYPES.includes(file.type);
};

/**
 * Get file extension from MIME type
 */
export const getExtensionFromMime = (mimeType: string): string => {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/bmp": "bmp",
  };
  return map[mimeType] || "png";
};
