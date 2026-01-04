import {
  AnalysisTextLinkIcon,
  BrowserIcon,
  Calendar03Icon,
  CodeIcon,
  CodeSquareIcon,
  CommandIcon,
  DocumentCodeIcon,
  FingerPrintIcon,
  GridTableIcon,
  Image01Icon,
  ImageCompositionIcon,
  Key01Icon,
  Link01Icon,
  NoteEditIcon,
  PaintBoardIcon,
  PercentIcon,
  QrCodeIcon,
  ReactIcon,
  SourceCodeIcon,
  StarIcon,
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
    title: "Keycode",
    href: "/keycode",
    icon: CommandIcon,
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
    title: "HTML Entities Encode/Decode",
    href: "/html-entities",
    icon: CodeSquareIcon,
  },
  {
    title: "HTML Symbols",
    href: "/html-symbols",
    icon: StarIcon,
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
    title: "JSON / CSV",
    href: "/json-csv",
    icon: GridTableIcon,
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
  {
    title: "Word Counter",
    href: "/word-counter",
    icon: AnalysisTextLinkIcon,
  },
  {
    title: "Image Compressor",
    href: "/image-compressor",
    icon: Image01Icon,
  },
  {
    title: "Favicon Maker",
    href: "/favicon-maker",
    icon: ImageCompositionIcon,
  },
  {
    title: "SVG to CSS",
    href: "/svg-to-css",
    icon: DocumentCodeIcon,
  },
  {
    title: "SVG to JSX",
    href: "/svg-to-jsx",
    icon: ReactIcon,
  },
];

// Tools only (excludes Home) - used in command menu
export const toolNavItems = navItems.filter((item) => item.href !== "/");
