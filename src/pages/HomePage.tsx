import { Meta } from "../utils";

const HomePage: React.FC = () => {
  const metaData = {
    title: "Home -  Stock Opname App Ekatunggal",
    description: "Halaman utama stock opname web system",
  };
  return (
    <>
      {Meta(metaData)}
      <div className="w-full h-full overflow-y-auto">
        <div className=" w-1/2 h-96 border border-gray-200  bg-white m-3 "></div>
      </div>
    </>
  );
};

export default HomePage;
