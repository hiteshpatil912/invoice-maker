import React from "react";
import PageTitle from "../../components/Common/PageTitle";
import CategoryTable from "../../components/Discount/CategoryTable";
import QuickAddcategory from "../../components/Discount/QuickAddCategory";

function DiscountListScreen() {
  return (
    <div>
      <div className="p-4">
        <PageTitle title="Discount" />
      </div>

      <div className="flex flex-wrap">
        <div className="w-full lg:w-4/6 pl-4 pr-4 sm:pl-4 sm:pr-0 mb-4 sm:mb-1">
          <CategoryTable />
        </div>
        <div className="w-full lg:w-2/6 pl-4 pr-4 sm:pl-4 sm:pr-2">
          <QuickAddcategory />
        </div>
      </div>
    </div>
  );
}
export default DiscountListScreen;
