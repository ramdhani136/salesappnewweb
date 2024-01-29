import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  ButtonStatusComponent,
  IconButton,
  InputComponent,
  TimeLineVertical,
  ToggleBodyComponent,
} from "../../components/atoms";
import { IListInput, IValue } from "../../components/atoms/InputComponent";
import { LoadingComponent } from "../../components/moleculs";
import moment from "moment";
import { AlertModal, LocalStorage, Meta } from "../../utils";

import { IListIconButton } from "../../components/atoms/IconButton";
import Swal from "sweetalert2";

const FormAssesmentTemplatePage: React.FC = () => {
  let { id } = useParams();
  const [data, setData] = useState<any>({});
  const metaData = {
    title: `${
      id ? data.name ?? "Loading ..  " : "New Template"
    } - Sales App Ekatunggal`,
    description: "Halaman form Template Sales web system",
  };

  const navigate = useNavigate();

  const [scroll, setScroll] = useState<number>(0);
  const [workflow, setWorkflow] = useState<IListIconButton[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isChangeData, setChangeData] = useState<boolean>(false);

  const [user, setUser] = useState<IValue>({
    valueData: LocalStorage.getUser()._id,
    valueInput: LocalStorage.getUser().name,
  });
  const [name, setName] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [status, setStatus] = useState<String>("Draft");
  const [indicators, setIndicators] = useState<any[]>([]);
  const [desc, setDesc] = useState<string>("");
  const [prevData, setPrevData] = useState<any>({
    name: name.valueData,
    desc: desc ?? "",
  });

  const [createdAt, setCreatedAt] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });

  const [loading, setLoading] = useState<boolean>(true);

  const [listMoreAction, setListMoreAction] = useState<IListIconButton[]>([]);

  const getData = async (): Promise<void> => {
    setWorkflow([]);
    try {
      const result = await GetDataServer(DataAPI.ASSESMENTTEMPLATE).FINDONE(
        `${id}`
      );

      // set workflow
      if (result.workflow.length > 0) {
        const isWorkflow = result.workflow.map((item: any): IListIconButton => {
          return {
            name: item.action,
            onClick: () => {
              AlertModal.confirmation({
                onConfirm: () => {
                  onSave(item.nextState.id);
                },
                confirmButtonText: "Yes, Save it!",
              });
            },
          };
        });

        setWorkflow(isWorkflow);
      }
      // end

      setHistory(result.history);

      setName({
        valueData: result.data.name,
        valueInput: result.data.name,
      });
      setUser({
        valueData: result.data.createdBy._id,
        valueInput: result.data.createdBy.name,
      });
      setCreatedAt({
        valueData: moment(result.data.createdAt).format("YYYY-MM-DD"),
        valueInput: moment(result.data.createdAt).format("YYYY-MM-DD"),
      });

      setData(result.data);

      setIndicators(result.data.indicators);

      setPrevData({
        name: result.data.name,
        desc: result.data.desc ?? "",
      });
      if (result.data.notes) {
        setDesc(result.data.notes);
      }
      setStatus(
        result.data.status == "0"
          ? "Draft"
          : result.data.status == "1"
          ? "Submitted"
          : result.data.status == "2"
          ? "Canceled"
          : "Closed"
      );
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      AlertModal.Default({
        icon: "error",
        title: "Error",
        text: "Data not found!",
      });

      navigate("/assesment/template");
    }
  };

  const onDelete = (): void => {
    if (id) {
      const progress = async (): Promise<void> => {
        setLoading(true);
        try {
          await GetDataServer(DataAPI.ASSESMENTTEMPLATE).DELETE(`${id}`);
          navigate("/assesment/template");
        } catch (error: any) {
          setLoading(false);
          Swal.fire(
            "Error!",
            `${
              error.response.data.msg
                ? error.response.data.msg
                : error.message
                ? error.message
                : "Error Delete"
            }`,
            "error"
          );
        }
      };

      AlertModal.confirmation({ onConfirm: progress });
    }
  };

  const onSave = async (nextState?: String): Promise<any> => {
    setLoading(true);
    try {
      let data: any = {
        name: name.valueData,
        desc: desc,
      };
      if (nextState) {
        data.nextState = nextState;
      }

      let Action = id
        ? GetDataServer(DataAPI.ASSESMENTTEMPLATE).UPDATE({
            id: id,
            data: data,
          })
        : GetDataServer(DataAPI.ASSESMENTTEMPLATE).CREATE(data);

      const result = await Action;

      if (id) {
        getData();
        Swal.fire({ icon: "success", text: "Saved" });
      } else {
        navigate(`/assesment/template/${result.data.data._id}`);
        navigate(0);
      }
    } catch (error: any) {
      Swal.fire(
        "Error!",
        `${
          error?.response?.data?.error
            ? error.response.data.error
            : error?.response?.data?.msg
            ? error?.response?.data?.msg
            : error?.message
            ? error?.message
            : error ?? "Error Insert"
        }`,
        "error"
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      getData();
      setListMoreAction([{ name: "Delete", onClick: onDelete }]);
    } else {
      setLoading(false);
      setListMoreAction([]);
    }
  }, []);

  // Cek perubahan
  useEffect(() => {
    const actualData = {
      name: name.valueData,
      desc: desc ?? "",
    };
    if (JSON.stringify(actualData) !== JSON.stringify(prevData)) {
      setChangeData(true);
    } else {
      setChangeData(false);
    }
  }, [name, desc]);
  // End

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
                <h4
                  onClick={() => navigate("/assesment/template")}
                  className="font-bold text-lg mr-2 cursor-pointer"
                >
                  {!id ? "New template" : data.name}
                </h4>
                <div className="text-md">
                  <ButtonStatusComponent
                    // className="text-[0.7em]"
                    status={data.status ?? "0"}
                    name={data.workflowState ?? "Not Save"}
                  />
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

                {isChangeData && (
                  <IconButton
                    name={id ? "Update" : "Save"}
                    callback={() => {
                      AlertModal.confirmation({
                        onConfirm: onSave,
                        confirmButtonText: `Yes, ${
                          !id ? "Save it!" : "Update It"
                        }`,
                      });
                    }}
                    className={`opacity-80 hover:opacity-100 duration-100  `}
                  />
                )}
                {!isChangeData && id && workflow.length > 0 && (
                  <IconButton
                    name="Actions"
                    list={workflow}
                    callback={onSave}
                    className={`opacity-80 hover:opacity-100 duration-100  `}
                  />
                )}
              </div>
            </div>
            <div className=" px-5 flex flex-col ">
              <div className="border w-full flex-1  bg-white rounded-md overflow-y-scroll scrollbar-none">
                <div className="w-full h-auto  float-left rounded-md p-3 py-5">
                  <div className=" w-1/2 px-4 float-left ">
                    <InputComponent
                      mandatoy
                      label="Name"
                      value={name}
                      className="h-[38px] mb-3"
                      type="text"
                      onChange={(e) =>
                        setName({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      disabled={
                        id != null ? (status !== "Draft" ? true : false) : false
                      }
                    />

                    <InputComponent
                      label="Created By"
                      value={user}
                      className="h-[38px]  mb-3"
                      onChange={(e) =>
                        setUser({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      disabled
                    />
                    <label className="text-sm">Desc</label>
                    <textarea
                      className="border mt-1 p-2 text-[0.95em] bg-gray-50  w-full rounded-md h-[150px]"
                      name="Site Uri"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      disabled={
                        id != null ? (status !== "Draft" ? true : false) : false
                      }
                    />
                  </div>
                  <div className=" w-1/2 px-4 float-left  mb-3">
                    <InputComponent
                      label="Date"
                      value={createdAt}
                      className="h-[38px]  mb-3"
                      type="date"
                      onChange={(e) =>
                        setCreatedAt({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      disabled
                    />
                    <InputComponent
                      label="Status"
                      value={{ valueData: status, valueInput: status }}
                      className="h-[38px]  mb-3"
                      type="text"
                      onChange={(e) =>
                        setCreatedAt({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      disabled
                    />
                  </div>
                </div>
              </div>

              <ToggleBodyComponent
                name="Indicators"
                className="mt-5 mb-5"
                child={
                  <IndicatorPage data={indicators} setData={setIndicators} />
                }
              />

              <TimeLineVertical data={history} />
            </div>
          </>
        ) : (
          <LoadingComponent />
        )}
      </div>
    </>
  );
};

interface IIndicators {
  data: any[];
  setData: React.Dispatch<React.SetStateAction<any[]>>;
}

const IndicatorPage: React.FC<IIndicators> = ({ data, setData }) => {
  const [loadingNaming, setLoadingName] = useState<boolean>(true);
  const [listNaming, setListNaming] = useState<IListInput[]>([]);
  const [listMoreAction, setListMoreAction] = useState<IListIconButton[]>([]);

  const getNaming = async (): Promise<void> => {
    try {
      const result: any = await GetDataServer(DataAPI.ASSESMENTQUESTION).FIND({
        filters: [["status", "=", "1"]],
      });
      if (result.data.length > 0) {
        let listInput: IListInput[] = result.data.map((item: any) => {
          return {
            name: item.name,
            value: item._id,
          };
        });

        setListNaming(listInput);
      }
      setLoadingName(false);
    } catch (error) {
      setLoadingName(false);
    }
  };

  return (
    <table className="w-full text-left" border={1}>
      <thead>
        <tr>
          <th className=" text-center">No</th>
          <th>Question</th>
          <th className="text-center">Weight</th>
          <th className="text-center h-12"></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="text-center h-7">1</td>
          <td className="w-[90%]">
            <InputComponent
              loading={loadingNaming}
              label="Naming Series"
              value={{
                valueData: "",
                valueInput:
                  "Stock Moving  (Barang Yang Tersedia Untuk Berapa Lama)",
              }}
              className="h-[38px]"
              onChange={(e) => {}}
              onSelected={(e) => {}}
              onCLick={getNaming}
              list={listNaming}
              // mandatoy
              modalStyle="top-9 max-h-[160px]"
              // onReset={() => setNaming({ valueData: null, valueInput: "" })}

              closeIconClass="top-[13.5px]"
            />
          </td>
          <td className="">
            <input className="p-1 text-center" type="number" value={50} />
          </td>
          <td className="text-center">X</td>
        </tr>
        <tr>
          <td className="text-center h-5  "></td>
          <td className="flex">
            <input className="ml-2" type="checkbox" disabled />
            <input
              className="p-1  ml-1 flex-1"
              type="text"
              value={`Sangat Baik`}
            />
          </td>
          <td className="text-center">
            <input className="p-1 text-center" type="number" value={50} />
          </td>
          <td className="text-center">X</td>
        </tr>
        <tr>
          <td className="text-center h-5  "></td>
          <td className="flex">
            <input className="ml-2" type="checkbox" disabled />
            <input className="p-1  ml-1 flex-1" type="text" value={`Baik`} />
          </td>
          <td className="text-center">
            <input className="p-1 text-center" type="number" value={50} />
          </td>
          <td className="text-center">X</td>
        </tr>
        <tr>
          <td className="text-center h-5"></td>
          <td className="flex items-center ">
            <input className="ml-2" type="checkbox" disabled />
            <button className="ml-2 opacity-70">Add option</button>
          </td>
        </tr>
        <br />
      </tbody>
    </table>
  );
};

export default FormAssesmentTemplatePage;
