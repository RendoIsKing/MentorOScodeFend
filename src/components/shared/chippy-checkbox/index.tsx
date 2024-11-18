import React from "react";
import { Check, Plus } from "lucide-react";
import "./style.css";
import { cn } from "@/lib/utils";
interface IChippyCheckboxProps {
  id: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

const ChippyCheckbox: React.FC<IChippyCheckboxProps> = ({
  id,
  value,
  label,
  checked,
  onChange,
}) => {
  return (
    <ul>
      <li className="w-fit">
        <input
          type="checkbox"
          id={id}
          value={value}
          checked={checked}
          onChange={onChange}
          className="opacity-0 absolute w-0"
        />
        <label
          htmlFor={id}
          className={cn(
            "p-3 flex justify-between min-w-[103px] items-center border-2 border-primary rounded-full whitespace-nowrap select-none transition-all  hover:cursor-pointer before:transition-transform duration-300 ease-in-out",
            checked ? "bg-primary text-white" : "border-primary"
          )}
        >
          <span className="svg_wrapper">{checked ? <Check /> : <Plus />}</span>
          {label}
        </label>
      </li>
    </ul>
  );
};

export default ChippyCheckbox;
