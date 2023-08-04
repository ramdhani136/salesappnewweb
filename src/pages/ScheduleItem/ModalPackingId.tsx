import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { InputComponent } from "../../components/atoms";
import { IListInput, IValue } from "../../components/atoms/InputComponent";
import { LoadingComponent } from "../../components/moleculs";
import {
  ISliceModal,
  modalSet,
  selectModal,
} from "../../redux/slices/ModalSlice";
import { AlertModal, FilterKata } from "../../utils";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";

const ModalPackingId: React.FC = () => {
  const [allData, setAllData] = useState<IListInput[]>([]);
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingModal, setLoadingModal] = useState<boolean>(false);
  const dataModal: ISliceModal = useSelector(selectModal);
  const [limit, setLimit] = useState<number>(20);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<String>("");
  const [hasMore, setHasmore] = useState<boolean>(false);
  const [modalData, setModalData] = useState<any>({});

  const dispatch = useDispatch();

  const getData = async (): Promise<void> => {
    try {
      setLoading(true);
      const result: any = await GetDataServer(DataAPI.PACKINGID).FIND({
        filters: [
          ["item", "=", dataModal.props.item_code],
          ["is_out", "=", 0],
          ["is_in", "=", 1],
        ],
        limit: limit,
        page: page,
        search: search,
      });

      if (result.data.length > 0) {
        const genData: IListInput[] = result.data.map(
          (item: any): IListInput => {
            return {
              name: item.id_packing,
              value: item,
            };
          }
        );

        if (result.data.length < limit) {
          setHasmore(false);
        } else {
          setHasmore(result.hasMore);
        }

        setPage(result.nextPage);
        setAllData([...allData, ...genData]);
        setLoading(false);
      }
    } catch (error) {
      setHasmore(false);
      setLoading(false);
    }
  };

  const [packingId, setPackingId] = useState<IValue>({
    valueData: null,
    valueInput: "",
  });

  const [actualQty, setActualQty] = useState<IValue>({
    valueData: 0,
    valueInput: "",
  });

  const [barcode, setBarcode] = useState<IValue>({
    valueData: true,
    valueInput: "Barcode",
  });

  const onSave = async (): Promise<void> => {
    const onProgress = async (): Promise<void> => {
      try {
        setLoadingModal(true);
        const insertData = {
          scheduleItemId: dataModal.props._id,
          actual_qty: actualQty.valueData,
          id_packing: packingId.valueData,
          barcode: barcode.valueData,
        };

        if (modalData._id) {
          await GetDataServer(DataAPI.PACKING).UPDATE({
            data: { actual_qty: actualQty.valueData },
            id: modalData._id,
          });
        } else {
          await GetDataServer(DataAPI.PACKING).CREATE(insertData);
        }
        AlertModal.Default({
          icon: "success",
          text: "Successfully added data",
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
        console.log(error);
        AlertModal.Default({
          icon: "error",
          title: "Error",
          text: error.response.data.msg.code
            ? "Data already exists"
            : error.response.data.msg ?? "Network Error!",
        });
      }
    };
    if (!barcode.valueData) {
      AlertModal.Default({
        icon: "error",
        title: "Error",
        text: "barcode is required",
      });
    }
    AlertModal.confirmation({ onConfirm: onProgress });
  };

  useEffect(() => {
    getData();
  }, [search]);

  useEffect(() => {
    if (dataModal.props.params) {
      setModalData(dataModal.props.params);
    }
  }, []);

  useEffect(() => {
    if (modalData.id_packing) {
      setPackingId({
        valueData: modalData.id_packing,
        valueInput: modalData.id_packing,
      });
      setActualQty({
        valueData: modalData.actual_qty,
        valueInput: modalData.actual_qty,
      });
      setData(modalData);
    }
  }, [modalData]);

  const checkDupl = (packingId: string): void => {
    const dupl = dataModal.props.data.find((item: any) => {
      return item.id_packing == packingId;
    });

    if (dupl) {
      setModalData(dupl);
    } else {
      setModalData({});
    }
  };

  return (
    <div className=" w-[450px] max-h-[95vh] scrollbar-thin scrollbar-track-gray-100 p-7 scrollbar-thumb-gray-200">
      {loadingModal ? (
        <LoadingComponent />
      ) : (
        <>
          <InputComponent
            value={barcode}
            onChange={(e) =>
              setBarcode({
                ...barcode,
                valueInput: e,
              })
            }
            onSelected={(e) => {
              setBarcode({
                valueData: e.value,
                valueInput: e.name,
              });
              setPackingId({ valueData: "", valueInput: "" });
              setData({});
            }}
            onReset={() => {
              setBarcode({ valueData: null, valueInput: "" });
              setPackingId({ valueData: "", valueInput: "" });
              setData({});
            }}
            label="Type"
            className="mb-2 text-sm"
            list={[
              { name: "Barcode", value: true },
              { name: "Manual", value: false },
            ]}
          />

          {dataModal.props.schedule.allow.barcode && barcode.valueData && (
            <InputComponent
              disabled={dataModal.props.schedule.status != 1}
              infiniteScroll={{
                hasMore: hasMore,
                next: getData,
                onSearch: (e) => {
                  setAllData([]);
                  setHasmore(false);
                  setPage(1);
                  setSearch(FilterKata({ kata: e, filter: ["R", "P", "I"] }));
                },
                loading: loading,
              }}
              onCLick={getData}
              value={packingId}
              list={allData}
              label="Packing ID"
              loading={false}
              onChange={(e) => {
                setPackingId({ ...packingId, valueInput: e });
              }}
              onSelected={(e) => {
                checkDupl(e.value.id_packing);
                setData(e.value),
                  setPackingId({
                    valueData: e.value.id_packing,
                    valueInput: e.value.id_packing,
                  });
              }}
              className="mb-2 text-sm"
              onReset={() => {
                setPackingId({ valueData: null, valueInput: "" });
                setData({});
                setActualQty({ valueData: 0, valueInput: "" });
                setModalData({});
              }}
            />
          )}

          <InputComponent
            value={{
              valueData: dataModal.props.item_code,
              valueInput: dataModal.props.item_code,
            }}
            label="Item Code"
            className="mb-2 text-sm"
            disabled
          />

          <InputComponent
            value={{
              valueData: dataModal.props.item_name,
              valueInput: dataModal.props.item_name,
            }}
            label="Item Name"
            className="mb-2 text-sm"
            disabled
          />

          {dataModal.props.schedule.allow.barcode && data.conversion && (
            <InputComponent
              value={{
                valueData: data.conversion,
                valueInput: data.conversion.toLocaleString(),
              }}
              label="Qty"
              className="mb-2 text-sm"
              disabled
            />
          )}
          {/* {data.conversion && ( */}
          <InputComponent
            disabled={dataModal.props.schedule.status != 1}
            value={actualQty}
            onChange={(e) => {
              if (barcode.valueData) {
                if (e <= data.conversion && e >= 0) {
                  setActualQty({ valueData: e, valueInput: e });
                } else {
                  setActualQty({
                    valueData: data.conversion,
                    valueInput: data.conversion,
                  });
                }
              } else {
                setActualQty({
                  valueData: e,
                  valueInput: e,
                });
              }
            }}
            onReset={() => setActualQty({ valueData: 0, valueInput: "" })}
            mandatoy
            label="Actual Stock"
            className="mb-2 text-sm"
            type="number"
            max={barcode.valueData && data.conversion}
          />
          {/* )} */}

          <InputComponent
            value={{
              valueData: dataModal.props.stock_uom,
              valueInput: dataModal.props.stock_uom,
            }}
            label="Uom"
            disabled
            className="mb-2 text-sm"
          />

          {/* {actualQty.valueInput && dataModal.props.schedule.status == 1 && ( */}
          <button
            onClick={onSave}
            className="cursor-pointer border mt-2 border-green-700 w-full rounded-md py-2 bg-green-600   text-sm text-white opacity-90 hover:opacity-100"
          >
            {modalData.id_packing ? "Update" : "Save"}
          </button>
          {/* )} */}
        </>
      )}
    </div>
  );
};

export default ModalPackingId;
