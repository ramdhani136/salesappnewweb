import React from "react";

import AddIcon from "@mui/icons-material/Add";

const ConnectionsUser: React.FC<any> = ({ data }) => {
  console.log(data);
  return (
    <div className=" w-full  float-left h-auto -mt-2">
      {data &&
        data.map((i: IConnectionComponent, index: number | string) => (
          <div key={index} className="float-left w-1/3 mb-5 flex flex-col">
            <ConnectionComponent title={i.title} data={i.data} />
          </div>
        ))}
    </div>
  );
};

interface IListConnection {
  title: string;
  count?: number;
  onTitle?: () => Promise<void> | void;
  onAdd?: () => Promise<void> | void;
}

export interface IConnectionComponent {
  title?: string;
  data: IListConnection[];
}

const ConnectionComponent: React.FC<IConnectionComponent> = ({
  title,
  data,
}) => {
  return (
    <div className="flex flex-col">
      {title && <label className="text-[0.85em] mb-1">{title}</label>}
      {data.map((i, index) => (
        <div key={index} className="mt-1 flex text-[0.8em] cursor-pointer mb-1">
          <ul className="items-center flex px-[8px] py-[5px] rounded-md bg-gray-100">
            {i.count !== undefined && (
              <li className="flex items-center justify-center text-[0.75em] border mr-2 rounded-md px-[5px] py-[1px] bg-red-400 text-white">
                <h4> {i.count > 100 ? "99+" : i.count}</h4>
              </li>
            )}
            <li onClick={i.onTitle} className="hover:underline text-[0.9em] ">
              {i.title}
            </li>
          </ul>
          <h4
            onClick={i.onAdd}
            className="flex flex-col justify-center item-center rounded-md ml-2 px-2 py-0 bg-gray-100 hover:bg-gray-200"
          >
            <AddIcon style={{ fontSize: "15", color: "#666" }} />
          </h4>
        </div>
      ))}
    </div>
  );
};

export default ConnectionsUser;
