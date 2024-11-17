import classNames from "classnames";
import { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  fullWidth?: boolean;
};

const Button = ({ children, className, fullWidth, ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      type={props.type ?? "button"}
      className={classNames(
        "w-fit rounded-full bg-pink-500 px-3 py-1.5 font-medium text-white shadow-lg shadow-pink-200 transition-all enabled:hover:bg-pink-600 enabled:active:scale-[0.98] disabled:opacity-70",
        { "w-full": fullWidth },
        className,
      )}
    >
      {children}
    </button>
  );
};

export default Button;
