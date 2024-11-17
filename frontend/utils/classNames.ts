import { twMerge } from "tw-merge";
import classnames, { ArgumentArray } from "classnames";

const classNames = (className: ArgumentArray) => twMerge(classnames(className));

export default classNames;
