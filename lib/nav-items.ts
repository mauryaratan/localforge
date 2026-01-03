import {
  BrowserIcon,
  Calendar03Icon,
  CodeIcon,
  CodeSquareIcon,
  FingerPrintIcon,
  Key01Icon,
  Link01Icon,
  NoteEditIcon,
  PaintBoardIcon,
  PercentIcon,
  QrCodeIcon,
  SourceCodeIcon,
  TextAlignLeftIcon,
  TextIcon,
  Time01Icon,
} from "@hugeicons/core-free-icons";

export interface NavItem {
  title: string;
  href: string;
  icon: typeof CodeSquareIcon;
}

export const navItems: NavItem[] = [
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
    title: "String Case",
    href: "/string-case-converter",
    icon: TextAlignLeftIcon,
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
    title: "Base64",
    href: "/base64",
    icon: Key01Icon,
  },
  {
    title: "UUID / ULID",
    href: "/uuid-generator",
    icon: FingerPrintIcon,
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
  {
    title: "Markdown Preview",
    href: "/markdown-preview",
    icon: NoteEditIcon,
  },
  {
    title: "QR Code",
    href: "/qr-code",
    icon: QrCodeIcon,
  },
  {
    title: "HTML Preview",
    href: "/html-preview",
    icon: BrowserIcon,
  },
];

// Tools only (excludes Home) - used in command menu
export const toolNavItems = navItems.filter((item) => item.href !== "/");
