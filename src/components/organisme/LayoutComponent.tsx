import { useEffect, useState } from "react";
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
}

const LayoutComponent: React.FC<IProps> = ({ Child }) => {
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

  const onCLose = () => {
    dispatch(
      modalSet({
        active: false,
        Children: null,
        title: "",
        props: null,
      })
    );
  };

  return (
    <>
      <div className="flex h-screen relative overflow-y-hidden">
        <ModalComponent
          isVisible={dataModal.active}
          onClose={onCLose}
          child={ChildModal}
        />
        {<SidebarComponent user={user} />}
        <div className="bg-gray-100 flex-1">
          <HeaderComponent />
          <section className=" w-full h-[86vh]">
            <Child />
          </section>
        </div>
        <ChatsComponent />
      </div>
    </>
  );
};

export default LayoutComponent;
