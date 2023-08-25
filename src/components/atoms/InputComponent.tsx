import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import InfiniteScroll from "react-infinite-scroll-component";
import HashLoader from "react-spinners/HashLoader";
import SyncLoader from "react-spinners/SyncLoader";
import { useDispatch } from "react-redux";
import { modalSet } from "../../redux/slices/ModalSlice";
import AddIcon from "@mui/icons-material/Add";
export interface IListInput {
  name: String;
  value: any;
}

export enum TypeField {
  INPUT = "input",
  TEXTAREA = "textarea",
}

interface IModal {
  Children: React.FC<any> | null;
  title?: string;
  props?: {};
  className?: React.HTMLAttributes<HTMLDivElement> | string | undefined;
}

export interface IValue {
  valueData: any;
  valueInput: String;
  other?: any;
}

export interface IInfiniteScroll {
  active?: boolean;
  next: (e?: any) => Promise<any> | void;
  hasMore: boolean;
  onSearch: (e?: any) => Promise<any> | void;
  loading: Boolean;
}

interface IProps {
  typeField?: TypeField;
  className?: React.HTMLAttributes<HTMLDivElement> | string | undefined;
  inputStyle?: React.HTMLAttributes<HTMLDivElement> | string | undefined;
  modalStyle?: React.HTMLAttributes<HTMLDivElement> | string | undefined;
  remarkStyle?: React.HTMLAttributes<HTMLDivElement> | string | undefined;
  itemModalStyle?: React.HTMLAttributes<HTMLDivElement> | string | undefined;
  closeIconClass?: React.HTMLAttributes<HTMLDivElement> | string | undefined;
  mandatoy?: boolean;
  disabled?: boolean;
  modal?: IModal;
  label?: String;
  value: IValue;
  onChange?: (e?: any) => Promise<any> | void;
  onSelected?: (e?: any) => Promise<any> | void;
  onReset?: (e?: any) => Promise<any> | void;
  onCLick?: (e?: any) => Promise<any> | void;
  list?: IListInput[];
  placeholder?: any;
  type?: React.HTMLInputTypeAttribute | undefined;
  min?: any;
  max?: any;
  loading?: boolean;
  remark?: String;
  infoRemark?: String;
  infiniteScroll?: IInfiniteScroll|undefined;
}

