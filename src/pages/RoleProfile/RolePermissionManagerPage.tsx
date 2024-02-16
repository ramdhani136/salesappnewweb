import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  ButtonStatusComponent,
  IconButton,
  InputComponent,
  Select,
} from "../../components/atoms";
import { IValue } from "../../components/atoms/InputComponent";
import { LoadingComponent } from "../../components/moleculs";
import moment from "moment";
import { AlertModal, LocalStorage, Meta } from "../../utils";

import { IListIconButton } from "../../components/atoms/IconButton";
import Swal from "sweetalert2";
import { modalSet } from "../../redux/slices/ModalSlice";
import { useDispatch } from "react-redux";

const RolePermissionManagerPage: React.FC<any> = ({ props }) => {
  const modal = props ? props.modal ?? false : false;
  let { id } = useParams();
  const [data, setData] = useState<any>({});
  const metaData = {
    title: `Role Permission Manafer - Sales App Ekatunggal`,
    description: "Halaman role permission manager - Sales web system",
  };

  const navigate = useNavigate();

  const [scroll, setScroll] = useState<number>(0);

  const [isChangeData, setChangeData] = useState<boolean>(false);

  const [user, setUser] = useState<IValue>({
    valueData: LocalStorage.getUser()._id,
    valueInput: LocalStorage.getUser().name,
  });
  const [name, setName] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [status, setStatus] = useState<string>("1");

  const statusType: any[] = [
    { title: "Disabled", value: "0" },
    { title: "Enabled", value: "1" },
  ];

  const [prevData, setPrevData] = useState<any>({
    name: name.valueData,
    status: status,
  });

  const [createdAt, setCreatedAt] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });

  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(true);

  const [listMoreAction, setListMoreAction] = useState<IListIconButton[]>([]);

  const getData = async (): Promise<void> => {
    try {
      const result = await GetDataServer(DataAPI.ROLEPROFILE).FINDONE(`${id}`);

      setStatus(result.data.status);

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

      setPrevData({
        name: result.data.name,
        status: result.data.status,
      });

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      AlertModal.Default({
        icon: "error",
        title: "Error",
        text: "Data not found!",
      });

      navigate("/roleprofile");
    }
  };

  const onDelete = (): void => {
    if (id) {
      const progress = async (): Promise<void> => {
        setLoading(true);
        try {
          await GetDataServer(DataAPI.ROLEPROFILE).DELETE(`${id}`);
          navigate("/roleprofile");
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
        status: status,
      };
      if (nextState) {
        data.nextState = nextState;
      }

      let Action =
        id && !modal
          ? GetDataServer(DataAPI.ROLEPROFILE).UPDATE({ id: id, data: data })
          : GetDataServer(DataAPI.ROLEPROFILE).CREATE(data);

      const result = await Action;

      if (id && !modal) {
        getData();
        Swal.fire({ icon: "success", text: "Saved" });
      } else if (modal) {
        props.Callback(result.data?.data ?? {});
        dispatch(
          modalSet({
            active: false,
            Children: null,
            title: "",
            props: {},
            className: "",
          })
        );
      } else {
        navigate(`/roleprofile/${result.data.data._id}`);
        navigate(0);
      }
    } catch (error: any) {
      Swal.fire(
        "Error!",
        `${
          error.response.data.msg
            ? error.response.data.msg
            : error.message
            ? error.message
            : "Error Insert"
        }`,
        "error"
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id && !modal) {
      getData();
      setListMoreAction([{ name: "Delete", onClick: onDelete }]);
    } else {
      setLoading(false);
      setListMoreAction([]);
    }

    if (modal) {
      setName({ valueData: props.name, valueInput: props.name });
    }
  }, []);

  // Cek perubahan
  useEffect(() => {
    const actualData = {
      name: name.valueData,
      status: status,
    };
    if (JSON.stringify(actualData) !== JSON.stringify(prevData)) {
      setChangeData(true);
    } else {
      setChangeData(false);
    }
  }, [name, status]);
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
                  callback={() => {}}
                  className={`opacity-80 hover:opacity-100 duration-100  `}
                />
              </div>
            </div>
            <div className=" px-5 flex flex-col ">
              <div className="border w-full flex-1  bg-white rounded-md overflow-y-scroll scrollbar-none">
                <div className="w-full h-auto  float-left rounded-md  py-2">
                  <div className="py-3 w-full border-b border-gray-100 float-left px-3 text-[0.95em]">
                    <select
                      name="doc"
                      className="w-[230px] border border-gray-200 bg-[#f4f5f7] rounded-md py-[2px] px-2"
                    >
                      <option value="schedule">Schedule</option>
                      <option value="visit">Visit</option>
                    </select>
                    <select
                      name="role"
                      className="w-[230px] ml-2 border border-gray-200 bg-[#f4f5f7] rounded-md py-[2px] px-2"
                    >
                      <option value="schedule">Schedule</option>
                      <option value="visit">Visit</option>
                    </select>
                  </div>
                </div>
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
                    <tr className="border-b border-gray-100 border-collapse">
                      <td className="px-3 py-8 align-top">Visit</td>
                      <td className="align-top  py-8">Sales Manager</td>
                      <td className="align-top  py-8">
                        <div className="w-full flex text-[0.95em]">
                          <ul className="flex-1">
                            <li className="flex items-center mb-2">
                              <input
                                type="checkbox"
                                name=""
                                className="mr-1 mt-1"
                              />
                              <h4>Create</h4>
                            </li>
                            <li className="flex items-center mb-2">
                              <input
                                type="checkbox"
                                name=""
                                className="mr-1 mt-1"
                              />
                              <h4>Cancel</h4>
                            </li>
                          </ul>
                          <ul className="flex-1">
                            <li className="flex items-center">
                              <input
                                type="checkbox"
                                name=""
                                className="mr-1 mt-1"
                              />
                              <h4>Read</h4>
                            </li>
                          </ul>
                          <ul className="flex-1">
                            <li className="flex items-center">
                              <input
                                type="checkbox"
                                name=""
                                className="mr-1 mt-1"
                              />
                              <h4>Write</h4>
                            </li>
                          </ul>
                        </div>
                      </td>
                      <td className="px-3 align-top  py-8"></td>
                    </tr>
                  </tbody>
                </table>
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

export default RolePermissionManagerPage;
