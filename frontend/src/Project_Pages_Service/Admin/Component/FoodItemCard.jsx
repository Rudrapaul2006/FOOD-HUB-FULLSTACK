import axios from "axios";
import { FaPenToSquare } from "react-icons/fa6";
import { MdDelete, MdNavigateNext } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { deleteFood } from "@/Project_Pages_Service/Redux/foodSlice";


const FoodItemCard = () => {
  let navigate = useNavigate()
  let dispatch = useDispatch()

  //Search logic :
  let { foodData, searchFoodByText } = useSelector((state) => state.food)
  let filteredFood = foodData.filter(food =>
    food.foodname.toLowerCase().includes(searchFoodByText) ||
    food.category.toLowerCase().includes(searchFoodByText.toLowerCase()) ||
    food.foodtype.toLowerCase().includes(searchFoodByText) ||
    food.price <= Number(searchFoodByText)
  )

  //Delete Food item : [state manage by redux toolkit]
  let deleteFoodItem = async (foodId) => {
    let isConfirm = window.confirm("Are you sure you delete this item ?");
    if (!isConfirm) return;

    try {
      let res = await axios.delete(`${import.meta.env.VITE_food_endpoint}/delete/${foodId}`, { withCredentials: true })

      if (res.data.success) {
        dispatch(deleteFood(foodId))
        toast.success("Food deleted")
      }
    } catch (error) {
      toast.error("Delete failed");
      console.log(error)
    }
  }

  return (
    <>
      <div className="w-[97%] pb-20 lg:pb-8 lg:w-full gap-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredFood.length > 0 ? filteredFood.map((item) => (
          <div key={item._id}>
            <div className="flex flex-col h-full ml-2 rounded-lg border bg-white shadow-md hover:shadow-xl duration-300">
              <img
                src={item.image}
                alt={item.foodname}
                className="w-full h-40 object-cover rounded-t-md"
              />

              <div className="mt-2 mb-2 flex justify-between px-4">
                <span
                  onClick={() => navigate(`/updatefoodItem/${item._id}`)}
                  className="p-2 rounded-full bg-gray-300 cursor-pointer hover:text-red-600"
                >
                  <FaPenToSquare />
                </span>

                <span
                  onClick={() => deleteFoodItem(item._id)}
                  className="p-2 rounded-full bg-gray-300 cursor-pointer hover:text-red-600"
                >
                  <MdDelete size={18} />
                </span>
              </div>

              <div className="p-3 border-t-2 border-[#ff4d2d]">
                <h2 className="text-md text-[#ff4d2d] font-semibold truncate">
                  {item.foodname}
                </h2>

                <p className="text-sm text-gray-400">
                  {item.description}
                </p>

                <div className="mt-2 flex justify-between text-sm text-gray-500">
                  <span>{item.category}</span>
                  <span>{item.foodtype}</span>
                </div>

                <div className="flex justify-between mt-2">
                  <span className="font-bold text-green-600">
                    ₹{item.price}
                  </span>

                  <span className={`text-xs px-2 py-1 rounded-full ${item.isAvailable === "yes" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {item.isAvailable === "yes" ? "Available" : "Out of stock"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )) : <div className="text-gray-400 ml-2 lg:ml-0">No foods available yet</div>}
      </div>
    </>
  )
}

export default FoodItemCard;