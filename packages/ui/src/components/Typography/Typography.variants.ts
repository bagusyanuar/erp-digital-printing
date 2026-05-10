import { cva } from "class-variance-authority";

export const typographyVariants = cva("text-foreground", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-black tracking-tight lg:text-5xl",
      h2: "scroll-m-20 text-3xl font-black tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-bold tracking-tight",
      h4: "scroll-m-20 text-xl font-bold tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      ul: "my-6 ml-6 list-disc [&>li]:mt-2",
      inlineCode: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-bold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
    },
    weight: {
      thin: "font-thin",
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
      black: "font-black",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
  },
  defaultVariants: {
    variant: "p",
    weight: "normal",
    align: "left",
  },
});
