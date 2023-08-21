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
      <div className="w-full h-auto overflow-y-auto flex  ">
        <div className=" rounded-sm w-3/4 h-auto border border-gray-200  bg-white m-3 pt-4">
          <ReportSalesAnalytic />
        </div>
        <div className="border flex-1 p-2 my-3 ml-1 mr-4 rounded-sm bg-white"></div>
      </div>
    </>
  );
};

export default HomePage;
