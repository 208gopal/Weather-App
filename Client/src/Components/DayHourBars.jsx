export const DayForecast = ({ day, temp, condition, isToday, isSelected, onClick, dayIndex }) => (
  <div 
    className={`text-center px-2 py-2 cursor-pointer transition-all duration-200 w-16 ${
      isSelected 
        ? 'bg-blue-500 text-white rounded-xl font-semibold shadow-md' 
        : isToday 
          ? 'bg-gray-100 rounded-xl font-semibold hover:bg-gray-200' 
          : 'hover:bg-gray-50 rounded-xl'
    }`}
    onClick={() => onClick(dayIndex)}
  >
    <div className="text-xs">{day}</div>
    <div className="text-sm font-bold">{temp}&deg;</div>
    <div className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>{condition}</div>
  </div>
);

export const HourForecast = ({ time, temp, condition }) => (
  <div className="bg-gray-100 rounded-xl p-2 text-center w-20 border border-gray-200 flex flex-col gap-2 justify-between items-center 
                  transition duration-200 ease-in-out hover:-translate-y-1 hover:shadow-md hover:border-gray-400">
    <div className="text-gray-700 text-xs font-semibold">{time}</div>
    <div className="text-[#696969] text-lg font-medium">{temp}&deg;</div>
    <div className="text-xs text-gray-500">{condition}</div>
  </div>
);