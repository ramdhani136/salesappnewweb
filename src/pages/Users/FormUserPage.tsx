import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  ButtonStatusComponent,
  IconButton,
  InputComponent,
  Select,
  TimeLineVertical,
  ToggleBodyComponent,
} from "../../components/atoms";
import { IListInput, IValue } from "../../components/atoms/InputComponent";
import { LoadingComponent } from "../../components/moleculs";
import moment from "moment";
import { AlertModal, Meta } from "../../utils";
import { IListIconButton } from "../../components/atoms/IconButton";
import NotesPage from "../notes/NotesPage";
import ConnectionsUser, { IConnectionComponent } from "./ConnectionsUser";

const FormUserPage: React.FC = () => {
  const metaData = {
    title: "New User - Sales App Ekatunggal",
    description: "Halaman form User sales web system",
  };

  const navigate = useNavigate();
  let { id } = useParams();

  const [data, setData] = useState<any>({});
  const [scroll, setScroll] = useState<number>(0);
  const [workflow, setWorkflow] = useState<IListIconButton[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isChangeData, setChangeData] = useState<boolean>(false);
  const [prevData, setPrevData] = useState<any>({});

  const [connectionData, setConnectionData] = useState<IConnectionComponent[]>([
    {
      title: "Activity",
      data: [
        {
          title: "Visits",
          count: 0,
          onTitle: () => navigate("/visit"),
          onAdd: () => alert("This feature only supports the mobile version"),
        },
        {
          title: "Callsheets",
          count: 0,
          onTitle: () => navigate("/callsheet"),
          onAdd: () => navigate("/callsheet/create"),
        },
      ],
    },
    {
      title: "Settings",
      data: [
        {
          title: "User Permissions",
          count: 0,
          onTitle: () => {
            navigate("/permission-user");
          },
          onAdd: () => navigate("/permission-user/create"),
        },
      ],
    },
  ]);

  const [name, setName] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [username, setUserName] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [email, setEmail] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [phone, setPhone] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [erpSite, setErpSite] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [erpToken, setErpToken] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [img, setImg] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [password, setPassword] = useState<IValue>({
    valueData: "",
    valueInput: "",
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
      const result = await GetDataServer(DataAPI.USERS).FINDONE(`${id}`);

      // set workflow
      if (result.workflow.length > 0) {
        const isWorkflow = result.workflow.map((item: any): IListIconButton => {
          return {
            name: item.action,
            onClick: () => {
              onSave({
                nextState: item.nextState.id,
              });
            },
          };
        });

        setWorkflow(isWorkflow);
      }
      // end

      setHistory(result.history);

      setData(result.data);

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      AlertModal.Default({
        icon: "error",
        title: "Error",
        text: "Data not found!",
      });

      navigate("/users");
    }
  };

  const onDelete = (): void => {
    if (id) {
      const progress = async (): Promise<void> => {
        setLoading(true);
        try {
          await GetDataServer(DataAPI.USERS).DELETE(`${id}`);
          navigate("/users");
        } catch (error) {
          console.log(error);
        }
      };

      AlertModal.confirmation({ onConfirm: progress });
    }
  };

  const onSave = async (data: {}): Promise<any> => {
    // const progress = async (): Promise<void> => {
    //   if (allow.barcode === false && allow.manual === false) {
    //     AlertModal.Default({
    //       icon: "error",
    //       title: "Error",
    //       text: "Allow required",
    //     });
    //     return;
    //   }
    //   try {
    //     setLoading(true);
    //     let result: any;
    //     if (!id) {
    //       result = await GetDataServer(DataAPI.CALLSHEET).CREATE({
    //         startDate: startDate.valueData,
    //         dueDate: dueDate.valueData,
    //         workflowState: "Draft",
    //         status: "0",
    //         warehouse: warehouse.valueData,
    //         allow: allow,
    //       });
    //       navigate(`/callsheet/${result.data.data.name}`);
    //       navigate(0);
    //     } else {
    //       result = await GetDataServer(DataAPI.CALLSHEET).UPDATE({
    //         id: id,
    //         data: !data
    //           ? {
    //               startDate: startDate.valueData,
    //               dueDate: dueDate.valueData,
    //               allow: allow,
    //             }
    //           : data,
    //       });
    //       getData();
    //     }
    //   } catch (error: any) {
    //     AlertModal.Default({
    //       icon: "error",
    //       title: "Error",
    //       text: error.response.data.msg ?? "Error Network",
    //     });
    //     setLoading(false);
    //   }
    // };
    // AlertModal.confirmation({
    //   onConfirm: progress,
    //   text: "You want to save this data!",
    //   confirmButtonText: "Yes, Save it",
    // });
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
                  onClick={() => navigate("/users")}
                  className="font-bold text-lg mr-2 cursor-pointer"
                >
                  {!id ? "New User" : data.name}
                </h4>
                <div className="text-[0.9em]">
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
                    callback={onSave}
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
              <ToggleBodyComponent
                name="Connections"
                className="mt-5 mb-5"
                child={<ConnectionsUser data={connectionData} />}
              />

              <div className="border w-full flex-1  bg-white rounded-md overflow-y-scroll scrollbar-none">
                <div className="w-full h-auto  float-left rounded-md p-3 py-5">
                  <div className=" w-1/2 px-4 float-left ">
                    <InputComponent
                      label="Created By"
                      value={name}
                      className="h-[38px]   text-[0.93em] mb-3"
                      onChange={(e) =>
                        setName({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      disabled
                    />
                  </div>
                  <div className=" w-1/2 px-4 float-left  mb-3">
                    <InputComponent
                      label="Created By"
                      value={name}
                      className="h-[38px]   text-[0.93em] mb-3"
                      onChange={(e) =>
                        setName({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      disabled
                    />
                    <InputComponent
                      label="Date"
                      value={createdAt}
                      className="h-[38px]  text-[0.93em] mb-3"
                      type="date"
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
              {id && (
                <ToggleBodyComponent
                  name="Result"
                  className="mt-5"
                  child={<NotesPage props={[]} />}
                />
              )}
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

export default FormUserPage;
