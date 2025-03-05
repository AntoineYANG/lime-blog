import { Klee_One, LXGW_WenKai_Mono_TC, Sometype_Mono, Waiting_for_the_Sunrise } from "next/font/google";


const kleeOne = Klee_One({
  variable: "--font-klee-one",
  weight: ["400", "600"],
  subsets: ["latin", "cyrillic", "greek-ext", "latin-ext"],
});

const sometypeMono = Sometype_Mono({
  variable: "--font-sometype-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin", "latin-ext"],
});

const waitingForTheSunrise = Waiting_for_the_Sunrise({
  variable: "--font-waiting-for-the-sunrise",
  weight: ["400"],
  subsets: ["latin", "latin-ext"],
});

const LXGWMono = LXGW_WenKai_Mono_TC({
  variable: "--font-lxgw-wentai-mono-tc",
  weight: ["300", "400", "700"],
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
});

export const font = {
  kleeOne,
  sometypeMono,
  waitingForTheSunrise,
  LXGWMono,
};
