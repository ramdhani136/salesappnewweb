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
import ProfileImg from "../../assets/images/iconuser.jpg";
import Swal from "sweetalert2";
import { Alert, Snackbar } from "@mui/material";

const SettingPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const metaData = {
    title: `Settings - Sales App Ekatunggal`,
    description: "Halaman form User sales web system",
  };

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

  const [loading, setLoading] = useState<boolean>(false);
  const [listMoreAction, setListMoreAction] = useState<IListIconButton[]>([]);

  const getData = async (): Promise<void> => {};

  const onSave = async (): Promise<void> => {};

  useEffect(() => {}, []);

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
                  Settings
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

                {/* {isChangeData && ( */}
                {/* <IconButton
                  name="Update"
                  callback={onSave}
                  className={`opacity-80 hover:opacity-100 duration-100  `}
                /> */}
                {/* )} */}
              </div>
            </div>
            <div className=" px-5 flex flex-col ">
              <ToggleBodyComponent
                name="Visit"
                child={
                  <div className="flex">
                    <div className="flex-1 flex">
                      <div className="flex-1 mr-6">
                        <InputComponent
                          label="Check In Distance (Meters)"
                          placeholder="0"
                          value={username}
                          onChange={(e) =>
                            setUserName({ valueData: e, valueInput: e })
                          }
                          type="number"
                          min={0}
                          //   disabled={disabled}
                          className={`h-9 mb-3`}
                        />

                        <InputComponent
                          label="Mandatory Tags"
                          value={phone}
                          onChange={(e) =>
                            setPhone({ valueData: e, valueInput: e })
                          }
                          type="text"
                          //   disabled={disabled}
                          className={`h-9 mb-1`}
                        />
                        <div className="w-full h-14 rounded-sm border"></div>
                      </div>
                      <div className="flex-1">
                        <InputComponent
                          label="Check Out Distance (Meters)"
                          placeholder="0"
                          value={name}
                          onChange={(e) =>
                            setName({ valueData: e, valueInput: e })
                          }
                          type="number"
                          min={0}
                          className={`h-9 mb-3`}
                        />
                        <InputComponent
                          label="Notes Length"
                          value={email}
                          onChange={(e) =>
                            setEmail({ valueData: e, valueInput: e })
                          }
                          placeholder="0"
                          min={0}
                          type="number"
                          className={`h-9 mb-3`}
                        />
                      </div>
                    </div>
                  </div>
                }
              />
              <ToggleBodyComponent
                name="Callsheet"
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
              <ToggleBodyComponent
                name="Customer"
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

export default SettingPage;
