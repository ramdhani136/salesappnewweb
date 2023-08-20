import { ReportSalesAnalytic } from "../components/organisme";
import { Meta } from "../utils";

const HomePage: React.FC = () => {
  const metaData = {
    title: "Home -  Stock Opname App Ekatunggal",
    description: "Halaman utama stock opname web system",
  };
  return (
    <>
      {Meta(metaData)}
      <div className="w-full h-full overflow-y-auto flex px-2">
        <div className=" rounded-sm w-2/3 h-auto border border-gray-200  bg-white m-3 ">
          <h4 className="p-2 font-bold ml-3 text-lg">Sales Analytics</h4>
          <ReportSalesAnalytic />
        </div>
        <div className="border flex-1 p-2 my-3 ml-3 mr-4 rounded-sm bg-white h-[100%-100px]"></div>
      </div>
    </>
  );
};

export default HomePage;