const InputComponent: React.FC<IProps> = ({
  typeField = TypeField.INPUT,
  className,
  inputStyle,
  mandatoy,
  disabled,
  label,
  value,
  modal,
  onChange,
  list,
  onSelected,
  onReset,
  placeholder,
  modalStyle,
  itemModalStyle,
  onCLick,
  type,
  closeIconClass,
  min,
  loading,
  remark,
  remarkStyle,
infoRemark,
  max,
  infiniteScroll,
}) => {
  const modalRef = useRef<any>();
  const inputRef = useRef<any>();
  const dispatch = useDispatch();
  const [open, setOpen] = useState<boolean>(false);
  const [openRemark, setOpenRemark] = useState<boolean>(false);
  if (infiniteScroll) {
    if (infiniteScroll.active === undefined) {
      infiniteScroll.active = true;
    }
  }

  useEffect(() => {
    let handler = (e: any) => {
      if (list) {
        if (!modalRef.current?.contains(e.target)) {
          setOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  const filterData = (a: any[]) => {
    if (!infiniteScroll || !infiniteScroll?.active) {
      return _.filter(a, function (query) {
        var name = value
          ? query.name.toLowerCase().includes(value.valueInput.toLowerCase())
          : true;

        return name;
      });
    }
    return a;
  };

  infiniteScroll &&
    useEffect(() => {
      if (infiniteScroll.active) {
        const timeoutId = setTimeout(() => {
          infiniteScroll.onSearch(value.valueInput);
        }, 300);

        return () => {
          clearTimeout(timeoutId);
        };
      }
    }, [value.valueInput]);

  const OpenModal = (): void => {
    if (modal) {
      dispatch(
        modalSet({
          active: true,
          Children: modal.Children,
          title: modal.title,
          props: modal.props,
          className: modal.className,
        })
      );
    }
  };

  return (
    <>
      {label && (
        <label className="text-sm text-gray-800">
          {label} {mandatoy && !disabled && <a className="text-red-600">*</a>}
        </label>
      )}
      <div
        // onClick={onCLick}
        className={`mt-1 w-full rounded-md h-[40px] bg-gray-50  relative ${className}`}
      >
        {typeField === TypeField.INPUT ? (
          <input
            min={min}
            max={max}
            ref={inputRef}
            type={type ?? "text"}
            placeholder={placeholder}
            disabled={disabled}
            onClick={() => {
              if (onCLick) {
                onCLick();
              }
              setOpen(!open);
            }}
            onChange={(e) => {
              if (onChange) {
                onChange(e.target.value);
              }
            }}
            value={
              type && inputRef.current === document.activeElement
                ? `${value.valueData}` == "0"
                  ? ""
                  : `${value.valueInput}`
                : `${value.valueInput}`
            }
            className={`w-full  ${
              mandatoy && !value.valueData && "border-red-500 border"
            }  text-md text-gray-900  font-normal border h-full z-10 rounded-md bg-gray-50  px-3 ${inputStyle}`}
          />
        ) : (
          <textarea
            ref={inputRef}
            placeholder={placeholder}
            disabled={disabled}
            onClick={() => {
              if (onCLick) {
                onCLick();
              }
              setOpen(!open);
            }}
            onChange={(e) => {
              if (onChange) {
                onChange(e.target.value);
              }
            }}
            value={
              type && inputRef.current === document.activeElement
                ? `${value.valueData}` == "0"
                  ? ""
                  : `${value.valueInput}`
                : `${value.valueInput}`
            }
            className={`w-full  ${
              mandatoy && !value.valueData && "border-red-500 border"
            }  text-md text-gray-900  font-normal border z-10 rounded-md bg-gray-50  py-2 px-3 ${inputStyle}`}
          />
        )}
        {(value.valueInput || type == "number") && onReset && !disabled && type!=="date" && (
          <CloseIcon
            onClick={() => {
              if (onReset) {
                onCLick && onCLick();
                inputRef.current?.focus();
                setOpen(true);
                onReset();
              }
            }}
            className={` right-2 top-[12px] absolute z-20 text-gray-300 ${closeIconClass} `}
            style={{ fontSize: 14 }}
          />
        )}
        {open && list && type!=="date"&& (
          <InfiniteScroll
            dataLength={list.length}
            next={infiniteScroll ? infiniteScroll.next : () => {}}
            hasMore={infiniteScroll?.hasMore ? true : false}
            loader={
              <div className="w-auto  left-1/2 inline py-1 px-2 text-center relative bottom-14  text-sm text-gray-400">
                <SyncLoader
                  color="#36d7b6"
                  loading={true}
                  size={8}
                  aria-label="Loading Spinner"
                  data-testid="loader"
                />
              </div>
            }
            scrollableTarget="scrollableDiv"
          >
            <div
              id="scrollableDiv"
              ref={modalRef}
              className={`w-full ab  max-h-[200px] h-auto cursor-pointer  p-1 font-normal text-md border  scrollbar-none z-50 overflow-y-auto absolute top-7 bg-white rounded-md ${modalStyle}`}
            >
              {!loading &&
                filterData(list)?.map((item, id) => (
                  <h4
                    onClick={() => {
                      if (onSelected) {
                        onSelected(item);
                        setOpen(false);
                      }
                    }}
                    key={id}
                    className={`w-full text-md hover:bg-gray-100 rounded-md border-[#ececec] px-3 py-2 ${itemModalStyle}`}
                  >
                    {item.name}
                  </h4>
                ))}
              {infiniteScroll && infiniteScroll.loading && (
                <h4 className="w-full text-center py-2">
                  <SyncLoader
                    color="#36d7b6"
                    loading={true}
                    size={8}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                </h4>
              )}
              {!loading &&
                !infiniteScroll?.loading &&
                filterData(list).length < 1 &&
                modal && (
                  <div
                    onClick={OpenModal}
                    className=" px-2 py-2 flex item-center  text-[13.5px] text-[#0088fc] mb-2  hover:cursor-pointer hover:bg-[#f4f5f7]"
                  >
                    <AddIcon
                      className="stroke-[#0088fc]"
                      style={{
                        fontSize: "15px",
                        marginTop: "3px",
                        strokeWidth: "2",
                        marginRight: "3px",
                      }}
                    />
                    <h3 className="inline font-semibold">
                      Create a new {label}
                    </h3>
                  </div>
                )}
              {!loading &&
                !infiniteScroll?.loading &&
                filterData(list).length < 1 &&
                !modal && (
                  <h6 className="text-gray-300 text-center text-sm py-3">
                    No result
                  </h6>
                )}

              {loading && (
                <div className="flex items-center justify-center h-14">
                  <HashLoader
                    color="#36d7b6"
                    loading={true}
                    size={22}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                </div>
              )}
            </div>
          </InfiniteScroll>
        )}
      </div>
      {remark && (
        <div
          className={`mb-1 font-normal -mt-2  ${remarkStyle} relative ${
            infoRemark && "cursor-pointer"
          }`}
          onMouseEnter={() => {
            if (infoRemark) {
              setOpenRemark(true);
            }
          }}
          onMouseLeave={() => setOpenRemark(false)}
        >
          <h6 className="italic text-[0.9em] text-gray-700">{remark}</h6>
          <h6
            className={` ${
              !openRemark && "hidden"
            } duration-300 bg-gray-900 text-white w-auto text-center rounded-md absolute p-1 px-2  -top-7`}
          >
            {infoRemark}
          </h6>
        </div>
      )}
    </>
  );
};

export default InputComponent;
