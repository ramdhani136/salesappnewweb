import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ProfileImg from "../../assets/images/iconuser.jpg";
import {
  ButtonStatusComponent,
  IconButton,
  InputComponent,
  Select,
  TimeLineVertical,
} from "../../components/atoms";
import { IListInput, IValue } from "../../components/atoms/InputComponent";
import { LoadingComponent } from "../../components/moleculs";
import moment from "moment";
import { AlertModal, LocalStorage, Meta } from "../../utils";

import { IListIconButton } from "../../components/atoms/IconButton";
import Swal from "sweetalert2";

const FormCustomerPage: React.FC = () => {
  let { id } = useParams();
  const [data, setData] = useState<any>({});
  const metaData = {
    title: `${id ? data.name : "New Customer"} - Sales App Ekatunggal`,
    description: "Halaman form Customer Sales web system",
  };

  const navigate = useNavigate();

  const [scroll, setScroll] = useState<number>(0);
  const [workflow, setWorkflow] = useState<IListIconButton[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isChangeData, setChangeData] = useState<boolean>(false);
  const dataType: any[] = [
    { title: "Individual", value: "Individual" },
    { title: "Company", value: "Company" },
  ];
  const [type, setType] = useState<string>("Company");
  const browseRef = useRef<HTMLInputElement>(null);
  const [img, setImg] = useState<any>(ProfileImg);
  const [file, setFile] = useState<File>();
  // branch
  const [branchList, setBranchList] = useState<IListInput[]>([]);
  const [branchPage, setBranchPage] = useState<Number>(1);
  const [branchLoading, setBranchLoading] = useState<boolean>(true);
  const [branchMoreLoading, setBranchMoreLoading] = useState<boolean>(false);
  const [branchHasMore, setBranchHasMore] = useState<boolean>(false);
  const [branch, setBranch] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  // End

  // group
  const [groupList, setGroupList] = useState<IListInput[]>([]);
  const [groupPage, setGroupPage] = useState<Number>(1);
  const [groupLoading, setGroupLoading] = useState<boolean>(true);
  const [GroupMoreLoading, setGroupMoreLoading] = useState<boolean>(false);
  const [groupHasMore, setGroupHasMore] = useState<boolean>(false);
  const [group, setGroup] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  // End

  const [user, setUser] = useState<IValue>({
    valueData: LocalStorage.getUser()._id,
    valueInput: LocalStorage.getUser().name,
  });
  const [name, setName] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [lat, setLat] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [lng, setLng] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [erpId, setErpId] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [address, setAddress] = useState<string>("");

  const [status, setStatus] = useState<String>("Draft");
  const [prevData, setPrevData] = useState<any>({
    name: name.valueData,
    type: type,
    branch: branch.valueData,
    group: group.valueData,
    img: img,
    address: address,
    erpId: erpId.valueData,
    lat: lat.valueData,
    lng: lng.valueData,
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
      const result = await GetDataServer(DataAPI.CUSTOMER).FINDONE(`${id}`);

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
      if (result.data.erpId) {
        setErpId({
          valueData: result.data.erpId,
          valueInput: result.data.erpId,
        });
      }
      setAddress(result.data.address);
      setBranch({
        valueData: result.data.branch._id,
        valueInput: result.data.branch.name,
      });
      setGroup({
        valueData: result.data.customerGroup._id,
        valueInput: result.data.customerGroup.name,
      });
      setUser({
        valueData: result.data.createdBy._id,
        valueInput: result.data.createdBy.name,
      });
      setCreatedAt({
        valueData: moment(result.data.createdAt).format("YYYY-MM-DD"),
        valueInput: moment(result.data.createdAt).format("YYYY-MM-DD"),
      });

      if (result.data.location) {
        setLat({
          valueData: result.data.location.coordinates[1],
          valueInput: result.data.location.coordinates[1],
        });
        setLng({
          valueData: result.data.location.coordinates[0],
          valueInput: result.data.location.coordinates[0],
        });
      }

      if (result.data.img) {
        setImg(
          `${import.meta.env.VITE_PUBLIC_URI}/public/customer/${
            result.data.img
          }`
        );
      }

      setData(result.data);

      setType(result.data.type);

      setPrevData({
        name: result.data.name,
        type: result.data.type,
        branch: result.data.branch._id,
        group: result.data.customerGroup._id,
        img: result.data.img
          ? `${import.meta.env.VITE_PUBLIC_URI}/public/customer/${
              result.data.img
            }`
          : ProfileImg,
        address: result.data.address,
        erpId: result.data.erpId ?? "",
        lat: result.data.location ? result.data.location.coordinates[1] : "",
        lng: result.data.location ? result.data.location.coordinates[0] : "",
      });

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

      navigate("/customer");
    }
  };

  const onDelete = (): void => {
    if (id) {
      const progress = async (): Promise<void> => {
        setLoading(true);
        try {
          await GetDataServer(DataAPI.CUSTOMER).DELETE(`${id}`);
          navigate("/customer");
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

  const getGroup = async (search?: string): Promise<void> => {
    try {
      if (!groupLoading) {
        setGroupMoreLoading(true);
      } else {
        setGroupMoreLoading(false);
      }

      let filters: any = [
        ["branch._id", "=", branch.valueData],
        ["status", "=", "1"],
      ];

      const result: any = await GetDataServer(DataAPI.GROUP).FIND({
        search: search ?? "",
        limit: 10,
        page: `${groupPage}`,
        filters: filters,
      });
      if (result.data.length > 0) {
        let listInput: IListInput[] = result.data.map((item: any) => {
          return {
            name: item.name,
            value: item._id,
          };
        });
        setGroupList([...groupList, ...listInput]);
        setGroupHasMore(result.hasMore);
        setGroupPage(result.nextPage);
      }

      setGroupLoading(false);
      setGroupMoreLoading(false);
    } catch (error: any) {
      setGroupLoading(false);
      setGroupMoreLoading(false);
      setGroupHasMore(false);
    }
  };

  const ResetGroup = () => {
    setGroupList([]);
    setGroupHasMore(false);
    setGroupPage(1);
    setGroupLoading(true);
  };

  const getBranch = async (data: {
    search?: string | String;
    refresh?: boolean;
  }): Promise<void> => {
    try {
      if (data.refresh === undefined) {
        data.refresh = true;
      }
      const result: any = await GetDataServer(DataAPI.BRANCH).FIND({
        search: data.search ?? "",
        limit: 10,
        page: `${data.refresh ? 1 : branchPage}`,
        filters: [["status", "=", "1"]],
      });
      if (result.data.length > 0) {
        let listInput: IListInput[] = result.data.map((item: any) => {
          return {
            name: item.name,
            value: item._id,
          };
        });
        if (!data.refresh) {
          setBranchList([...branchList, ...listInput]);
        } else {
          setBranchList([...listInput]);
        }
        setBranchHasMore(result.hasMore);
        setBranchPage(result.nextPage);
      }

      setBranchLoading(false);
      setBranchMoreLoading(false);
    } catch (error: any) {
      setBranchLoading(false);
      setBranchMoreLoading(false);
      setBranchHasMore(false);
    }
  };

  const ResetBranch = () => {
    setBranchList([]);
    setBranchHasMore(false);
    setBranchPage(1);
    setBranchLoading(true);
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

  const onSave = async (nextState?: String): Promise<any> => {
    setLoading(true);

    try {
      if (lat.valueData) {
        if (!lng.valueData) {
          throw "Please select a lng location";
        }
      }

      const inData = new FormData();
      if (nextState) {
        inData.append("nextState", `${nextState}`);
      }

      file && inData.append("img", file);
      inData.append("name", name.valueData);
      inData.append("type", type);
      inData.append("branch", branch.valueData);
      inData.append("customerGroup", group.valueData);
      inData.append("erpId", erpId.valueData);
      inData.append("address", address);
      if (lat.valueData) {
        inData.append("lat", lat.valueData);
      } else {
        inData.append("unsetLocation", "true");
      }

      if (lng.valueData) {
        inData.append("lng", lng.valueData);
      }

      let Action = id
        ? GetDataServer(DataAPI.CUSTOMER).UPDATE({ id: id, data: inData })
        : GetDataServer(DataAPI.CUSTOMER).CREATE(inData);

      const result = await Action;
      navigate(`/customer/${result.data.data._id}`);
      if (id && !file) {
        getData();
        Swal.fire({ icon: "success", text: "Saved" });
      } else {
        navigate(0);
      }
    } catch (error: any) {
      console.log(error);
      setLoading(false);
      Swal.fire(
        "Error!",
        `${
          error?.response?.data?.msg?.message ??
          error?.response?.data?.msg ??
          error ??
          "Error Insert"
        }`,
        "error"
      );
    }
    ResetBranch();
    ResetGroup();
    setLoading(false);
  };
  // Cek perubahan
  useEffect(() => {
    const actualData = {
      name: name.valueData,
      type: type,
      branch: branch.valueData,
      group: group.valueData,
      img: img,
      address: address,
      erpId: erpId.valueData,
      lat: lat.valueData,
      lng: lng.valueData,
    };
    if (JSON.stringify(actualData) !== JSON.stringify(prevData)) {
      setChangeData(true);
    } else {
      setChangeData(false);
    }
  }, [name, type, branch, group, img, address, erpId, lat, lng]);
  // End

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
                  onClick={() => navigate("/customer")}
                  className="font-bold text-lg mr-2 cursor-pointer"
                >
                  {!id ? "New Customer" : data.name}
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
                      className="h-[38px]  text-[0.93em] mb-3"
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
                      onReset={() => {
                        setName({ valueData: "", valueInput: "" });
                      }}
                    />

                    <Select
                      title="Type"
                      data={dataType}
                      value={type}
                      setValue={setType}
                      disabled={
                        id != null ? (status !== "Draft" ? true : false) : false
                      }
                    />

                    <InputComponent
                      mandatoy
                      label="Branch"
                      infiniteScroll={{
                        loading: branchMoreLoading,
                        hasMore: branchHasMore,
                        next: () => {
                          setBranchMoreLoading(true);
                          getBranch({
                            refresh: false,
                            search: branch.valueInput,
                          });
                        },
                        onSearch(e) {
                          ResetBranch();
                          getBranch({ refresh: true, search: e });
                        },
                      }}
                      onCLick={() => {
                        ResetBranch();
                        getBranch({
                          refresh: true,
                          search: branch.valueInput,
                        });
                      }}
                      loading={branchLoading}
                      modalStyle="mt-2"
                      value={branch}
                      onChange={(e) => {
                        setBranch({
                          ...branch,
                          valueInput: e,
                        });
                      }}
                      onSelected={(e) => {
                        setBranch({ valueData: e.value, valueInput: e.name });
                        setGroup({
                          valueData: null,
                          valueInput: "",
                        });

                        ResetGroup();
                      }}
                      onReset={() => {
                        ResetGroup();
                        setBranch({
                          valueData: null,
                          valueInput: "",
                        });
                        setGroup({
                          valueData: null,
                          valueInput: "",
                        });
                      }}
                      list={branchList}
                      type="text"
                      disabled={
                        id != null ? (status !== "Draft" ? true : false) : false
                      }
                      className={`h-9 mb-1`}
                    />
                    {branch.valueData && (
                      <InputComponent
                        mandatoy
                        label="Group"
                        value={group}
                        infiniteScroll={{
                          loading: GroupMoreLoading,
                          hasMore: groupHasMore,
                          next: () => {
                            getGroup();
                          },
                          onSearch(e) {
                            getGroup(e);
                          },
                        }}
                        loading={groupLoading}
                        list={groupList}
                        className="h-[38px]   text-[0.93em] mb-3"
                        onChange={(e) => {
                          ResetGroup();

                          setGroup({
                            ...group,
                            valueInput: e,
                          });
                        }}
                        onSelected={(e) => {
                          setGroup({ valueData: e.value, valueInput: e.name });
                          ResetGroup();
                        }}
                        onReset={() => {
                          ResetGroup();
                          setGroup({
                            valueData: null,
                            valueInput: "",
                          });
                        }}
                        modalStyle="mt-2"
                        disabled={
                          id != null
                            ? status !== "Draft"
                              ? true
                              : false
                            : false
                        }
                      />
                    )}
                    <InputComponent
                      label="Lat"
                      value={lat}
                      className="h-[38px]  text-[0.93em] mb-3"
                      type="number"
                      onChange={(e) =>
                        setLat({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      disabled={
                        id != null ? (status !== "Draft" ? true : false) : false
                      }
                      onReset={() => {
                        setLat({ valueData: "", valueInput: "" });
                        setLng({ valueData: "", valueInput: "" });
                      }}
                    />
                    {lat.valueData && (
                      <InputComponent
                        mandatoy
                        label="Lng"
                        value={lng}
                        className="h-[38px]  text-[0.93em] mb-3"
                        type="number"
                        onChange={(e) =>
                          setLng({
                            valueData: e,
                            valueInput: e,
                          })
                        }
                        disabled={
                          id != null
                            ? status !== "Draft"
                              ? true
                              : false
                            : false
                        }
                        onReset={() => {
                          setLng({ valueData: "", valueInput: "" });
                        }}
                      />
                    )}
                    <label className="text-sm">Address</label>
                    <textarea
                      className="border mt-1 p-2 text-[0.95em] bg-gray-50  w-full rounded-md h-[150px]"
                      name="Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={
                        id != null ? (status !== "Draft" ? true : false) : false
                      }
                    />
                  </div>
                  <div className=" w-1/2 px-4 float-left  mb-3">
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
                    <InputComponent
                      label="ErpId"
                      value={erpId}
                      className="h-[38px]  text-[0.93em] mb-3"
                      type="text"
                      onChange={(e) =>
                        setErpId({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      disabled={
                        id != null ? (status !== "Draft" ? true : false) : false
                      }
                      onReset={() => {
                        setErpId({ valueData: "", valueInput: "" });
                      }}
                    />
                    <InputComponent
                      label="Status"
                      value={{ valueData: status, valueInput: status }}
                      className="h-[38px]  text-[0.93em] mb-3"
                      type="text"
                      onChange={(e) =>
                        setCreatedAt({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      disabled
                    />
                    <InputComponent
                      label="Created By"
                      value={user}
                      className="h-[38px]   text-[0.93em] mb-3"
                      onChange={(e) =>
                        setUser({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      disabled
                    />

                    <img
                      crossOrigin="anonymous"
                      className="relative  object-contain mt-8 border shadow-sm w-[280px] h-[280px] rounded-md"
                      src={img}
                      alt={"pp"}
                      onError={(e: any) => {
                        e.target.src = ProfileImg;
                      }}
                    />
                    {(!id || (id != undefined && status === "Draft")) && (
                      <input
                        onChange={(e) => imageHandler(e)}
                        type="file"
                        name="image"
                        className="border  w-[280px] mt-1 text-sm"
                        accept="image/*"
                        ref={browseRef}
                      />
                    )}
                  </div>
                </div>
              </div>

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

export default FormCustomerPage;
