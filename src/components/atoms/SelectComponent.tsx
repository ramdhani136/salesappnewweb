import React from "react";

export interface ISelectValue {
  title: string;
  value: any;
}

interface ISelect {
  title?: string;
  data: any[];
  value: any;
  setValue?: any;
  disabled?: boolean;
  ClassName?: React.HTMLAttributes<HTMLSelectElement> | string | undefined;
  onClick?: () => Promise<void> | void;
}

const Select: React.FC<ISelect> = ({
  data,
  value,
  setValue,
  title,
  disabled,
  ClassName,
  onClick,
}) => {
  return (
    <div className="w-full mb-4">
      {title && <label className="block text-md text-gray-700 ">{title}</label>}
      <select
        disabled={disabled}
        onChange={(e) => {
          setValue && setValue(e.target.value);
        }}
        value={value}
        className={`${
          disabled ? `cursor-not-allowed` : ``
        } w-full px-3 text-[1em] mt-2 border h-[40px] rounded-md  bg-gray-50 outline-gray-200 ${ClassName}`}
        name={title}
        onClick={onClick}
      >
        {data ? (
          data.length > 0 ? (
            data.map((item, key) => (
              <option key={key} value={item.value}>
                {item.title}
              </option>
            ))
          ) : (
            <></>
          )
        ) : (
          <></>
        )}
      </select>
    </div>
  );
};

export default Select;
