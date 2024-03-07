import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { IconButton } from "../../components/atoms";
import { LoadingComponent } from "../../components/moleculs";
import { AlertModal, LocalStorage, LocalStorageType, Meta } from "../../utils";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { IListIconButton } from "../../components/atoms/IconButton";
import Swal from "sweetalert2";
import { modalSet } from "../../redux/slices/ModalSlice";
import { useDispatch } from "react-redux";
import { Alert, Snackbar } from "@mui/material";
import { ISelectValue } from "../../components/atoms/SelectComponent";
import { divide, filter } from "lodash";

const RolePermissionManagerPage: React.FC<any> = ({ props }) => {
  let { id } = useParams();
  const [data, setData] = useState<any>({});
  const metaData = {
    title: `Role Permission Manafer - Sales App Ekatunggal`,
    description: "Halaman role permission manager - Sales web system",
  };

  const [alert, setAlert] = useState<boolean>(false);
  const navigate = useNavigate();
  const [scroll, setScroll] = useState<number>(0);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(true);
  const [listMoreAction, setListMoreAction] = useState<IListIconButton[]>([]);
  const [doc, setDoc] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const docSelectOption: ISelectValue[] = [
    { title: " Select Document Type", value: "" },
    { title: "Users", value: "users" },
    { title: "Branch", value: "branch" },
    { title: "Permission", value: "permission" },
    { title: "Customer", value: "customer" },
    { title: "Customer Group", value: "customergroup" },
    { title: "Visit", value: "visit" },
    { title: "Callsheet", value: "callsheet" },
    { title: "Contact", value: "contact" },
    { title: "Config", value: "config" },
    { title: "Naming Series", value: "namingseries" },
    { title: "User Group", value: "usergroup" },
    { title: "User Grup List", value: "usergrouplist" },
    { title: "Schedule", value: "schedule" },
    { title: "ScheduleList", value: "schedulelist" },
    { title: "Role Profile", value: "roleprofile" },
    { title: "Role List", value: "rolelist" },
    { title: "Role User", value: "roleuser" },
    { title: "Tag", value: "tag" },
    { title: "Memo", value: "memo" },
    { title: "ErpNext", value: "erp" },
    { title: "Workflow State", value: "workflowstate" },
    { title: "Workflow Action", value: "workflowaction" },
    { title: "Workflow", value: "workflow" },
    { title: "Workflow Transition", value: "workflowtransition" },
    { title: "Workflow Changer", value: "workflowchanger" },
    { title: "Topic", value: "topic" },
    { title: "Notes", value: "notes" },
    { title: "Assesment Question", value: "assesmentquestion" },
    { title: "Assesment Indicator", value: "assesmentindicator" },
    { title: "Assesment Template", value: "assesmenttemplate" },
    { title: "Assesment Schedule", value: "assesmentschedule" },
    { title: "Assesment Schedule List", value: "assesmentschedulelist" },
    { title: "Assesment Result", value: "assesmentresult" },
  ];

  const [roleSelectOption, setRoleSelectOption] = useState<ISelectValue[]>([]);

  const getData = async (filter?: {
    role: string;
    doc: string;
  }): Promise<void> => {
    try {
      let filters: [String, String, String][] = [];
      if (filter) {
        if (filter.doc !== "") {
          filters.push(["doc", "=", filter.doc]);
        }
        if (filter.role !== "") {
          filters.push(["roleprofile", "=", filter.role]);
        }
      } else {
        if (doc !== "") {
          filters.push(["doc", "=", doc]);
        }
        if (role !== "") {
          filters.push(["roleprofile", "=", role]);
        }
      }

      const result: any = await GetDataServer(DataAPI.ROLELIST).FIND({
        limit: 0,
        orderBy: { state: "createdAt", sort: -1 },
        filters,
      });
      console.log(result.data)
      setData(result.data);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      setData([]);
    }
  };

  const onDelete = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await GetDataServer(DataAPI.ROLELIST).DELETE(`${id}`);
      getData();
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

  const SetPermission = async (
    id: string,
    data: {
      name: string;
      value: boolean;
    }
  ) => {
    try {
      let up: any = {};
      up[`${data.name}`] = data.value ? 1 : 0;

      await GetDataServer(DataAPI.ROLELIST).UPDATE({
        id: id,
        data: up,
      });
      setAlert(true);
      getData();
    } catch (error: any) {
      Swal.fire(error.response.data.msg ?? "Failed, Error update permission!");
    }
  };

  const GenerateName = (name: string): string => {
    const isName = docSelectOption.filter((item) => item.value === name);
    if (isName.length > 0) {
      return isName[0].title;
    }

    return "";
  };

  const GetRole = async () => {
    try {
      const role: any = await GetDataServer(DataAPI.ROLEPROFILE).FIND({
        limit: 0,
      });
      const genOptionRole: ISelectValue[] = role.data.map(
        (item: any): ISelectValue => {
          return { title: item.name, value: item._id };
        }
      );
      setRoleSelectOption(genOptionRole);
    } catch (error: any) {
      setRoleSelectOption([]);
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

  const getStorage = async () => {
    const localParams: any = await JSON.parse(
      LocalStorage.loadData(LocalStorageType.FILTERROLEMANAGER) ?? "{}"
    );
    if (localParams) {
      if (localParams.role) {
        GetRole();
        setRole(localParams.role);
      }
      setDoc(localParams.doc);

      getData({ doc: localParams.doc, role: localParams.role });
    }
  };

  useEffect(() => {
    getStorage();
  }, []);

  return (
    <>
      {Meta(metaData)}
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
                  onClick={() => navigate("/roleprofile")}
                  className="font-bold text-lg mr-2 cursor-pointer"
                >
                  Role Profile Manager
                </h4>
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

                <IconButton
                  name="Add New Rule"
                  callback={() => {
                    dispatch(
                      modalSet({
                        active: true,
                        Children: FormPermission,
                        title: "Form Role Permission",
                        props: {
                          getData: getData,
                          role: role,
                        },
                        className: "",
                      })
                    );
                  }}
                  className={`opacity-80 hover:opacity-100 duration-100  `}
                />
              </div>
            </div>
            <div className=" px-5 flex flex-col ">
              <div className="border w-full flex-1  bg-white rounded-md overflow-y-scroll scrollbar-none">
                <div className="w-full h-auto  float-left rounded-md  py-2">
                  <div className="py-3 w-full border-b border-gray-100 float-left px-3 text-[0.95em]">
                    <select
                      value={doc}
                      name="doc"
                      onChange={(e) => {
                        setLoading(true);
                        getData({ doc: e.target.value, role: role });
                        setDoc(e.target.value);
                        LocalStorage.saveData(
                          LocalStorageType.FILTERROLEMANAGER,
                          JSON.stringify({
                            doc: e.target.value,
                            role: role,
                          })
                        );
                      }}
                      className="w-[230px] border border-gray-200 bg-[#f4f5f7] rounded-md py-[2px] px-2 text-sm"
                    >
                      {docSelectOption
                        .sort((a, b) => {
                          const titleA = a.title.toUpperCase();
                          const titleB = b.title.toUpperCase();

                          if (titleA < titleB) {
                            return -1;
                          }
                          if (titleA > titleB) {
                            return 1;
                          }

                          return 0;
                        })
                        .map((item: ISelectValue, index: number) => (
                          <option value={item.value} key={index}>
                            {item.title}
                          </option>
                        ))}
                    </select>
                    <select
                      onClick={() => GetRole()}
                      value={role}
                      name="role"
                      onChange={(e) => {
                        setLoading(true);
                        getData({ role: e.target.value, doc: doc });
                        setRole(e.target.value);
                        LocalStorage.saveData(
                          LocalStorageType.FILTERROLEMANAGER,
                          JSON.stringify({
                            doc: doc,
                            role: e.target.value,
                          })
                        );
                      }}
                      className="w-[230px] ml-2 border border-gray-200 bg-[#f4f5f7] rounded-md py-[2px] px-2 text-sm"
                    >
                      <option value="">Select Role</option>
                      {roleSelectOption
                        .sort((a, b) => {
                          const titleA = a.title.toUpperCase();
                          const titleB = b.title.toUpperCase();

                          if (titleA < titleB) {
                            return -1;
                          }
                          if (titleA > titleB) {
                            return 1;
                          }

                          return 0;
                        })
                        .map((item: ISelectValue, index: number) => (
                          <option key={index} value={item.value}>
                            {item.title}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                {role === "" && doc === "" ? (
                  <div className=" w-full  float-left flex items-center justify-center py-40 text-gray-500">
                    Select Document Type or Role to start.
                  </div>
                ) : data.length > 0 ? (
                  <table className="w-[98%] ml-[1%] text-left mb-3 border-collapse">
                    <thead>
                      <tr className="bg-gray-100 ">
                        <th className="w-[20%] px-3 py-3 rounded-tl-md rounded-bl-md">
                          Document Type
                        </th>
                        <th className="w-[20%]">Role</th>
                        <th className="w-[50%]">Permission</th>
                        <th className="w-[10%] px-3 rounded-tr-md rounded-br-md "></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item: any, index: number) => (
                        <tr
                          className="border-b border-gray-100 border-collapse"
                          key={index}
                        >
                          <td className="px-3 py-8 align-top">
                            {GenerateName(item.doc)}
                          </td>
                          <td className="align-top  py-8">
                            {item.roleprofile.name}
                          </td>
                          <td className="align-top  py-8">
                            <div className="w-full flex text-[0.95em]">
                              <ul className="flex-1">
                                <li className="flex items-center mb-4">
                                  <input
                                    id={`create${item.doc}${item.roleprofile._id}`}
                                    checked={item.create == "1" ? true : false}
                                    type="checkbox"
                                    name="create"
                                    className="mr-1 mt-1"
                                    onChange={(e) => {
                                      SetPermission(item._id, {
                                        name: e.target.name,
                                        value: e.target.checked,
                                      });
                                    }}
                                  />
                                  <label
                                    htmlFor={`create${item.doc}${item.roleprofile._id}`}
                                  >
                                    Create
                                  </label>
                                </li>
                                <li className="flex items-center mb-4">
                                  <input
                                    id={`submit${item.doc}${item.roleprofile._id}`}
                                    checked={item.submit == "1" ? true : false}
                                    type="checkbox"
                                    name="submit"
                                    className="mr-1 mt-1"
                                    onChange={(e) => {
                                      SetPermission(item._id, {
                                        name: e.target.name,
                                        value: e.target.checked,
                                      });
                                    }}
                                  />
                                  <label
                                    htmlFor={`submit${item.doc}${item.roleprofile._id}`}
                                  >
                                    Submit
                                  </label>
                                </li>
                                <li className="flex items-center mb-4">
                                  <input
                                    id={`amend${item.doc}${item.roleprofile._id}`}
                                    checked={item.amend == "1" ? true : false}
                                    type="checkbox"
                                    name="amend"
                                    className="mr-1 mt-1"
                                    onChange={(e) => {
                                      SetPermission(item._id, {
                                        name: e.target.name,
                                        value: e.target.checked,
                                      });
                                    }}
                                  />
                                  <label
                                    htmlFor={`amend${item.doc}${item.roleprofile._id}`}
                                  >
                                    Amend
                                  </label>
                                </li>
                              </ul>
                              <ul className="flex-1">
                                <li className="flex items-center mb-4">
                                  <input
                                    id={`read${item.doc}${item.roleprofile._id}`}
                                    checked={item.read == "1" ? true : false}
                                    type="checkbox"
                                    name="read"
                                    className="mr-1 mt-1"
                                    onChange={(e) => {
                                      SetPermission(item._id, {
                                        name: e.target.name,
                                        value: e.target.checked,
                                      });
                                    }}
                                  />
                                  <label
                                    htmlFor={`read${item.doc}${item.roleprofile._id}`}
                                  >
                                    Read
                                  </label>
                                </li>
                                <li className="flex items-center mb-4">
                                  <input
                                    id={`export${item.doc}${item.roleprofile._id}`}
                                    checked={item.export == "1" ? true : false}
                                    type="checkbox"
                                    name="export"
                                    className="mr-1 mt-1"
                                    onChange={(e) => {
                                      SetPermission(item._id, {
                                        name: e.target.name,
                                        value: e.target.checked,
                                      });
                                    }}
                                  />
                                  <label
                                    htmlFor={`export${item.doc}${item.roleprofile._id}`}
                                  >
                                    Export
                                  </label>
                                </li>
                                <li className="flex items-center mb-4">
                                  <input
                                    id={`report${item.doc}${item.roleprofile._id}`}
                                    checked={item.report == "1" ? true : false}
                                    type="checkbox"
                                    name="report"
                                    className="mr-1 mt-1"
                                    onChange={(e) => {
                                      SetPermission(item._id, {
                                        name: e.target.name,
                                        value: e.target.checked,
                                      });
                                    }}
                                  />
                                  <label
                                    htmlFor={`report${item.doc}${item.roleprofile._id}`}
                                  >
                                    Report
                                  </label>
                                </li>
                              </ul>
                              <ul className="flex-1">
                                <li className="flex items-center mb-4">
                                  <input
                                    id={`update${item.doc}${item.roleprofile._id}`}
                                    checked={item.update == "1" ? true : false}
                                    type="checkbox"
                                    name="update"
                                    className="mr-1 mt-1"
                                    onChange={(e) => {
                                      SetPermission(item._id, {
                                        name: e.target.name,
                                        value: e.target.checked,
                                      });
                                    }}
                                  />
                                  <label
                                    htmlFor={`update${item.doc}${item.roleprofile._id}`}
                                  >
                                    Update
                                  </label>
                                </li>
                                <li className="flex items-center mb-4">
                                  <input
                                    id={`delete${item.doc}${item.roleprofile._id}`}
                                    checked={item.delete == "1" ? true : false}
                                    type="checkbox"
                                    name="delete"
                                    className="mr-1 mt-1"
                                    onChange={(e) => {
                                      SetPermission(item._id, {
                                        name: e.target.name,
                                        value: e.target.checked,
                                      });
                                    }}
                                  />
                                  <label
                                    htmlFor={`delete${item.doc}${item.roleprofile._id}`}
                                  >
                                    Delete
                                  </label>
                                </li>
                              </ul>
                            </div>
                          </td>
                          <td className="px-3 align-top  py-8">
                            <button
                              className="border bg-[#eb645e] rounded-md flex p-[4px]  hover:bg-[#c4534d] duration-300"
                              onClick={(e) =>
                                AlertModal.confirmation({
                                  onConfirm: () => onDelete(item._id),
                                })
                              }
                            >
                              <DeleteForeverIcon
                                style={{ fontSize: 18 }}
                                className="text-white items-center justify-center"
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className=" w-full  float-left flex items-center justify-center py-40 text-gray-500">
                    No Permissions set for this criteria.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <LoadingComponent />
        )}
      </div>
    </>
  );
};

const FormPermission: React.FC<any> = ({ props }) => {
  const [doc, setDoc] = useState<string>("");
  const dispatch = useDispatch();
  const [role, setRole] = useState<string>(props.role ?? "");
  const [valid, setValid] = useState<boolean>(false);
  const [roleList, setRoleList] = useState<ISelectValue[]>([]);
  const docList: ISelectValue[] = [
    { title: "Users", value: "users" },
    { title: "Branch", value: "branch" },
    { title: "Permission", value: "permission" },
    { title: "Customer", value: "customer" },
    { title: "Customer Group", value: "customergroup" },
    { title: "Visit", value: "visit" },
    { title: "Callsheet", value: "callsheet" },
    { title: "Contact", value: "contact" },
    { title: "Config", value: "config" },
    { title: "Naming Series", value: "namingseries" },
    { title: "User Group", value: "usergroup" },
    { title: "User Grup List", value: "usergrouplist" },
    { title: "Schedule", value: "schedule" },
    { title: "ScheduleList", value: "schedulelist" },
    { title: "Role Profile", value: "roleprofile" },
    { title: "Role List", value: "rolelist" },
    { title: "Role User", value: "roleuser" },
    { title: "Tag", value: "tag" },
    { title: "Memo", value: "memo" },
    { title: "ErpNext", value: "erp" },
    { title: "Workflow State", value: "workflowstate" },
    { title: "Workflow Action", value: "workflowaction" },
    { title: "Workflow", value: "workflow" },
    { title: "Workflow Transition", value: "workflowtransition" },
    { title: "Workflow Changer", value: "workflowchanger" },
    { title: "Topic", value: "topic" },
    { title: "Notes", value: "notes" },
    { title: "Assesment Question", value: "assesmentquestion" },
    { title: "Assesment Indicator", value: "assesmentindicator" },
    { title: "Assesment Template", value: "assesmenttemplate" },
    { title: "Assesment Schedule", value: "assesmentschedule" },
    { title: "Assesment Schedule List", value: "assesmentschedulelist" },
    { title: "Assesment Result", value: "assesmentresult" },
  ];

  const GetRole = async () => {
    try {
      const response: any = await GetDataServer(DataAPI.ROLEPROFILE).FIND({
        limit: 0,
      });
      const gen: ISelectValue[] = response.data.map(
        (item: any): ISelectValue => {
          return { title: item.name, value: item._id };
        }
      );
      setRoleList(gen);
    } catch (error) {
      setRoleList([]);
    }
  };

  const onSave = async () => {
    try {
      await GetDataServer(DataAPI.ROLELIST).CREATE({
        roleprofile: role,
        doc: doc,
      });
      dispatch(
        modalSet({
          active: false,
          Children: null,
          title: "",
          props: {},
          className: "",
        })
      );
      props.getData();
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
  };

  useEffect(() => {
    if (role !== "" && doc !== "") {
      setValid(true);
    } else {
      setValid(false);
    }
  }, [role, doc]);

  useEffect(() => {
    GetRole();
  }, []);

  return (
    <div className="w-[530px] py-3 px-6 pb-10">
      <h3 className="border-b font-semibold py-2 border-gray-100 flex items-center justify-between">
        Add New Permission Rule
      </h3>
      <section className="mt-2 mb-2">
        <label className="block text-[0.9em]">Document Type</label>
        <select
          value={doc}
          className="w-full bg-gray-100 p-2 border border-gray-200 mt-2 text-sm rounded-md"
          name="Doc"
          onChange={(e) => setDoc(e.target.value)}
        >
          <option value="">Select Doc</option>
          {docList
            .sort((a, b) => {
              const titleA = a.title.toUpperCase();
              const titleB = b.title.toUpperCase();

              if (titleA < titleB) {
                return -1;
              }
              if (titleA > titleB) {
                return 1;
              }

              return 0;
            })
            .map((item: ISelectValue, index) => {
              return (
                <option key={index} value={item.value}>
                  {item.title}
                </option>
              );
            })}
        </select>
      </section>
      <section className="mb-2">
        <label className="block text-[0.9em]">Role</label>
        <select
          className="w-full bg-gray-100 p-2 text-sm border border-gray-200 mt-2 rounded-md"
          name="Role"
          onClick={() => GetRole()}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select Role</option>
          {roleList
            .sort((a, b) => {
              const titleA = a.title.toUpperCase();
              const titleB = b.title.toUpperCase();

              if (titleA < titleB) {
                return -1;
              }
              if (titleA > titleB) {
                return 1;
              }

              return 0;
            })
            .map((item: ISelectValue, index) => {
              return (
                <option key={index} value={item.value}>
                  {item.title}
                </option>
              );
            })}
        </select>
      </section>
      {valid && (
        <button
          onClick={() => {
            AlertModal.confirmation({
              confirmButtonText: "Yes, Save",
              onConfirm: () => onSave(),
            });
          }}
          className="opacity-80 hover:opacity-100 duration-200 float-right border rounded-md px-2 py-[4px] mt-3 mb-5 text-sm bg-[#2490f0] text-white"
        >
          Add
        </button>
      )}
    </div>
  );
};

export default RolePermissionManagerPage;
