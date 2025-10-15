import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

// Helper function untuk tanggal lokal - TAMBAHKAN DI SINI
const getLocalDateString = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const timezoneOffset = d.getTimezoneOffset() * 60000;
  const localDate = new Date(d.getTime() - timezoneOffset);
  return localDate.toISOString().split("T")[0];
};

const DatePicker = ({ value, onChange, placeholder = "Pilih tanggal..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const datePickerRef = useRef(null);

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handleDateSelect = (day) => {
    if (!day) return;

    // FIX: Create date with proper timezone handling
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

    // FIX: Use local date to avoid timezone issues
    const formattedDate = getLocalDateString(newDate);

    setSelectedDate(newDate);
    onChange({ target: { value: formattedDate } });

    // FIX: Add small delay before closing for better UX
    setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day) => {
    if (!day || !selectedDate) return false;
    return day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth() && currentDate.getFullYear() === selectedDate.getFullYear();
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return placeholder;

    // FIX: Better date parsing to avoid timezone issues
    const [year, month, day] = dateString.split("-");
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const selectToday = () => {
    const today = new Date();
    const formattedDate = getLocalDateString(today);

    setSelectedDate(today);
    setCurrentDate(today);
    onChange({ target: { value: formattedDate } });

    setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const clearDate = () => {
    setSelectedDate(null);
    onChange({ target: { value: "" } });

    setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const calendarDays = generateCalendar();

  return (
    <div ref={datePickerRef} className="relative">
      {/* Input Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left bg-white border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 flex items-center justify-between"
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>{formatDisplayDate(value)}</span>
        <CalendarIcon className="h-4 w-4 text-gray-400" />
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop with smooth animation */}
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300" onClick={() => setIsOpen(false)} />

          {/* Calendar with smooth animation */}
          <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-xl shadow-2xl w-80 transition-all duration-300 scale-100 opacity-100">
            {/* Calendar Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="text-lg font-semibold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </div>

                <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(day)}
                    disabled={!day}
                    className={`
                      h-8 rounded-lg text-sm font-medium transition-all duration-200
                      ${!day ? "invisible" : ""}
                      ${isToday(day) ? "bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200" : ""}
                      ${isSelected(day) ? "bg-blue-600 text-white shadow-lg hover:bg-blue-700" : ""}
                      ${day && !isToday(day) && !isSelected(day) ? "text-gray-700 hover:bg-gray-100 hover:text-gray-900" : ""}
                    `}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-3 bg-gray-50 rounded-b-xl">
              <div className="flex space-x-2">
                <button onClick={clearDate} className="flex-1 py-2 px-3 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 font-medium">
                  Hapus
                </button>
                <button onClick={selectToday} className="flex-1 py-2 px-3 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium">
                  Hari ini
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DatePicker;
