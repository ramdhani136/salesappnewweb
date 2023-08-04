import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { InputComponent } from "../../components/atoms";
import { IValue } from "../../components/atoms/InputComponent";
import { LoadingComponent } from "../../components/moleculs";
import {
  ISliceModal,
  modalSet,
  selectModal,
} from "../../redux/slices/ModalSlice";
import { AlertModal, FilterKata } from "../../utils";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";

const ModalSetSTockManual: React.FC = () => {
  const [loadingModal, setLoadingModal] = useState<boolean>(false);
  const dispatch = useDispatch();
  const dataModal: ISliceModal = useSelector(selectModal);
  const data = dataModal.props.params;
  const [qty, setQty] = useState<IValue>({
    valueData: data.real_qty,
    valueInput: `${data.real_qty}`,
  });

  const onSave = async (): Promise<void> => {
    const onProgress = async (): Promise<void> => {
      try {
        setLoadingModal(true);
        let insertData = {};
        if (data.real_qty == qty.valueData) {
          insertData = {
            status: 1,
          };
        } else {
          insertData = {
            real_qty: qty.valueData,
          };
        }
        await GetDataServer(DataAPI.SCHEDULEITEM).UPDATE({
          data: insertData,
          id: data._id,
        });

        AlertModal.Default({
          icon: "success",
          text: "Successfully",
          title: "Success",
        });
        dataModal.props.onRefresh();
        dispatch(
          modalSet({
            active: false,
            Children: null,
            title: "",
            props: null,
          })
        );
      } catch (error: any) {
        setLoadingModal(false);
        AlertModal.Default({
          icon: "error",
          title: "Error",
          text: error.response.data.msg.code
            ? "Data already exists"
            : error.response.data.msg ?? "Network Error!",
        });
      }
    };
    AlertModal.confirmation({ onConfirm: onProgress });
  };

  return (
    <div className=" w-[450px] h-[auto] max-h-[400px]scrollbar-thin scrollbar-track-gray-100 p-7 scrollbar-thumb-gray-200">
      {loadingModal ? (
        <LoadingComponent />
      ) : (
        <>
          <InputComponent
            label="Item Code"
            value={{ valueData: data.item_code, valueInput: data.item_code }}
            className="mb-2"
            disabled
            inputStyle="text-sm"
          />
          <InputComponent
            label="Item Name"
            value={{ valueData: data.item_name, valueInput: data.item_name }}
            className="mb-2"
            disabled
            inputStyle="text-sm"
          />
          <InputComponent
            label="Stock Qty"
            value={{
              valueData: data.actual_qty,
              valueInput: data.actual_qty.toLocaleString(),
            }}
            className="mb-2"
            disabled
            inputStyle="text-sm"
          />
          <InputComponent
            label="Real Qty"
            disabled={data.status == "1"}
            value={{
              valueData: qty.valueData,
              valueInput: qty.valueInput,
            }}
            className="mb-2"
            onChange={(e) => {
              if (e == 0) {
                setQty({
                  valueData: e,
                  valueInput: "",
                });
              } else if (e < data.actual_qty) {
                setQty({ valueData: e, valueInput: e });
              } else {
                setQty({
                  valueData: parseFloat(data.actual_qty),
                  valueInput: `${data.actual_qty}`,
                });
              }
            }}
            min={0}
            type="number"
            inputStyle="text-sm"
          />
          <InputComponent
            label="UOM"
            value={{ valueData: data.stock_uom, valueInput: data.stock_uom }}
            className="mb-2"
            disabled
            inputStyle="text-sm"
          />
          <InputComponent
            label="Status"
            value={{
              valueData: data.status,
              valueInput: data.status == "0" ? "Open" : "Checked",
            }}
            className="mb-3"
            disabled
            inputStyle="text-sm"
          />
          <button
            onClick={onSave}
            className="cursor-pointer border mt-2 border-green-700 w-full rounded-md py-2 bg-green-600   text-sm text-white opacity-90 hover:opacity-100"
          >
            {data.status == "1"
              ? "Reopen"
              : data.real_qty == qty.valueData
              ? `Submit`
              : "Update"}
          </button>
        </>
      )}
    </div>
  );
};

export default ModalSetSTockManual;
