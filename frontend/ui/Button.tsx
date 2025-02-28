import classNames from "classnames";
import { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
};

const Button = ({
  children,
  className,
  fullWidth,
  size = "md",
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      type={props.type ?? "button"}
      className={classNames(
        "w-fit rounded-full text-violet-100 shadow-violet-600/40 transition-all disabled:opacity-50",
        { "w-full": fullWidth },
        size === "lg"
          ? "h-[60px] bg-violet-800 px-6 py-3 text-xl font-semibold shadow-[0_0_16px_6px] enabled:hover:bg-violet-700 enabled:focus-visible:bg-violet-700 enabled:active:scale-[0.98] enabled:active:bg-violet-700"
          : size === "md"
            ? "h-[50px] bg-violet-950 px-7 py-1.5 text-sm font-medium enabled:hover:bg-violet-900 enabled:active:bg-violet-900"
            : "bg-violet-950 px-4 py-1.5 text-sm font-medium enabled:hover:bg-violet-900 enabled:active:bg-violet-900",
        className,
      )}
    >
      {children}
    </button>
  );
};

export default Button;
