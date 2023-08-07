import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
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
import { IValue } from "../../components/atoms/InputComponent";
import { LoadingComponent } from "../../components/moleculs";
import moment from "moment";
import { AlertModal, FetchApi, Meta } from "../../utils";
import { IListIconButton } from "../../components/atoms/IconButton";
import ConnectionsUser, { IConnectionComponent } from "./ConnectionsUser";
import ProfileImg from "../../assets/images/iconuser.jpg";
import Swal from "sweetalert2";
import { Alert, Snackbar } from "@mui/material";

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
  const dataStatus: any[] = [
    { title: "Enabled", value: "1" },
    { title: "Disabled", value: "0" },
  ];

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
  const [status, setStatus] = useState<string>("0");

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

  const browseRef = useRef<HTMLInputElement>(null);

  const [img, setImg] = useState<any>(ProfileImg);

  const [password, setPassword] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [file, setFile] = useState<File>();

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
              onSave(item.nextState.id);
            },
          };
        });

        setWorkflow(isWorkflow);
      }
      // end

      setName({ valueData: result.data.name, valueInput: result.data.name });
      setUserName({
        valueData: result.data.username,
        valueInput: result.data.username,
      });
      setEmail({
        valueData: result.data.email ?? "",
        valueInput: result.data.email ?? "",
      });
      setPhone({
        valueData: result.data.phone ?? "",
        valueInput: result.data.phone ?? "",
      });
      setErpSite({
        valueData: result.data.ErpSite ?? "",
        valueInput: result.data.ErpSite ?? "",
      });
      setErpToken({
        valueData: result.data.ErpToken ?? "",
        valueInput: result.data.ErpToken ?? "",
      });
      setStatus(result.data.status);

      if (result.data.img) {
        setImg(
          `${import.meta.env.VITE_PUBLIC_URI}/images/users/${result.data.img}`
        );
      }

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

      //   navigate("/users");
    }
  };

  const onDelete = (): void => {
    if (id) {
      const progress = async (): Promise<void> => {
        setLoading(true);
        try {
          await GetDataServer(DataAPI.USERS).DELETE(`${id}`);
          navigate("/users");
        } catch (error: any) {
          Swal.fire(
            "Error!",
            `${
              error.response.status === 403
                ? "Access Denied"
                : error.response.data.msg ?? "Error Delete"
            }`,
            "error"
          );
          setLoading(false);
        }
      };

      AlertModal.confirmation({ onConfirm: progress });
    }
  };

  const imageHandler = (e: any) => {
    const reader: any = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setImg(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
    setFile(e.target.files[0]);
  };

  const onSave = async (nextStateId?: String): Promise<void> => {
    const inData = new FormData();

    file && inData.append("imgfile", file);

    if (nextStateId) {
      inData.append("nextState", `${nextStateId}`);
    }
    inData.append("name", name.valueData);
    inData.append("username", username.valueData);
    inData.append("email", email.valueData);
    inData.append("phone", phone.valueData);
    password.valueData && inData.append("password", password.valueData);
    inData.append("ErpToken", erpToken.valueData ?? "");
    inData.append("ErpSite", erpSite.valueData ?? "");
    inData.append("status", status);
    inData.append("workflowState", status === "0" ? "Disabled" : "Enabled");

    let response: any;
    if (id) {
      setLoading(true);
      try {
        response = await FetchApi.put(
          `${import.meta.env.VITE_PUBLIC_URI}/users/${id}`,
          inData
        );

        if (response.data.status === 200) {
          Swal.fire("Success!", `Data updated successfully`, "success");
          getData();
          if (file) {
            navigate(0);
          }
        } else {
          throw response.data.msg;
        }
      } catch (error: any) {
        Swal.fire(
          "Error!",
          `${
            error.response.status === 403
              ? "Access Denied"
              : error.response.data.msg ?? "Error update"
          }`,
          error
        );
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        response = await FetchApi.post(
          `${import.meta.env.VITE_PUBLIC_URI}/users`,
          inData
        );
        if (response.data.status) {
          Swal.fire("Success!", `Data saved successfully`, "success");

          if (response.data.status !== 200) {
            throw response.data.msg;
          }

          navigate(`/user/${response.data.data._id}`);

          navigate(0);
        } else {
          Swal.fire("error!", `Check your data!`, "error");
        }
      } catch (error: any) {
        Swal.fire(
          "Error!",
          `${
            error.response.status === 403
              ? "Access Denied"
              : error.response.data.msg ?? "Error Insert"
          }`,
          "error"
        );
        setLoading(false);
      }
    }
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

                {/* {isChangeData && ( */}
                <IconButton
                  name={id ? "Update" : "Save"}
                  callback={onSave}
                  className={`opacity-80 hover:opacity-100 duration-100  `}
                />
                {/* )} */}
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
              {id && (
                <ToggleBodyComponent
                  name="Connections"
                  className="mt-5 mb-5"
                  child={<ConnectionsUser data={connectionData} />}
                />
              )}

              <ToggleBodyComponent
                name="Data"
                child={
                  <div className="flex">
                    <div className="mr-8 flex flex-col">
                      <img
                        crossOrigin="anonymous"
                        className="relative  object-contain mt-1 border shadow-sm w-[280px] h-[280px] rounded-md"
                        src={img}
                        alt={"pp"}
                        onError={(e: any) => {
                          e.target.src = ProfileImg;
                        }}
                      />
                      <input
                        onChange={(e) => imageHandler(e)}
                        type="file"
                        name="image"
                        className="border  w-[280px] mt-1 text-sm"
                        accept="image/*"
                        ref={browseRef}
                      />
                    </div>
                    <div className="flex-1 flex">
                      <div className="flex-1 mr-6">
                        <InputComponent
                          mandatoy
                          label="Name"
                          value={name}
                          onChange={(e) =>
                            setName({ valueData: e, valueInput: e })
                          }
                          type="text"
                          //   disabled={disabled}

                          className={`h-9 mb-3`}
                        />
                        <InputComponent
                          mandatoy
                          label="Username"
                          value={username}
                          onChange={(e) =>
                            setUserName({ valueData: e, valueInput: e })
                          }
                          type="text"
                          //   disabled={disabled}
                          className={`h-9 mb-3`}
                        />
                        <InputComponent
                          label="Phone"
                          value={phone}
                          onChange={(e) =>
                            setPhone({ valueData: e, valueInput: e })
                          }
                          type="text"
                          //   disabled={disabled}
                          className={`h-9 mb-3`}
                        />
                      </div>
                      <div className="flex-1">
                        <InputComponent
                          label="Email"
                          value={email}
                          onChange={(e) =>
                            setEmail({ valueData: e, valueInput: e })
                          }
                          type="text"
                          //   disabled={disabled}
                          className={`h-9 mb-3`}
                        />
                        <Select
                          title="Status"
                          data={dataStatus}
                          value={status}
                          setValue={setStatus}
                          ClassName={`h-9`}
                        />
                        <InputComponent
                          label="Password"
                          value={password}
                          onChange={(e) =>
                            setPassword({ valueData: e, valueInput: e })
                          }
                          type="password"
                          //   disabled={disabled}
                          remark="*Only filled if you want to change the previous password"
                          className={`h-9 mb-3`}
                        />
                      </div>
                    </div>
                  </div>
                }
              />
              <ToggleBodyComponent
                name="Erpnext Sync"
                className="mt-5"
                child={
                  <div className="flex ">
                    <li className="flex-1 px-2 list-none">
                      <label className="text-sm">Uri : </label>
                      <textarea
                        className="border mt-1 p-2 text-[0.95em] bg-gray-100  w-full rounded-md"
                        name="Site Uri"
                        value={erpSite.valueData}
                        onChange={(e) =>
                          setErpSite({
                            valueData: e.target.value,
                            valueInput: e.target.value,
                          })
                        }
                      />
                      <h4 className="italic text-[0.8em] text-gray-700">
                        *Uri of the erpnext system so that it is connected to
                        the erp data ex: etm.digitalasiasolusindo.com
                      </h4>
                    </li>
                    <li className="flex-1 px-2 list-none">
                      <label className="text-sm">Token : </label>
                      <textarea
                        className="border mt-1 p-2 text-[0.95em] bg-gray-100  w-full rounded-md"
                        name="Site Uri"
                        value={erpToken.valueData}
                        onChange={(e) =>
                          setErpToken({
                            valueData: e.target.value,
                            valueInput: e.target.value,
                          })
                        }
                      />
                      <h4 className="italic text-[0.8em] text-gray-700">
                        *Get from user token in erpnext system
                      </h4>
                    </li>
                  </div>
                }
              />
              {id && (
                <ToggleBodyComponent
                  name="Role Profiles"
                  className="mt-5"
                  child={<RoleContent id={id} />}
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

const RoleContent: React.FC<any> = ({ id }) => {
  const [roleP, setRoleP] = useState<any[]>([]);
  const [alert, setAlert] = useState<boolean>(false);

  const getRole = async (): Promise<void> => {
    try {
      const roleProfile: any = await GetDataServer(DataAPI.ROLEPROFILE).FIND({
        fields: ["name"],
        filters: [["status", "=", "1"]],
      });
      if (roleProfile.data.length > 0) {
        const setRole = await roleProfile.data.map(async (i: any) => {
          let cekIsSet: any = await GetDataServer(DataAPI.ROLEUSER).FIND({
            limit: 1,
            fields: ["_id"],
            filters: [
              ["roleprofile", "=", i._id],
              ["user", "=", id],
            ],
          });
          return {
            ...i,
            roleUserId: cekIsSet.data.length > 0 ? cekIsSet.data[0]._id : null,
          };
        });

        const data = await Promise.all(setRole);
        setRoleP(data);
      }
    } catch (error) {
      // console.log(error);
    }
  };

  const ChangeAction = async (
    id_profile: number,
    roleUserId: string
  ): Promise<void> => {
    if (roleUserId) {
      try {
        const deleteRoleUser: any = await GetDataServer(
          DataAPI.ROLEUSER
        ).DELETE(roleUserId);
        if (deleteRoleUser.status != 200) {
          throw new Error(deleteRoleUser.response.data.msg);
        }
        setAlert(true);
        getRole();
      } catch (error: any) {
        Swal.fire(error.response.data.msg ?? "Failed, Error update roleuser");
      }
    } else {
      try {
        const result = await GetDataServer(DataAPI.ROLEUSER).CREATE({
          roleprofile: id_profile,
          user: id,
        });
        if (result.data.status === 200) {
          setAlert(true);
          getRole();
        } else {
          Swal.fire("Failed!", `Check Your Connection!`, "error");
        }
      } catch (error: any) {
        Swal.fire(error.response.data.msg ?? "Failed, Error update roleuser");
      }
    }
  };

  useEffect(() => {
    getRole();
  }, []);

  return (
    <>
      {alert && (
        <Snackbar
          open={true}
          autoHideDuration={1500}
          onClose={() => setAlert(false)}
          message="Note archived"
        >
          <Alert severity="success" sx={{ width: "100%" }}>
            Permission updated!
          </Alert>
        </Snackbar>
      )}
      <div className=" w-full float-left">
        {roleP.map((i: any, index: number) => {
          return (
            <div
              key={index}
              className="float-left w-1/3 flex items-center mb-2  "
            >
              <input
                onChange={() => ChangeAction(i._id, i.roleUserId)}
                checked={i.roleUserId ? true : false}
                type="checkbox"
                className="mr-1 h-3 w-3 mt-[1.5px]"
              />
              <h4 className="text-sm">{i.name}</h4>
            </div>
          );
        })}
        {roleP.length === 0 && (
          <h4 className="text-center text-sm text-gray-300">No Data</h4>
        )}
      </div>
    </>
  );
};
