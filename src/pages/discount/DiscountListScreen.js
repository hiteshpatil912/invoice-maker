import React,{useState} from "react";
import PageTitle from "../../components/Common/PageTitle";
import CategoryTable from "../../components/Discount/CategoryTable";
import QuickAddcategory from "../../components/Discount/QuickAddCategory";

function DiscountListScreen() {

  const [ newOrUpdatedDiscount , setNewOrUpdatedDiscount] = useState(null);
  const [selectedDiscount, setSelectedDiscount] = useState(null);



  const handleUpdateDiscount = (newDiscount) =>{
    setNewOrUpdatedDiscount(newDiscount);
  }

  const handleSelectDiscount = (discount) => {
    setSelectedDiscount(discount);
  };



  return (
    <div>
      <div className="p-4">
        <PageTitle title="Discount" />
      </div>

      <div className="flex flex-wrap">
        <div className="w-full lg:w-4/6 pl-4 pr-4 sm:pl-4 sm:pr-0 mb-4 sm:mb-1">
          <CategoryTable onSelectDiscount={handleSelectDiscount} onNewOrUpdateDiscount={newOrUpdatedDiscount} />
        </div>
        <div className="w-full lg:w-2/6 pl-4 pr-4 sm:pl-4 sm:pr-2">
          <QuickAddcategory selectedDiscount={selectedDiscount} onNewUpdateDiscount={handleUpdateDiscount} />
        </div>
      </div>
    </div>
  );
}
export default DiscountListScreen;
