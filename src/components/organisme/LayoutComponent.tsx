import { useEffect, useRef, useState } from "react";
import { LocalStorage, LocalStorageType, SocketIO } from "../../utils";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import SidebarComponent from "./SidebarComponent";
import HeaderComponent from "./HeaderComponent";
import { ModalComponent } from "../moleculs";
import { useDispatch, useSelector } from "react-redux";
import {
  ISliceModal,
  modalSet,
  selectModal,
} from "../../redux/slices/ModalSlice";
import ChatsComponent from "./ChatsComponent";

interface IProps {
  Child: React.FC;
  sideBarWidth?: boolean;
}

const LayoutComponent: React.FC<IProps> = ({ Child, sideBarWidth = false }) => {
  const [user, setUser] = useState<any>({});
  const dataModal: ISliceModal = useSelector(selectModal);

  const GetSocket = (): void => {
    SocketIO.emit("join", LocalStorage.getUser());
  };

  const navigate = useNavigate();
  useEffect(() => {
    GetSocket();
    const token = LocalStorage.loadData(LocalStorageType.TOKEN);
    if (token) {
      const decoded: any = jwt_decode(token);
      setUser(decoded);
    } else {
      navigate("/login");
    }
  }, []);

  const ChildModal: React.FC<any> | null = dataModal.Children ?? null;
  const dispatch = useDispatch();
  const [isSideBarStatus, setSideBarStatus] = useState<boolean>(false);
  const onCLose = () => {
    dispatch(
      modalSet({
        active: false,
        Children: null,
        title: "",
        props: {},
        className: "",
      })
    );
  };

  const GetStatusSB = (status: boolean) => {
    setSideBarStatus(status);
  };

  return (
    <>
      <div className="flex h-screen relative overflow-hidden">
        <ModalComponent
          isVisible={dataModal.active}
          onClose={onCLose}
          child={ChildModal}
          props={dataModal.props}
          className={dataModal.className ?? ""}
        />
        <SidebarComponent user={user} getStatusOpen={GetStatusSB} />
        <div className={`bg-gray-100 flex-1 flex flex-col  ${
              sideBarWidth
                ? isSideBarStatus
                  ? `w-[calc(100%-210px)]`
                  : "w-[calc(100%-65px)]"
                : "w-full"
            }`}>
          <HeaderComponent />
          <section className={`w-full flex-1 h-[90vh]`}>
            <Child />
          </section>
        </div>
        {/* <ChatsComponent /> */}
      </div>
    </>
  );
};

export default LayoutComponent;
