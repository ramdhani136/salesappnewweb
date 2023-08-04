import moment from "moment";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  IconButton,
  TimeLineVertical,
  ToggleBodyComponent,
} from "../../components/atoms";
import InputComponent, { IValue } from "../../components/atoms/InputComponent";
import { LoadingComponent } from "../../components/moleculs";
import { AlertModal, Meta } from "../../utils";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import ScheduleItemPacking from "./ScheduleItemPacking";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { IListIconButton } from "../../components/atoms/IconButton";

const ScheduleItemPage = () => {
  let { scheduleId, scheduleItem } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>({});
  const [scroll, setScroll] = useState<number>(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [schedule, setSchedule] = useState<IValue>({
    valueData: scheduleId,
    valueInput: `${scheduleId}`,
  });
  const [itemCode, setItemCode] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [bin, setBin] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [itemName, setItemName] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [category, setCategory] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [stocker, setStocker] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [warehouse, setWarehouse] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [uom, setUom] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [actualQty, setAqtualQty] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [realQty, setRealQty] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [status, setStatus] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [createdAt, setCreatedAt] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });

  const [updatedAt, setUpdatedAt] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });

  const [listMoreAction, setListMoreAction] = useState<IListIconButton[]>([]);

  const metaData = {
    title: "Schedule Item - Stock App Ekatunggal",
    description: "Halaman schedule item stock opname web system",
  };

  const getData = async (): Promise<void> => {
    try {
      const result = await GetDataServer(DataAPI.SCHEDULEITEM).FINDONE(
        `${scheduleItem}`
      );

      setData(result.data);

      setListMoreAction([
        {
          name: "Delete",
          onClick: () => {
            onDelete(result.data);
          },
        },
      ]);
      setAqtualQty({
        valueData: result.data.actual_qty,
        valueInput: `${result.data.actual_qty.toLocaleString()}`,
      });

      setBin({
        valueData: result.data.bin,
        valueInput: result.data.bin,
      });

      setItemCode({
        valueData: result.data.item_code,
        valueInput: result.data.item_code,
      });

      setItemName({
        valueData: result.data.item_name,
        valueInput: result.data.item_name,
      });

      setCategory({
        valueData: result.data.kategori_barang,
        valueInput: result.data.kategori_barang,
      });

      setRealQty({
        valueData: result.data.real_qty,
        valueInput: `${result.data.real_qty.toLocaleString()}`,
      });

      setStatus({
        valueData: result.data.status,
        valueInput:
          result.data.status == 0
            ? "Open"
            : result.data.status == 1
            ? "Completed"
            : "Not Match",
      });

      setUom({
        valueData: result.data.stock_uom,
        valueInput: result.data.stock_uom,
      });

      setStocker({
        valueData: result.data.stocker,
        valueInput: result.data.stocker,
      });

      setWarehouse({
        valueData: result.data.warehouse,
        valueInput: result.data.warehouse,
      });
      setCreatedAt({
        valueData: moment(result.data.createdAt).format("YYYY-MM-DD"),
        valueInput: moment(result.data.createdAt).format("YYYY-MM-DD"),
      });
      setUpdatedAt({
        valueData: moment(result.data.updatedAt).format("YYYY-MM-DD"),
        valueInput: moment(result.data.updatedAt).format("YYYY-MM-DD"),
      });

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      AlertModal.Default({
        icon: "error",
        title: "Error",
        text: "Data not found!",
      });

      navigate("/schedule");
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const onDelete = (data: any): void => {
    AlertModal.confirmation({
      onConfirm: async (): Promise<void> => {
        try {
          setLoading(true);
          await GetDataServer(DataAPI.SCHEDULEITEM).DELETE(data._id);
          navigate(`/schedule/${data.schedule.name}`);
        } catch (error) {
          AlertModal.Default({
            icon: "error",
            title: "Error",
            text: "Error Network",
          });
          setLoading(false);
        }
      },
    });
  };

  return (
    <>
      {Meta(metaData)}
      <div
        className="  max-h-[calc(100vh-70px)] overflow-y-auto scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-gray-300"
        onScroll={(e: any) => setScroll(e.target.scrollTop)}
      >
        {!loading ? (
          <>
            <div
              className={`w-full flex  justify-between px-5 ${
                scroll > 0
                  ? "bg-white border-b border-gray-100 drop-shadow-sm py-6"
                  : "bg-gray-100"
              } py-5 sticky top-0 z-[51] duration-500`}
            >
              <div className="flex  items-center">
                <div className="font-normal text-gray-900   text-sm mr-2 ">
                  <b
                    className="cursor-pointer"
                    onClick={() => navigate("/schedule")}
                  >
                    Schedule
                  </b>{" "}
                  <ArrowForwardIosIcon className="" style={{ fontSize: 10 }} />{" "}
                  <h4
                    className="inline cursor-pointer"
                    onClick={() => navigate(`/schedule/${scheduleId}`)}
                  >
                    {scheduleId}
                  </h4>{" "}
                  <ArrowForwardIosIcon className="" style={{ fontSize: 10 }} />{" "}
                  ({data.item_code}) {data.item_name}
                </div>
              </div>
              <div className="flex">
                {listMoreAction.length > 0 && (
                  <IconButton
                    classModal="top-[29px]"
                    primary
                    Icon={MoreHorizIcon}
                    iconSize={15}
                    classIcon="mt-1"
                    list={listMoreAction}
                    iconListDisabled
                    className={` duration-100 mr-2 px-2 `}
                  />
                )}

                {data.status == 0 && data.schedule.status == 1 && (
                  <IconButton
                    name="Actions"
                    list={[
                      {
                        name: "Submit",
                        onClick: () => alert("submit"),
                      },
                    ]}
                    className={`opacity-80 hover:opacity-100 duration-100  `}
                  />
                )}
              </div>
            </div>
            <div className=" px-5 flex flex-  flex-col pb-3">
              <div className="border w-full flex-1  bg-white rounded-md overflow-y-scroll scrollbar-none">
                <div className="w-full h-auto  float-left rounded-md p-3 py-5">
                  <div className=" w-1/2 px-4 float-left ">
                    <InputComponent
                      label="Schedule"
                      value={schedule}
                      className="h-[38px]   text-[0.93em] mb-3"
                      modalStyle="top-9 max-h-[160px]"
                      disabled
                      closeIconClass="top-[13.5px]"
                    />

                    <InputComponent
                      label="Item Code"
                      value={itemCode}
                      className="h-[38px]   text-[0.93em] mb-3"
                      modalStyle="top-9 max-h-[160px]"
                      disabled
                      closeIconClass="top-[13.5px]"
                    />
                    <InputComponent
                      label="Item Name"
                      value={itemName}
                      className="h-[38px]   text-[0.93em] mb-3"
                      modalStyle="top-9 max-h-[160px]"
                      disabled
                      closeIconClass="top-[13.5px]"
                    />

                    <InputComponent
                      label="Category"
                      value={category}
                      className="h-[38px]   text-[0.93em] mb-3"
                      modalStyle="top-9 max-h-[160px]"
                      disabled
                      closeIconClass="top-[13.5px]"
                    />

                    <InputComponent
                      label="Stocker"
                      value={stocker}
                      className="h-[38px]   text-[0.93em] mb-3"
                      modalStyle="top-9 max-h-[160px]"
                      disabled
                      closeIconClass="top-[13.5px]"
                    />

                    <InputComponent
                      label="Warehouse"
                      value={warehouse}
                      className="h-[38px]   text-[0.93em] mb-3"
                      modalStyle="top-9 max-h-[160px]"
                      disabled
                      closeIconClass="top-[13.5px]"
                    />
                  </div>
                  <div className=" w-1/2 px-4 float-left  mb-3">
                    <InputComponent
                      label="Bin"
                      value={bin}
                      className="h-[38px]   text-[0.93em] mb-3"
                      modalStyle="top-9 max-h-[160px]"
                      disabled
                      closeIconClass="top-[13.5px]"
                    />
                    <InputComponent
                      disabled
                      label="Date"
                      value={createdAt}
                      className="h-[38px]  text-[0.93em] mb-3"
                      type="date"
                    />
                    <InputComponent
                      disabled
                      label="Actual Qty"
                      value={actualQty}
                      className="h-[38px]  text-[0.95em] mb-3"
                      remark={`*Last update ${moment(
                        `${data.updatedAt}`
                      ).fromNow()}`}
                      remarkStyle="text-red-400 text-[0.77em]"
                      infoRemark={moment(`${data.updatedAt}`).format("lll")}
                    />
                    <InputComponent
                      disabled
                      label="Real Qty"
                      value={realQty}
                      className="h-[38px]  text-[0.93em] mb-3"
                    />

                    <InputComponent
                      label="Uom"
                      value={uom}
                      className="h-[38px]  text-[0.93em] mb-3"
                      disabled
                    />

                    <InputComponent
                      disabled
                      label="Status"
                      value={status}
                      className="h-[38px]  text-[0.93em] mb-3"
                    />
                  </div>
                </div>
              </div>

              <ToggleBodyComponent
                name="Registration Packing ID"
                className="mt-5"
                child={
                  <ScheduleItemPacking props={data} scheduleRefresh={getData} />
                }
              />

              {/* <TimeLineVertical data={history} /> */}
            </div>
          </>
        ) : (
          <LoadingComponent />
        )}
      </div>
    </>
  );
};

export default React.memo(ScheduleItemPage);
