import {
  Calendar03Icon,
  CodeIcon,
  CodeSquareIcon,
  Home01Icon,
  Link01Icon,
  PaintBoardIcon,
  PercentIcon,
  SourceCodeIcon,
  TextIcon,
  Time01Icon,
} from "@hugeicons/core-free-icons";

export interface NavItem {
  title: string;
  href: string;
  icon: typeof Home01Icon;
}

export const navItems: NavItem[] = [
  {
    title: "Home",
    href: "/",
    icon: Home01Icon,
  },
  {
    title: "Cron Parser",
    href: "/cron-parser",
    icon: Time01Icon,
  },
  {
    title: "Regex Tester",
    href: "/regex-tester",
    icon: TextIcon,
  },
  {
    title: "URL Parser",
    href: "/url-parser",
    icon: Link01Icon,
  },
  {
    title: "URL Encoder",
    href: "/url-encoder",
    icon: PercentIcon,
  },
  {
    title: "HTML Entities",
    href: "/html-entities",
    icon: CodeSquareIcon,
  },
  {
    title: "JSON Formatter",
    href: "/json-formatter",
    icon: CodeIcon,
  },
  {
    title: "JSON / YAML",
    href: "/json-to-yaml",
    icon: SourceCodeIcon,
  },
  {
    title: "Color Converter",
    href: "/color-converter",
    icon: PaintBoardIcon,
  },
  {
    title: "Unix Time",
    href: "/unix-time-converter",
    icon: Calendar03Icon,
  },
];

// Tools only (excludes Home) - used in command menu
export const toolNavItems = navItems.filter((item) => item.href !== "/");
